# Daily progress and streak contract

## Canonical streak day

`user_streak.lastCompletedDate` is the single stored date for a user's streak. It is a PostgreSQL `DATE`, encoded as the UTC-midnight representation of an Asia/Kolkata calendar day. Reads, freshness checks, and compare-and-set writes all use that same date value.

A game advances the streak only when all of the following hold at completion time:

1. The game exists and is `published`.
2. Its `scheduledFor` IST date equals today's IST date.
3. The user's saved progress is on the final configured engine stage and that stage has `stagePassed = true`.

Published historical games remain completable from the library. Their progress and stars are saved, but they do not change `user_streak`.

## Progress write flow

```mermaid
sequenceDiagram
    participant UI as Gameplay engine
    participant Sync as POST /api/progress/sync
    participant DB as Postgres
    participant Complete as POST /api/progress/complete
    participant Streak as Streak service

    UI->>Sync: gameId + in-progress snapshot
    Sync->>DB: validate against game config; merge under row lock
    DB-->>Sync: saved in-progress snapshot
    UI->>Complete: gameId only
    Complete->>DB: lock progress row + load game
    DB->>DB: verify published game and saved final stage pass
    Complete->>DB: mark completed; calculate stars from stored counts
    alt published game's scheduled IST day is today
        Complete->>Streak: recordCompletionForStreak(now)
        Streak->>DB: compare-and-set lastCompletedDate
    else historical game
        Note over Complete,Streak: No streak mutation
    end
    DB-->>UI: authoritative completed result
```

Sync never marks progress completed and never records a streak. Completion is a separate, idempotent operation. Concurrent completion requests serialize on the progress row: the first valid request completes it and updates the streak in the same transaction; later requests return the already-stored result without counting again.

## Streak transition

```mermaid
flowchart TD
    A[Valid completion of today's published game] --> B{lastCompletedDate is today?}
    B -- Yes --> C[No streak change: idempotent]
    B -- No --> D{lastCompletedDate is yesterday?}
    D -- Yes --> E[currentStreak = currentStreak + 1]
    D -- No --> F[currentStreak = 1]
    E --> G[longestStreak = max(longestStreak, currentStreak)]
    F --> G
    G --> H[CAS update lastCompletedDate to today's IST date]
```

When reading the streak, a stored date of today or yesterday is live; anything older displays as a current streak of zero. The historical best remains unchanged. The seven-day strip is derived from completed `daily_game_progress` rows whose game's scheduled IST day matches the completion IST day, so replaying an old game does not strike today's cell.

## Failed completion requests

Before sending `/complete`, the browser stores a pending-completion marker alongside its local progress snapshot. It removes both only after a successful response. Network errors and 5xx responses are retried with exponential backoff, on connectivity/focus events, at the next gameplay mount, and on the next app load. Any 2xx/4xx response is terminal and clears the marker; local progress is cleared only on 2xx. Markers older than seven days (or with invalid/future timestamps) are discarded to prevent endless retries. The retry re-sends the saved in-progress snapshot before requesting completion.

If a retry succeeds only after midnight IST, the game is completed and saved, but it no longer counts toward the streak because it is no longer today's game. This is intentional.

## Request contracts and validation

- `POST /api/progress/start`: `{ gameId }`
- `GET /api/progress/sync?gameId=...`
- `POST /api/progress/sync`: `{ gameId, version, updatedAt, currentSubStage, attemptsRemaining, stagePassed, score, correctAnswers, totalAnswers, hintsRemaining }`
- `POST /api/progress/complete`: `{ gameId }`; submitted score/count fields are ignored.

Sync validates non-negative safe integers, answer-count ordering, the configured stage range, attempts for the selected stage, and the fixed hint budget before persisting. Completion applies the same validation to the stored row and verifies the final-stage pass. Answer-by-answer verification and answer-key secrecy are intentionally outside this contract.

> **Known limitation:** `/sync` is client-driven. A modified client can submit a passing stage state and then call `/complete`. Server-side verification of individual answers is intentionally not implemented yet. Do not use streaks for leaderboards, prizes, or other rewards until answer verification is added.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  cache.set(filename, mod);
  mod.require = (id) => {
    if (id === 'server-only') return {};
    if (id.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filename), id);
      return load(path.relative(root, resolved.endsWith('.ts') ? resolved : `${resolved}.ts`));
    }
    return require(id);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, filename);
  return mod.exports;
}

const { validateSnapshotForGame } = load('src/features/gameplay/progress/validation.ts');
const { dayKeyToDate, isGameAvailable, isGameScheduledForToday, toIsoDay } = load('src/features/streak/dates.ts');
const { recordCompletionForStreak } = load('src/features/streak/record-completion.server.ts');
const {
  markPendingCompletion,
  pendingCompletionKey,
  pruneExpiredPendingCompletions,
  retryPendingCompletion,
} = load('src/features/gameplay/progress/pending-completions.ts');

function snapshot(overrides = {}) {
  return {
    version: 1,
    updatedAt: 100,
    currentStage: 1,
    attemptsRemaining: 2,
    score: 100,
    correctAnswers: 1,
    totalAnswers: 2,
    stagePassed: false,
    hintsRemaining: 2,
    interactionState: {},
    ...overrides,
  };
}

const game = {
  type: 'swipe',
  content: { subStages: [{ attemptsAllowed: 3 }, { attemptsAllowed: 2 }] },
};

test('server snapshot validation enforces stage config and integer ranges', () => {
  assert.equal(validateSnapshotForGame(snapshot(), game), null);
  assert.match(validateSnapshotForGame(snapshot({ score: -1 }), game), /non-negative integers/);
  assert.match(validateSnapshotForGame(snapshot({ score: 1.5 }), game), /non-negative integers/);
  assert.match(validateSnapshotForGame(snapshot({ currentStage: 2 }), game), /stage range/);
  assert.match(validateSnapshotForGame(snapshot({ attemptsRemaining: 3 }), game), /allowance/);
  assert.match(validateSnapshotForGame(snapshot({ hintsRemaining: 4 }), game), /hint budget/);
  assert.match(validateSnapshotForGame(snapshot({ correctAnswers: 3 }), game), /cannot exceed/);
});

test('IST game scheduling allows replays, rejects future days, and counts only today', () => {
  const now = new Date('2026-10-06T12:00:00.000Z');
  assert.equal(isGameAvailable(dayKeyToDate('2026-10-05'), now), true);
  assert.equal(isGameAvailable(dayKeyToDate('2026-10-06'), now), true);
  assert.equal(isGameAvailable(dayKeyToDate('2026-10-07'), now), false);
  assert.equal(isGameScheduledForToday(dayKeyToDate('2026-10-05'), now), false);
  assert.equal(isGameScheduledForToday(dayKeyToDate('2026-10-06'), now), true);
});

test('failed completion retry retains marker and snapshot until server success', async () => {
  const values = new Map();
  const storage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
  const userId = 'user-1';
  const gameId = 'game-1';
  const progressKey = `loop_progress_${JSON.stringify([userId, gameId])}`;
  storage.setItem(progressKey, JSON.stringify(snapshot({ currentStage: 1, stagePassed: true })));
  const markerKey = markPendingCompletion(storage, userId, gameId);
  assert.equal(markerKey, pendingCompletionKey(userId, gameId));

  let failCompletionOnce = true;
  const requests = [];
  const fetcher = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    if (url.endsWith('/complete') && failCompletionOnce) {
      failCompletionOnce = false;
      return { ok: false, status: 503 };
    }
    return { ok: true, json: async () => ({}) };
  };

  assert.equal(await retryPendingCompletion(markerKey, storage, fetcher), false);
  assert.notEqual(storage.getItem(markerKey), null);
  assert.notEqual(storage.getItem(progressKey), null);

  assert.equal(await retryPendingCompletion(markerKey, storage, fetcher), true);
  assert.equal(storage.getItem(markerKey), null);
  assert.equal(storage.getItem(progressKey), null);
  assert.deepEqual(requests.map((request) => request.url), [
    '/api/progress/sync', '/api/progress/complete',
    '/api/progress/sync', '/api/progress/complete',
  ]);
  assert.deepEqual(requests[1].body, { gameId });
});

test('streak uses the single lastCompletedDate for increment, reset, and idempotence', async () => {
  async function record(lastDay, currentStreak, longestStreak, updateCount = 1) {
    const row = {
      currentStreak,
      longestStreak,
      lastCompletedDate: lastDay ? dayKeyToDate(lastDay) : null,
    };
    let update;
    const tx = {
      userStreak: {
        async createMany() {},
        async findUniqueOrThrow() { return row; },
        async updateMany(args) { update = args; return { count: updateCount }; },
      },
    };
    const result = await recordCompletionForStreak(tx, 'user-1', dayKeyToDate('2026-10-06'));
    return { result, update };
  }

  const first = await record(null, 0, 0);
  assert.equal(first.result.current, 1);
  assert.equal(first.result.longest, 1);
  assert.equal(first.update.data.lastCompletedDate.toISOString().slice(0, 10), '2026-10-06');

  const continued = await record('2026-10-05', 4, 4);
  assert.equal(continued.result.current, 5);
  assert.equal(continued.result.longest, 5);

  const reset = await record('2026-10-04', 4, 7);
  assert.equal(reset.result.current, 1);
  assert.equal(reset.result.longest, 7);

  const duplicate = await record('2026-10-06', 5, 7);
  assert.equal(duplicate.result.current, 5);
  assert.equal(duplicate.result.incrementedToday, false);
  assert.equal(duplicate.update, undefined);

  const future = await record('2026-10-07', 5, 7);
  assert.equal(future.result.current, 5);
  assert.equal(future.result.incrementedToday, false);
  assert.equal(future.update, undefined);
});

test('terminal completion rejection clears marker but retains local progress', async () => {
  const values = new Map();
  const storage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
  const userId = 'user-4';
  const gameId = 'past-game';
  const progressKey = `loop_progress_${JSON.stringify([userId, gameId])}`;
  storage.setItem(progressKey, JSON.stringify(snapshot()));
  const markerKey = markPendingCompletion(storage, userId, gameId);
  let requests = 0;
  const rejected = await retryPendingCompletion(markerKey, storage, async () => {
    requests += 1;
    return { ok: false, status: 409 };
  });
  assert.equal(rejected, true);
  assert.equal(storage.getItem(markerKey), null);
  assert.notEqual(storage.getItem(progressKey), null);
  assert.equal(requests, 1);
});

test('expired completion markers are pruned without an API attempt', () => {
  const values = new Map();
  const storage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
  const markerKey = markPendingCompletion(storage, 'user-old', 'game-old');
  const marker = JSON.parse(storage.getItem(markerKey));
  marker.createdAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
  storage.setItem(markerKey, JSON.stringify(marker));
  pruneExpiredPendingCompletions(storage);
  assert.equal(storage.getItem(markerKey), null);
});

test('concurrent duplicate streak recording increments only once', async () => {
  let lastCompletedDate = null;
  let currentStreak = 0;
  let longestStreak = 0;
  let arrivals = 0;
  let releaseReads;
  const readsReady = new Promise((resolve) => { releaseReads = resolve; });
  const tx = {
    userStreak: {
      async createMany() {},
      async findUniqueOrThrow() {
        if (arrivals < 2) {
          const row = { currentStreak, longestStreak, lastCompletedDate };
          arrivals += 1;
          if (arrivals === 2) releaseReads();
          await readsReady;
          return row;
        }
        return { currentStreak, longestStreak };
      },
      async updateMany({ where, data }) {
        const expected = where.lastCompletedDate?.getTime() ?? null;
        const actual = lastCompletedDate?.getTime() ?? null;
        if (expected !== actual) return { count: 0 };
        currentStreak = data.currentStreak;
        longestStreak = data.longestStreak;
        lastCompletedDate = data.lastCompletedDate;
        return { count: 1 };
      },
    },
  };

  const results = await Promise.all([
    recordCompletionForStreak(tx, 'user-race', dayKeyToDate('2026-10-06')),
    recordCompletionForStreak(tx, 'user-race', dayKeyToDate('2026-10-06')),
  ]);
  assert.equal(currentStreak, 1);
  assert.equal(longestStreak, 1);
  assert.equal(toIsoDay(lastCompletedDate), '2026-10-06');
  assert.equal(results.filter((result) => result.incrementedToday).length, 1);
});

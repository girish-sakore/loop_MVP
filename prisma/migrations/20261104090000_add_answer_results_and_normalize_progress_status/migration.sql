-- Each node now records the latest result for every authored question. This
-- prevents retries from adding a second answer to the aggregate counters.
ALTER TABLE "user_node_progress"
ADD COLUMN "answerResults" JSONB NOT NULL DEFAULT '{}';

-- Older writes used a capitalized terminal status. Normalize it before the
-- application relies on the lowercase value for replay and map gating.
UPDATE "user_node_progress"
SET "status" = 'completed'
WHERE LOWER("status") = 'completed';

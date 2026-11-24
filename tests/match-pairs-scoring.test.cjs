const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

function loadScoring() {
  const filename = path.resolve(__dirname, "../src/features/gameplay/scoring/index.ts");
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  mod._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText,
    filename,
  );
  return mod.exports;
}

function loadCompletionRoute() {
  const cache = new Map();
  const root = path.resolve(__dirname, "..");
  const mocks = {
    "next/server": { NextResponse: { json: () => null } },
    "next/headers": { headers: async () => new Headers() },
    "@prisma/client": { Prisma: {} },
    "@/lib/db": { prisma: {} },
    "@/lib/auth": { auth: {} },
    "@/features/streak/record-completion.server": { recordCompletionForStreak: async () => null },
    "@/features/gameplay/progress/resume": { sanitizeAnswerResults: (results) => results },
  };

  function load(relative) {
    const filename = path.resolve(root, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = module.paths;
    cache.set(filename, mod);
    mod.require = (id) => {
      if (mocks[id]) return mocks[id];
      if (id.startsWith("@/")) {
        const base = path.resolve(root, "src", id.slice(2));
        const file = fs.existsSync(`${base}.ts`) ? `${base}.ts` : `${base}/index.ts`;
        return load(path.relative(root, file));
      }
      return require(id);
    };
    mod._compile(
      ts.transpileModule(fs.readFileSync(filename, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
      }).outputText,
      filename,
    );
    return mod.exports;
  }

  return load("src/app/api/progress/complete/route.ts");
}

test("match pairs contributes one namespaced question per pair and preserves total points", () => {
  const { matchPairQuestionId, stageQuestions } = loadScoring();
  const questions = stageQuestions({
    id: "books",
    type: "match-pairs",
    points: 10,
    pairs: [{ id: "atlas" }, { id: "gray" }, { id: "gutenberg" }],
  });

  assert.deepEqual(questions, [
    { id: matchPairQuestionId("books", "atlas"), points: 4 },
    { id: matchPairQuestionId("books", "gray"), points: 3 },
    { id: matchPairQuestionId("books", "gutenberg"), points: 3 },
  ]);
  assert.equal(questions.reduce((total, question) => total + question.points, 0), 10);
});

test("invalid match-pairs data remains a single stage question", () => {
  const { stageQuestions } = loadScoring();
  assert.deepEqual(
    stageQuestions({
      id: "books",
      type: "match-pairs",
      points: 10,
      pairs: [{ id: "atlas" }, { id: "atlas" }],
    }),
    [{ id: "books", points: 10 }],
  );
});

test("completion scoring requires and scores every Match Pairs result", () => {
  const { scoreCompletion } = loadCompletionRoute();
  const snapshot = {
    nodes: [{
      id: "game",
      type: "match-pairs",
      // Older snapshots can omit the type here; server scoring must use the
      // parent game type and still expand every pair.
      subStages: [{
        id: "books",
        points: 10,
        pairs: [{ id: "atlas" }, { id: "gray" }, { id: "gutenberg" }],
      }],
    }],
  };

  assert.deepEqual(
    scoreCompletion(snapshot, "game", {
      "books:atlas": { isCorrect: true, points: 4, updatedAt: 1 },
      "books:gray": { isCorrect: false, points: 0, updatedAt: 1 },
      "books:gutenberg": { isCorrect: true, points: 3, updatedAt: 1 },
    }),
    { score: 7, correctAnswers: 2, totalAnswers: 3, stars: 2 },
  );
  assert.equal(
    scoreCompletion(snapshot, "game", {
      "books:atlas": { isCorrect: true, points: 4, updatedAt: 1 },
      "books:gray": { isCorrect: false, points: 0, updatedAt: 1 },
    }),
    null,
  );
});

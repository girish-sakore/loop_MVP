const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { act, create } = require("react-test-renderer");

global.IS_REACT_ACT_ENVIRONMENT = true;
global.window = { setTimeout, clearTimeout };

function loadMatchPairs() {
  const cache = new Map();
  const root = path.resolve(__dirname, "..");

  function load(relative) {
    const filename = path.resolve(root, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = module.paths;
    cache.set(filename, mod);
    mod.require = (id) => {
      if (id === "@/features/gameplay/scoring") return load("src/features/gameplay/scoring/index.ts");
      if (id === "@/components/ui/image-lightbox") return { ImageLightbox: () => null };
      return require(id);
    };
    mod._compile(
      ts.transpileModule(fs.readFileSync(filename, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      }).outputText,
      filename,
    );
    return mod.exports;
  }

  return load("src/features/interactions/match-pairs/match-pairs-interaction.tsx");
}

const stage = {
  id: "books",
  type: "match-pairs",
  points: 10,
  question: "Match the books",
  prompt: "Choose a clue and its answer.",
  pairs: [
    { id: "atlas", clue: "Atlas clue", answer: { text: "Atlas answer" } },
    { id: "gray", clue: "Gray clue", answer: { text: "Gray answer" } },
    { id: "gutenberg", clue: "Gutenberg clue", answer: { text: "Gutenberg answer" } },
  ],
  feedback: { correct: "Solved", incorrect: "Those do not match." },
};

async function makeWrongMatch(attemptsRemaining) {
  const { MatchPairsInteraction } = loadMatchPairs();
  const answers = [];
  let root;
  await act(async () => {
    root = create(React.createElement(MatchPairsInteraction, {
      stage,
      attemptsRemaining,
      showIntro: false,
      onAnswer: (answer) => answers.push(answer),
    }));
  });
  const buttons = root.root.findAllByType("button");
  const clue = buttons.find((button) => button.children.includes("Atlas clue"));
  const wrongAnswer = buttons.find((button) => button.props["aria-label"] === "Answer: Gray answer");
  await act(async () => clue.props.onClick());
  await act(async () => wrongAnswer.props.onClick());
  await act(async () => root.unmount());
  return answers;
}

test("a wrong pair ends the attempt, requires Retry, and leaves the pair ledger empty", async () => {
  assert.deepEqual(await makeWrongMatch(3), [{
    correct: false,
    allowSkip: false,
    feedback: "Those do not match.",
    results: [],
  }]);
});

test("the final wrong attempt records every pair as incorrect for server completion", async () => {
  assert.deepEqual(await makeWrongMatch(1), [{
    correct: false,
    allowSkip: false,
    feedback: "You got 0 of 3 right. Those do not match.",
    results: [
      { questionId: "books:atlas", isCorrect: false, points: 0 },
      { questionId: "books:gray", isCorrect: false, points: 0 },
      { questionId: "books:gutenberg", isCorrect: false, points: 0 },
    ],
  }]);
});

test("Retry keeps earlier correct pairs locked while resetting the failed selection", async () => {
  const { MatchPairsInteraction } = loadMatchPairs();
  const answers = [];
  let root;
  const props = {
    stage,
    attemptsRemaining: 3,
    retryCount: 0,
    showIntro: false,
    onAnswer: (answer) => answers.push(answer),
  };
  await act(async () => { root = create(React.createElement(MatchPairsInteraction, props)); });
  const findButton = (predicate) => root.root.findAllByType("button").find(predicate);

  await act(async () => findButton((button) => button.children.includes("Atlas clue")).props.onClick());
  await act(async () => findButton((button) => button.props["aria-label"] === "Answer: Atlas answer").props.onClick());
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 240)); });

  await act(async () => findButton((button) => button.children.includes("Gray clue")).props.onClick());
  await act(async () => findButton((button) => button.props["aria-label"] === "Answer: Gutenberg answer").props.onClick());
  assert.equal(answers.length, 1);

  await act(async () => {
    root.update(React.createElement(MatchPairsInteraction, { ...props, retryCount: 1 }));
  });
  assert.equal(findButton((button) => button.children.includes("Atlas clue")).props.disabled, true);
  assert.equal(findButton((button) => button.props["aria-label"] === "Answer: Atlas answer").props.disabled, true);
  assert.equal(findButton((button) => button.children.includes("Gray clue")).props.disabled, false);
  assert.equal(
    root.root.findAllByType("p").find((paragraph) => paragraph.children.join("").includes("correct")).children.join(""),
    "1 correct · 1 of 3 answered",
  );
  await act(async () => root.unmount());
});

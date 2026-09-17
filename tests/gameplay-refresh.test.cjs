const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

global.IS_REACT_ACT_ENVIRONMENT = true;

function harness() {
  const cache = new Map();
  const requests = [];
  const storage = new Map();
  let interaction, feedback;
  global.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  global.window = { localStorage, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} };
  global.fetch = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return { ok: true };
  };
  const passthrough = ({ children }) => children;
  const mocks = {
    'next/navigation': { useRouter: () => ({ push() {} }) },
    'framer-motion': { AnimatePresence: passthrough, motion: { div: passthrough } },
    '@/components/feedback/feedback-modal': { FeedbackModal: props => { feedback = props; return null; } },
    '@/features/gameplay/renderer/interaction-renderer': { InteractionRenderer: props => { interaction = props; return null; } },
    '@/features/gameplay/shell/gameplay-shell': { GameplayShell: passthrough },
  };
  function load(relative) {
    const filename = path.resolve(__dirname, '..', relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = module.paths;
    cache.set(filename, mod);
    mod.require = id => {
      if (mocks[id]) return mocks[id];
      if (id.startsWith('@/')) {
        const base = 'src/' + id.slice(2);
        return load(fs.existsSync(path.resolve(__dirname, '..', base + '.ts')) ? base + '.ts' : base + '.tsx');
      }
      return require(id);
    };
    mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename);
    return mod.exports;
  }
  const { GameplayEngine } = load('src/features/gameplay/engine/gameplay-engine.tsx');
  const { useGameplayStore: store } = load('src/stores/gameplay-store.ts');
  const stages = [{ id: 'colors', type: 'color-match', attemptsAllowed: 3, points: 100 }];
  let root;
  return {
    store, requests, storage,
    get interaction() { return interaction; },
    get feedback() { return feedback; },
    async mount(props = {}) {
      await act(async () => { root = create(React.createElement(GameplayEngine, {
        editionId: 'edition', nodeId: 'node', userId: 'user', stages, ...props,
      })); });
    },
    async unmount() { await act(async () => root.unmount()); },
    async answer(correct) { await act(async () => interaction.onAnswer({ correct, feedback: correct ? 'Correct' : 'Wrong' })); },
    async retry() { await act(async () => feedback.onRetry()); },
  };
}

for (const mistakes of [1, 3]) {
  test(`refresh preserves ${3 - mistakes} remaining attempts`, async () => {
    const game = harness();
    await game.mount();
    try {
      for (let i = 0; i < mistakes; i++) {
        await game.answer(false);
        if (i < mistakes - 1) await game.retry();
      }
      assert.equal(game.store.getState().attemptsRemaining, 3 - mistakes);
      await game.unmount();
      game.store.getState().reset(); // Full refresh loses the in-memory Zustand state.
      await game.mount();
      assert.equal(game.store.getState().attemptsRemaining, 3 - mistakes);
      assert.equal(game.store.getState().totalAnswers, mistakes);
      if (mistakes === 3) {
        assert.equal(game.interaction.disabled, true);
        assert.equal(game.feedback.open, true);
        await game.retry();
        await game.answer(false);
        assert.equal(game.store.getState().totalAnswers, 3);
      }
    } finally { await game.unmount(); }
  });
}

test('passed stage cannot award points twice after refresh', async () => {
  const game = harness();
  await game.mount();
  try {
    await game.answer(true);
    await game.unmount();
    game.store.getState().reset();
    await game.mount();
    assert.equal(game.feedback.correct, true);
    await game.answer(true);
    assert.equal(game.store.getState().score, 100);
    assert.equal(game.store.getState().totalAnswers, 1);
  } finally { await game.unmount(); }
});

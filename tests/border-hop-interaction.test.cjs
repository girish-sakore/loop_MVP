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
  const rootDir = path.resolve(__dirname, '..');
  function load(relative) {
    const filename = path.resolve(rootDir, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = module.paths;
    cache.set(filename, mod);
    mod.require = id => {
      if (id === './border-hop-map') return { BorderHopMap: () => null };
      if (id.endsWith('.css')) return {};
      if (id === './world-map') return { countryNames: [...Object.keys(load('src/features/interactions/border-hop/border-hop-rules.ts').adjacency), 'Japan'].sort() };
      if (id.startsWith('.')) {
        const base = path.resolve(path.dirname(filename), id);
        if (id.endsWith('.json')) return require(base);
        return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
      }
      return require(id);
    };
    mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename);
    return mod.exports;
  }
  const { BorderHopInteraction } = load('src/features/interactions/border-hop/border-hop-interaction.tsx');
  const answers = [];
  let hints = 0;
  let root;
  let props = {
    stage: { id: 'route', type: 'border-hop', startCountry: 'Portugal', targetCountry: 'Germany', maxGuesses: 3, attemptsAllowed: 3, points: 100, question: 'Cross Europe' },
    showIntro: false, onIntroComplete() {}, hintsRemaining: 3,
    onUseHint: () => hints++, onAnswer: answer => answers.push(answer),
  };
  return {
    answers,
    get hints() { return hints; },
    get input() { return root.root.findByType('input'); },
    get root() { return root; },
    async mount(next = {}) { props = { ...props, ...next }; await act(async () => { root = create(React.createElement(BorderHopInteraction, props)); }); },
    async update(next) { props = { ...props, ...next }; await act(async () => root.update(React.createElement(BorderHopInteraction, props))); },
    async guess(name) {
      await act(async () => this.input.props.onChange({ target: { value: name } }));
      await act(async () => root.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    },
    async hint() { const button = root.root.findAllByType('button').find(b => b.props['aria-label'] === 'Show next country’s initial'); await act(async () => button.props.onClick()); },
    async unmount() { await act(async () => root.unmount()); },
  };
}

test('game displays route chips, counters, Hop action, and three compact hints', async () => {
  const h = harness(); await h.mount();
  try {
    const text = JSON.stringify(h.root.toJSON());
    for (const label of ['Hops:', 'Guesses:', 'Lives:', 'Next Outline', 'Full Route', 'First Letter']) {
      assert.ok(text.includes(label), `${label} is visible`);
    }
    const route = h.root.root.findByProps({ 'aria-label': 'Current route' });
    assert.equal(route.findAllByType('li').length, 3);
    const hop = h.root.root.findAllByType('button').find(b => b.children.includes('Hop '));
    assert.equal(hop.props.disabled, true);
    await h.guess('Spain');
    assert.equal(route.findAllByType('li').length, 4);
    assert.equal(h.answers.length, 0);
    assert.equal(h.root.root.findByProps({ role: 'status' }).children.join(''), 'Border crossed to Spain.');
  } finally { await h.unmount(); }
});

test('component reports success only once, after the destination', async () => {
  const h = harness(); await h.mount();
  try {
    await h.guess('Spain'); await h.guess('France');
    assert.equal(h.answers.length, 0);
    await h.guess('Germany');
    assert.equal(h.answers.length, 1); assert.equal(h.answers[0].correct, true);
    await h.guess('Poland');
    assert.equal(h.answers.length, 1);
    assert.equal(h.input.props.disabled, true);
  } finally { await h.unmount(); }
});

test('unknown input is free; wrong pick reports once; keyed retry resets', async () => {
  const h = harness(); await h.mount({ key: 'route:0', attemptsRemaining: 3 });
  try {
    await h.guess('not a country');
    assert.equal(h.answers.length, 0);
    await h.guess('Spain'); await h.hint();
    await h.guess('Japan'); await h.guess('Japan');
    assert.equal(h.answers.length, 1); assert.equal(h.answers[0].correct, false);
    assert.equal(h.input.props.disabled, true);
    await h.update({ key: 'route:1', attemptsRemaining: 2, hintsRemaining: 2 });
    assert.equal(h.input.props.disabled, false);
    assert.equal(h.input.props.value, '');
    const text = JSON.stringify(h.root.toJSON());
    assert.ok(!text.includes('Next country starts with'));
    assert.ok(!text.includes('does not border'));
    await h.guess('Spain'); await h.guess('France'); await h.guess('Germany');
    assert.equal(h.answers.length, 2); assert.equal(h.answers[1].correct, true);
  } finally { await h.unmount(); }
});

test('valid detour exhausting the guess limit fails once and locks input', async () => {
  const h = harness(); await h.mount();
  try {
    await h.guess('Spain'); await h.guess('France'); await h.guess('Belgium');
    assert.equal(h.answers.length, 1);
    assert.equal(h.answers[0].correct, false);
    assert.match(h.answers[0].feedback, /used all 3 guesses/);
    assert.equal(h.input.props.disabled, true);
    await h.guess('Germany');
    assert.equal(h.answers.length, 1);
  } finally { await h.unmount(); }
});

test('give up reports once and Retry starts a fresh attempt', async () => {
  const h = harness(); await h.mount({ key: 'route:0' });
  try {
    const giveUp = h.root.root.findAllByType('button').find(b => String(b.children).startsWith('Give up this attempt'));
    await act(async () => { giveUp.props.onClick(); giveUp.props.onClick(); });
    assert.equal(h.answers.length, 1);
    assert.equal(h.answers[0].correct, false);
    assert.equal(h.input.props.disabled, true);
    await h.guess('Spain'); await h.hint();
    assert.equal(h.answers.length, 1); assert.equal(h.hints, 0);
    await h.update({ key: 'route:1', attemptsRemaining: 2 });
    assert.equal(h.input.props.disabled, false);
  } finally { await h.unmount(); }
});

test('zero hearts prevents guesses and hints independently of disabled prop', async () => {
  const h = harness(); await h.mount({ attemptsRemaining: 0 });
  try {
    assert.equal(h.input.props.disabled, true);
    await h.guess('Spain'); await h.hint();
    assert.equal(h.answers.length, 0); assert.equal(h.hints, 0);
  } finally { await h.unmount(); }
});

test('intro renders instructions and the remaining heart count', async () => {
  const h = harness(); let started = 0;
  await h.mount({ showIntro: true, attemptsRemaining: 2, onIntroComplete: () => started++ });
  try {
    const text = JSON.stringify(h.root.toJSON());
    assert.ok(text.includes('Retry starts a fresh route'));
    assert.ok(text.includes('costs one heart'));
    await act(async () => h.root.root.findByType('button').props.onClick());
    assert.equal(started, 1);
  } finally { await h.unmount(); }
});

test('disabled stages block guesses and hints; repeat hints are free', async () => {
  const h = harness(); await h.mount({ disabled: true });
  try {
    await h.guess('Spain'); await h.hint();
    assert.equal(h.hints, 0); assert.equal(h.answers.length, 0);
    await h.update({ disabled: false });
    await h.hint(); await h.hint();
    assert.equal(h.hints, 1);
    await h.guess('Spain');
    await h.update({ hintsRemaining: 0 }); await h.hint();
    assert.equal(h.hints, 1);
  } finally { await h.unmount(); }
});

test('every example route validates and all graph countries have atlas geometry', () => {
  const { validateRoute, adjacency, countryAliases } = harnessRules();
  const edition = require('../src/content/editions/edition-001.json');
  const stages = edition.nodes.filter(node => node.type === 'border-hop').flatMap(node => node.subStages);
  assert.equal(stages.length, 2);
  for (const stage of stages) assert.ok(validateRoute(stage).path.length > 1);
  const atlas = require('world-atlas/countries-110m.json');
  const names = new Set(atlas.objects.countries.geometries.map(g => countryAliases[g.properties.name] ?? g.properties.name));
  for (const name of Object.keys(adjacency)) assert.ok(names.has(name), `${name} is missing map geometry`);
});

function harnessRules() {
  const filename = path.resolve(__dirname, '../src/features/interactions/border-hop/border-hop-rules.ts');
  const mod = new Module(filename, module);
  mod.filename = filename; mod.paths = module.paths;
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
  return mod.exports;
}

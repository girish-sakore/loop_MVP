const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/features/interactions/border-hop/border-hop-rules.ts');
const mod = new Module(filename, module);
mod.filename = filename;
mod.paths = module.paths;
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, filename);
const { adjacency, shortestPath, resolveCountry, validateRoute, initialRoute, guessCountry } = mod.exports;

const config = validateRoute({ startCountry: 'Portugal', targetCountry: 'Germany', maxGuesses: 3 });

test('valid hops advance the route, but only the destination completes it', () => {
  let state = initialRoute(config);
  for (const country of ['Spain', 'France']) {
    state = guessCountry(state, country, config);
    assert.equal(state.result, null);
    assert.equal(state.path.at(-1), country);
  }
  state = guessCountry(state, 'Germany', config);
  assert.equal(state.result, 'won', 'a win on the last allowed guess takes precedence');
  assert.equal(guessCountry(state, 'Poland', config), state, 'terminal games ignore further guesses');
});

test('exhaustion produces one failed route result for the engine', () => {
  let state = initialRoute(config);
  for (let i = 0; i < 3; i++) state = guessCountry(state, 'Japan', config);
  assert.equal(state.result, 'lost');
  assert.deepEqual(state.path, ['Portugal']);
  assert.equal(state.guesses.length, config.maxGuesses);
  assert.equal(guessCountry(state, 'Spain', config), state);
});

test('repeat visits consume a guess without advancing', () => {
  let state = guessCountry(initialRoute(config), 'Spain', config);
  state = guessCountry(state, 'Portugal', config);
  assert.equal(state.guesses.at(-1).correct, false);
  assert.deepEqual(state.path, ['Portugal', 'Spain']);
});

test('hints never include previously visited countries', () => {
  const visited = ['Portugal', 'Spain', 'France', 'Belgium'];
  const hint = shortestPath('Belgium', 'Italy', visited.slice(0, -1));
  assert.ok(hint);
  for (const country of hint.slice(1)) assert.ok(!visited.includes(country));
  assert.equal(shortestPath('Portugal', 'Italy', ['Spain']), null, 'dead ends offer no impossible hints');
});

test('borders are symmetric, and names and route budgets are validated', () => {
  for (const [country, neighbors] of Object.entries(adjacency)) {
    for (const neighbor of neighbors) assert.ok(adjacency[neighbor].includes(country));
  }
  assert.equal(resolveCountry('  USA  '), 'United States');
  assert.equal(resolveCountry('Czech Republic'), 'Czechia');
  assert.equal(resolveCountry('unknown'), null);
  assert.throws(() => validateRoute({ startCountry: 'Japan', targetCountry: 'Germany' }));
  assert.throws(() => validateRoute({ startCountry: 'Portugal', targetCountry: 'Portugal' }));
  assert.throws(() => validateRoute({ startCountry: 'Portugal', targetCountry: 'Germany', maxGuesses: 1 }));
  assert.throws(() => validateRoute({ startCountry: 'Portugal', targetCountry: 'Germany', hintsAllowed: -1 }));
});

module.exports = { rules: mod.exports };

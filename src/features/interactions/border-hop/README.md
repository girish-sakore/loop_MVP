# Border Hop edition content

Add a node with `type: "border-hop"` to any `src/content/editions/*.json` file. Each `subStages` entry is one independently scored route. See `node-10` in `edition-001.json` for two working examples. Restart the development server after editing editions (the loader caches content).

## Substage fields

| Field | Meaning |
| --- | --- |
| `id` | Unique, stable stage ID |
| `question` | Text below the route heading |
| `startCountry`, `targetCountry` | Supported country names; no answer path needed |
| `maxGuesses` | Optional total guesses per attempt; defaults to shortest hops + 4. Must allow a solution, maximum 100 |
| `attemptsAllowed` | Engine hearts / full route attempts (normally 3) |
| `points` | Points for completing the route |
| `hintsAllowed` | Optional per-attempt cap, 0–3; defaults to 3. Also limited by the engine's shared 3-hint node budget |
| `prompt` | Optional replacement for question text |
| `introLabel` | Optional intro eyebrow |
| `feedback` | Optional `{ "correct": "…", "incorrect": "…" }` end-of-attempt messages |

Use `mapTitle` and `mapSubtitle` on the node. Type and missing common metadata are supplied by the gameplay page, as with other interactions. Copy a substage to create another route and change its ID/endpoints. Routes are fixed by content, not randomly generated.

## Rules and integration

- Every unvisited bordering country is accepted, not just a preselected shortest path.
- Both correct and incorrect recognized guesses use the guess budget. Unknown input does not.
- Reaching the target on the final guess wins. Only a complete win reports success to the engine. Exhaustion or giving up reports one failed attempt.
- Engine Retry remounts the route from the starting country; hearts are not replenished. There is no New route button that bypasses scoring.
- Hints use shortest remaining paths excluding visited countries. Repeating the same hint at the same stop does not charge again. A dead end offers no hint; give up or finish the attempt.
- Partial paths/guesses are component-local and restart on browser refresh, matching the existing interactions. Engine attempt results persist; partial route progress does not. Hint expenditure remains in the engine's localStorage budget.
- Invalid endpoints, disconnected pairs and impossible budgets are rejected by the edition loader with the node/stage ID.

## Data and naming

`borders.json` stores each land-border edge once; the rules module makes it symmetric. Canonical endpoint names are the union of keys and values. Common aliases include USA/United States of America, Czech Republic, Macedonia, Swaziland and United Republic of Tanzania.

Map geometry comes from the installed `world-atlas/countries-110m.json` package (Natural Earth public-domain data), rendered locally with `topojson-client` and `d3-geo`; there are no remote runtime map requests. See https://github.com/topojson/world-atlas and https://www.naturalearthdata.com/about/terms-of-use/.

The game graph is explicit rather than inferred from simplified polygon contacts. It omits sea crossings, bridges, overseas shortcuts (for example France → Brazil) and tiny borders absent from this coarse map (for example Canada → Greenland). Spain → Morocco represents Ceuta/Melilla. Kosovo and Somaliland follow the atlas's separate shapes. Palestine represents the atlas's Palestinian territories, not just the West Bank. These are gameplay conventions, not assertions about political status. Update the graph and geometry naming together when expanding coverage.

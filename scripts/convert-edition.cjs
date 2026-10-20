// scripts/convert-edition.cjs
const fs = require("fs");
const ed = require("../src/content/editions/edition-001.json");
const cards = ed.nodes.map((n) => ({
  type: n.type,
  title: n.mapTitle,
  subtitle: n.mapSubtitle,
  subStages: n.subStages,
}));
fs.writeFileSync("import-sample.json", JSON.stringify(cards, null, 2));
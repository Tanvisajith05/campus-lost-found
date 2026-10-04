const test = require("node:test");
const assert = require("node:assert");
const { scoreMatch, matchLabel } = require("../src/utils/matching");

test("TC06 - Matching algorithm should give 100% for identical reports", () => {
  const lost = {
    category: "Accessories",
    item_name: "spiderman keychain",
    location: "parking",
    date: "2026-10-03",
    description: "small and blue red in colour with a big hook"
  };

  const found = {
    category: "Accessories",
    item_name: "spiderman keychain",
    location: "parking",
    date: "2026-10-03",
    description: "small and blue red in colour with a big hook"
  };

  const score = scoreMatch(lost, found);

  assert.strictEqual(score, 100);
  assert.strictEqual(matchLabel(score), "High-Confidence Match");
});
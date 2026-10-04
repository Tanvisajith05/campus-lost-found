function normalize(s = "") {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function nameSimilarity(a, b) {
  const A = new Set(normalize(a));
  const B = new Set(normalize(b));

  if (!A.size || !B.size) return false;

  let common = 0;

  for (const word of A) {
    if (B.has(word)) {
      common++;
    }
  }

  return common / Math.max(A.size, B.size) >= 0.4;
}

function descriptionSimilarity(a, b) {
  const A = new Set(normalize(a));
  const B = new Set(normalize(b));

  const common = [...A].filter(
    (word) => B.has(word) && word.length > 2
  ).length;

  return common >= 2;
}

function scoreMatch(lost, found) {
  let score = 0;

  // 1. Category - 20 points
  if (
    lost.category &&
    found.category &&
    lost.category.toLowerCase() === found.category.toLowerCase()
  ) {
    score += 20;
  }

  // 2. Item name - 30 points
  if (nameSimilarity(lost.item_name, found.item_name)) {
    score += 30;
  }

  // 3. Location - 20 points
  if (
    lost.location &&
    found.location &&
    lost.location.toLowerCase().trim() ===
      found.location.toLowerCase().trim()
  ) {
    score += 20;
  }

  // 4. Date - 15 points
  if (lost.date && found.date) {
    const d1 = new Date(lost.date);
    const d2 = new Date(found.date);

    const days = Math.abs(d1 - d2) / 86400000;

    if (days <= 2) {
      score += 15;
    }
  }

  // 5. Description - 15 points
  if (descriptionSimilarity(lost.description, found.description)) {
    score += 15;
  }

  return score;
}

function matchLabel(score) {
  if (score >= 90) return "High-Confidence Match";
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Possible Match";
  return "Low Match";
}

function isHighConfidenceMatch(score) {
  return score >= 90;
}

module.exports = {
  scoreMatch,
  matchLabel,
  isHighConfidenceMatch,
};
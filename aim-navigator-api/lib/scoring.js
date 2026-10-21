// Order matters: this is the order of the letters around Holland's hexagon.
const LETTERS = ['R', 'I', 'A', 'S', 'E', 'C'];

// PART 1: SHAPE. Does the student's pattern look like the career's pattern?
// Mean-centered cosine (Pearson), converted from -1..1 to 0..100.
function shapeScore(user, career) {
  const avg = (arr) => arr.reduce((sum, x) => sum + x, 0) / arr.length;
  const mu = avg(user);
  const mc = avg(career);

  let top = 0, userSq = 0, careerSq = 0;
  for (let i = 0; i < 6; i++) {
    top += (user[i] - mu) * (career[i] - mc);
    userSq += (user[i] - mu) ** 2;
    careerSq += (career[i] - mc) ** 2;
  }
  if (userSq === 0 || careerSq === 0) return 50;   // flat pattern: no signal

  const correlation = top / Math.sqrt(userSq * careerSq);   // -1 to 1
  return ((correlation + 1) / 2) * 100;
}

// PART 2: HEXAGON. Are the top-3 letters the same or close neighbours?
function topThree(vector) {
  return LETTERS
    .map((letter, i) => ({ letter, score: vector[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.letter);
}

function hexDistance(a, b) {
  const gap = Math.abs(LETTERS.indexOf(a) - LETTERS.indexOf(b));
  return Math.min(gap, 6 - gap);   // 0 = same, 1 = neighbour, 3 = opposite
}

function hexScore(user, career) {
  const u = topThree(user);
  const c = topThree(career);
  const weights = [3, 2, 1];              // first letter matters most
  const closeness = [1, 0.66, 0.33, 0];   // indexed by hexagon distance

  let total = 0;
  for (let i = 0; i < 3; i++) {
    total += weights[i] * closeness[hexDistance(u[i], c[i])];
  }
  return (total / 6) * 100;
}

// Full breakdown for one career: shape, hexagon, and the 60/40 blend (all 0-100)
export function scoreBreakdown(userVector, careerVector) {
  const shape = shapeScore(userVector, careerVector);
  const hexagon = hexScore(userVector, careerVector);
  const final = 0.6 * shape + 0.4 * hexagon;
  const round2 = (x) => Math.round(x * 100) / 100;
  return { shape: round2(shape), hexagon: round2(hexagon), final: round2(final) };
}

// Whole-number version (scripts/testScoring.js still uses this)
export function matchScore(userVector, careerVector) {
  return Math.round(scoreBreakdown(userVector, careerVector).final);
}

// Turn 48 answers into 6 totals (each 8 to 40), using the questions' "dimension"
export function computeUserVector(answers, questions) {
  const totals = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const dimensionById = {};
  questions.forEach((q) => { dimensionById[q.id] = q.dimension; });

  answers.forEach((a) => {
    const dim = dimensionById[a.question_id];
    if (dim) totals[dim] += a.value;
  });
  return LETTERS.map((letter) => totals[letter]);
}

// Three-letter Holland code, e.g. "IAR" (saved in attempts.top_code)
export function computeTopCode(vector) {
  return topThree(vector).join('');
}

// Flat profile = the student likes everything about equally, so the top code means little.
// The "8" is my starting threshold; adjust it if your PRD defined a different one.
export function isFlatProfile(vector) {
  return Math.max(...vector) - Math.min(...vector) <= 8;
}
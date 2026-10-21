import { careers } from "./careers";
import { DIMENSIONS, questions } from "./questions";

// Pretend backend scoring. Given the user's answers ({ questionId: 1..5 }),
// sum each dimension, find the 3-letter Holland code, and rank careers.

const BLURBS = {
  R: "practical and hands-on",
  I: "curious and analytical",
  A: "creative and expressive",
  S: "supportive and people-centred",
  E: "persuasive and driven",
  C: "organised and precise",
};

export function buildMatchResult(answers = {}) {
  const scores = {};
  DIMENSIONS.forEach((d) => (scores[d] = 0));

  questions.forEach((q) => {
    const value = answers[q.id];
    if (value) scores[q.dimension] += value;
  });

  const ranked = [...DIMENSIONS].sort((a, b) => scores[b] - scores[a]);
  const topCode = ranked.slice(0, 3).join("");

  // A "flat" profile means the highest and lowest scores are too close to rank.
  const spread = scores[ranked[0]] - scores[ranked[5]];
  const isFlatProfile = spread < 5;

  const matches = careers
    .map((career) => {
      // shapeScore: how well the career's top-3 code overlaps the user's top-3
      const shapeScore = career.riasec.reduce((total, dim, index) => {
        const userRank = ranked.indexOf(dim);
        const weight = [3, 2, 1][index];
        return total + Math.max(0, 6 - userRank) * weight;
      }, 0);

      // hexagonScore: raw affinity from the user's actual dimension scores
      const hexagonScore = career.riasec.reduce((total, dim) => total + scores[dim], 0);

      const finalScore = Math.min(
        99,
        Math.round(shapeScore * 1.4 + (hexagonScore / (40 * 3)) * 45),
      );

      return {
        careerId: career.id,
        finalScore,
        shapeScore,
        hexagonScore,
        reason: `Matches your ${career.riasec
          .slice(0, 2)
          .map((d) => BLURBS[d])
          .join(" and ")} side.`,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  return { scores, topCode, isFlatProfile, matches };
}

export function codeBlurb(topCode) {
  const parts = topCode.split("").map((d) => BLURBS[d]);
  return `You come across as ${parts[0]}, with a strong ${parts[1]} streak and a ${parts[2]} side. Careers that mix these three tend to feel natural to you.`;
}

export default buildMatchResult;

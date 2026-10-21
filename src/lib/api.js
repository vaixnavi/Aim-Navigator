import { backendApi } from "./backendApi";
// Thin API wrapper. Every function returns a promise, so later you can swap the
// mock body for a real `fetch(...)` call without touching any component.

import { careers } from "@/mocks/careers";
import { questions } from "@/mocks/questions";
import { buildMatchResult } from "@/mocks/matchResult";

const LETTERS = ["R", "I", "A", "S", "E", "C"];

// Turn a database career row into the shape your pages already use
function mapCareer(row) {
  const scores = {
    R: row.score_r, I: row.score_i, A: row.score_a,
    S: row.score_s, E: row.score_e, C: row.score_c,
  };
  const capitalise = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tags: (row.career_tags ?? []).map((t) => t.tags?.name).filter(Boolean),
    educationLevel: row.education_level,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryDisplay: row.salary_display,
    growthPct: row.growth_pct,
    workEnvironment: row.work_environment,
    riasec: [...LETTERS].sort((a, b) => scores[b] - scores[a]).slice(0, 3),
    skills: [...(row.career_skills ?? [])]
      .sort((a, b) => a.display_order - b.display_order)
      .map((s) => s.skill_name),
    roadmap: [...(row.roadmap_steps ?? [])]
      .sort((a, b) => a.month_number - b.month_number)
      .map((s) => ({
        month: s.month_number,
        title: s.title,
        description: s.description,
        tasks: s.tasks ?? [],
      })),
    resources: (row.resources ?? []).map((r) => ({
      type: capitalise(r.type),
      title: r.title,
      url: r.url,
    })),
  };
}

const FAKE_DELAY = 400;

function delay(data, ms = FAKE_DELAY) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function getQuestions() {
  const rows = await backendApi("/questions");
  // Reshape the database rows into what the quiz page already expects
  return rows.map((q) => ({
    id: q.id,
    step: q.step_number,
    order: q.display_order,
    prompt: q.prompt,
  }));
}

export async function getCareers() {
  const rows = await backendApi("/careers");
  return rows.map(mapCareer);
}

export async function getCareerBySlug(slug) {
  try {
    const row = await backendApi(`/careers/slug/${encodeURIComponent(slug)}`);
    return mapCareer(row);
  } catch (e) {
    if (e.message === "Career not found") return null;
    throw e;
  }
}

export function getMatchResult(answers) {
  // later: return fetch("/api/assessment/submit", { method: "POST", ... })
  return delay(buildMatchResult(answers), 700);
}

export async function submitAssessment(answers) {
  // answers looks like { 12: 4, 13: 2, ... } (question id -> 1 to 5)
  const payload = Object.entries(answers).map(([id, value]) => ({
    question_id: Number(id),
    value: Number(value),
  }));

  const res = await backendApi("/assessment/submit", {
    method: "POST",
    body: JSON.stringify({ answers: payload }),
  });

  return {
    attemptId: res.attempt_id,
    scores: res.scores,
    topCode: res.top_code,
    isFlatProfile: res.is_flat_profile,
    matches: res.matches.map((m) => ({
      careerId: m.career_id,
      finalScore: Math.round(Number(m.final_score)),
      shapeScore: Number(m.shape_score),
      hexagonScore: Number(m.hexagon_score),
      reason: `Interest pattern ${Math.round(Number(m.shape_score))}% · Code fit ${Math.round(Number(m.hexagon_score))}%`,
    })),
  };
}

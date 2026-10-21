import { Router } from 'express';
import { supabase } from '../supabaseClient.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  computeUserVector, computeTopCode, isFlatProfile, scoreBreakdown,
} from '../lib/scoring.js';

const router = Router();
const SAVE_TOP = 20;   // how many ranked matches to store per attempt

// POST /api/assessment/submit
// Body: { "answers": [ { "question_id": 12, "value": 4 }, ...48 items ] }
router.post('/submit', requireAuth, async (req, res) => {
  const { answers } = req.body;

  // 1. Validate what the browser sent
  if (!Array.isArray(answers) || answers.length !== 48) {
    return res.status(400).json({ error: 'Exactly 48 answers are required' });
  }
  const formatOk = answers.every(
    (x) => Number.isInteger(x.question_id) && Number.isInteger(x.value) && x.value >= 1 && x.value <= 5
  );
  if (!formatOk) {
    return res.status(400).json({ error: 'Each answer needs a question_id and a value from 1 to 5' });
  }

  // 2. The user needs a profile row (attempts point to profiles)
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('id', req.user.id).maybeSingle();
  if (!profile) {
    return res.status(400).json({ error: 'Please complete your profile before taking the test' });
  }

  // 3. Load questions and careers
  const { data: questions, error: qErr } = await supabase
    .from('questions').select('id, dimension');
  const { data: careers, error: cErr } = await supabase
    .from('careers')
    .select('id, title, slug, score_r, score_i, score_a, score_s, score_e, score_c');

  if (qErr || cErr) return res.status(500).json({ error: 'Could not load questions or careers' });
  if (!careers.length) return res.status(500).json({ error: 'No careers in the database yet' });

  // Every question must be answered exactly once
  const answeredIds = new Set(answers.map((x) => x.question_id));
  if (answeredIds.size !== 48 || questions.length !== 48 || questions.some((q) => !answeredIds.has(q.id))) {
    return res.status(400).json({ error: 'Answers must cover each of the 48 questions exactly once' });
  }

  // 4. Score
  const userVector = computeUserVector(answers, questions);
  const topCode = computeTopCode(userVector);
  const flat = isFlatProfile(userVector);

  const ranked = careers
    .map((c) => ({
      career: c,
      ...scoreBreakdown(userVector, [c.score_r, c.score_i, c.score_a, c.score_s, c.score_e, c.score_c]),
    }))
    .sort((p, q) => q.final - p.final)
    .slice(0, SAVE_TOP);

  // 5. Save the attempt
  const [sr, si, sa, ss, se, sc] = userVector;
  const { data: attempt, error: attErr } = await supabase
    .from('attempts')
    .insert({
      user_id: req.user.id,
      completed_at: new Date().toISOString(),
      score_r: sr, score_i: si, score_a: sa, score_s: ss, score_e: se, score_c: sc,
      top_code: topCode,
      is_flat_profile: flat,
    })
    .select()
    .single();
  if (attErr) return res.status(500).json({ error: attErr.message });

  // 6. Save answers and matches; if either fails, delete the half-saved attempt
  const { error: ansErr } = await supabase.from('answers').insert(
    answers.map((x) => ({ attempt_id: attempt.id, question_id: x.question_id, value: x.value }))
  );
  const { error: matchErr } = ansErr ? { error: null } : await supabase.from('matches').insert(
    ranked.map((m, index) => ({
      attempt_id: attempt.id,
      career_id: m.career.id,
      shape_score: m.shape,
      hexagon_score: m.hexagon,
      final_score: m.final,
      rank: index + 1,
    }))
  );
  if (ansErr || matchErr) {
    await supabase.from('attempts').delete().eq('id', attempt.id);   // cascades to answers/matches
    return res.status(500).json({ error: (ansErr || matchErr).message });
  }

  // 7. Reply
  res.status(201).json({
    attempt_id: attempt.id,
    scores: { R: sr, I: si, A: sa, S: ss, E: se, C: sc },
    top_code: topCode,
    is_flat_profile: flat,
    matches: ranked.map((m, index) => ({
      rank: index + 1,
      career_id: m.career.id,
      title: m.career.title,
      slug: m.career.slug,
      shape_score: m.shape,
      hexagon_score: m.hexagon,
      final_score: m.final,
    })),
  });
});

// GET /api/assessment/latest -> the most recent FINISHED attempt, with its matches
router.get('/latest', requireAuth, async (req, res) => {
  const { data: attempt, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', req.user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!attempt) return res.json(null);   // hasn't finished a test yet

  const { data: matches, error: mErr } = await supabase
    .from('matches')
    .select('rank, shape_score, hexagon_score, final_score, careers ( id, title, slug, description )')
    .eq('attempt_id', attempt.id)
    .order('rank');
  if (mErr) return res.status(500).json({ error: mErr.message });

  res.json({ attempt, matches });
});

export default router;
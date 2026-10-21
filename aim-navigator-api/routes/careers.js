import { Router } from 'express';
import { supabase } from '../supabaseClient.js';

const router = Router();

const LIST_FIELDS = `
  id, title, slug, description, education_level, salary_min, salary_max,
  salary_display, growth_pct, work_environment,
  score_r, score_i, score_a, score_s, score_e, score_c,
  career_tags ( tags ( name ) )
`;

const DETAIL_FIELDS = `
  *,
  career_skills ( skill_name, display_order ),
  roadmap_steps ( id, month_number, title, description, tasks ),
  resources ( id, roadmap_step_id, type, title, url ),
  career_tags ( tags ( name ) )
`;

// GET /api/careers?search=engineer&work_environment=Remote&education_level=Post-Graduate
router.get('/', async (req, res) => {
  let query = supabase.from('careers').select(LIST_FIELDS).order('title');

  if (req.query.search) query = query.ilike('title', `%${req.query.search}%`);
  if (req.query.work_environment) query = query.eq('work_environment', req.query.work_environment);
  if (req.query.education_level) query = query.eq('education_level', req.query.education_level);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/careers/slug/software-engineer -> full details by slug (the frontend uses this)
router.get('/slug/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('careers').select(DETAIL_FIELDS).eq('slug', req.params.slug).maybeSingle();

  if (error || !data) return res.status(404).json({ error: 'Career not found' });
  res.json(data);
});

// GET /api/careers/:id -> full details by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('careers').select(DETAIL_FIELDS).eq('id', req.params.id).maybeSingle();

  if (error || !data) return res.status(404).json({ error: 'Career not found' });
  res.json(data);
});

export default router;
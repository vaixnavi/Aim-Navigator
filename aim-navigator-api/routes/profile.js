import { Router } from 'express';
import { supabase } from '../supabaseClient.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/profile -> my profile (null if not created yet)
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT /api/profile
// Body: { full_name, academic_level, field_of_study (optional), age_confirmed: true }
router.put('/', requireAuth, async (req, res) => {
  const { full_name, academic_level, field_of_study, age_confirmed } = req.body;

  const isText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

  if (!isText(full_name, 100)) {
    return res.status(400).json({ error: 'full_name must be 1-100 characters' });
  }
  if (!isText(academic_level, 100)) {
    return res.status(400).json({ error: 'academic_level is required' });
  }
  if (field_of_study != null && typeof field_of_study === 'string' && field_of_study.length > 100) {
    return res.status(400).json({ error: 'field_of_study is too long' });
  }
  if (age_confirmed !== true) {
    return res.status(400).json({ error: 'You must confirm you are 18 or older' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: req.user.id,
      full_name: full_name.trim(),
      academic_level: academic_level.trim(),
      field_of_study: field_of_study?.trim() || null,
      age_confirmed: true,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
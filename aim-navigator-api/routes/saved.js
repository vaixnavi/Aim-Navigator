import { Router } from 'express';
import { supabase } from '../supabaseClient.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/saved -> my bookmarked careers
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('saved_careers')
    .select('career_id, created_at, careers ( id, title, slug, description, salary_display, growth_pct )')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/saved/:careerId -> bookmark
router.post('/:careerId', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('saved_careers')
    .upsert({ user_id: req.user.id, career_id: req.params.careerId });

  if (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Career or profile not found. Complete your profile first.' });
    }
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ ok: true });
});

// DELETE /api/saved/:careerId -> remove bookmark
router.delete('/:careerId', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('saved_careers')
    .delete()
    .eq('user_id', req.user.id)
    .eq('career_id', req.params.careerId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
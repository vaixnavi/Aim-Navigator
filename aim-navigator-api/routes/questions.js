import { Router } from 'express';
import { supabase } from '../supabaseClient.js';

const router = Router();

// GET /api/questions -> 48 questions, grouped by page (step_number 1-8)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('id, prompt, step_number, display_order')   // "dimension" stays hidden
    .order('step_number')
    .order('display_order');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
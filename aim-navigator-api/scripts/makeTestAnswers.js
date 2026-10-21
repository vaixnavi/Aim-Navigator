import { supabase } from '../supabaseClient.js';

const { data, error } = await supabase.from('questions').select('id, dimension');
if (error) { console.error(error.message); process.exit(1); }

// Fake student: loves Investigative questions (5), dislikes everything else (1)
const answers = data.map((q) => ({ question_id: q.id, value: q.dimension === 'I' ? 5 : 1 }));
console.log(JSON.stringify({ answers }));
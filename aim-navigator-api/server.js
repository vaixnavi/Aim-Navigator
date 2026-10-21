import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import questionsRoutes from './routes/questions.js';
import careersRoutes from './routes/careers.js';
import assessmentRoutes from './routes/assessment.js';
import savedRoutes from './routes/saved.js';
import profileRoutes from './routes/profile.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/questions', questionsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/profile', profileRoutes);

// Catch-all for unknown URLs
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Catch-all for crashes, so the server doesn't die
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
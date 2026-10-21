# Aim Navigator

**Take the RIASEC test. Get matched careers. Follow the roadmap.**

Aim Navigator is a career guidance web platform for school and college students. It uses Holland's RIASEC interest model to understand what a student enjoys, matches them with suitable careers, and shows a clear roadmap for the careers they pick.

> Add a screenshot of the landing page here, for example `![Aim Navigator](./docs/screenshot.png)`

## The problem

Many students choose a stream or career based on marks, pressure from others, or guesswork. They rarely get a simple way to connect their interests with real careers and the steps needed to reach them.

## What it does

- **Interest assessment:** a 48-question RIASEC test, split into short steps so it is easy to finish.
- **Career matches:** results are ranked by how well each career fits the student's interest profile.
- **Explore careers:** a catalog of 54 careers with filters, so students can browse beyond their top matches.
- **Career details:** salary, growth, work environment and a step-by-step roadmap for each career.
- **Accounts:** sign up with email and password or with Google, so results are saved to the student's profile.
- **Light and dark theme** toggle.

## How matching works

Each career has a RIASEC score profile. A student's answers produce their own RIASEC profile. The match score is a hybrid of two measures:

- **60%** shape similarity (Pearson correlation between the two profiles)
- **40%** hexagon congruence (how close the two profiles sit on Holland's hexagon)

Careers are then ranked by the combined score.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TanStack Start, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express (`aim-navigator-api/`) |
| Database and auth | Supabase (PostgreSQL, email auth, Google OAuth) |
| Hosting | Cloudflare (frontend), Render (backend) |
| Tooling | Bun / npm, ESLint, Prettier |

## Project structure

```
Aim-Navigator/
├── src/                  # Frontend source (routes, components, styles)
├── public/               # Static assets
├── logo/                 # Logo files
├── aim-navigator-api/    # Backend API (Node/Express)
├── package.json          # Frontend dependencies and scripts
├── vite.config.ts
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18 or newer (or Bun)
- A Supabase project with the Aim Navigator tables set up
- Git

### 1. Clone the repository

```bash
git clone https://github.com/vaixnavi/Aim-Navigator.git
cd Aim-Navigator
```

### 2. Set up and run the backend

```bash
cd aim-navigator-api
npm install
```

Create a `.env` file inside `aim-navigator-api/` with your own values:

```
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
```

Use the exact variable names your backend code reads. Then start it:

```bash
npm start
```

### 3. Set up and run the frontend

From the project root:

```bash
bun install      # or: npm install
```

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

Again, match the variable names used in the code. Then start the dev server:

```bash
bun run dev      # or: npm run dev
```

Open the local address shown in the terminal.

> Never commit `.env` files. Keep the Supabase service role key on the backend only.

## Deployment

- **Backend:** deployed on Render with the root directory set to `aim-navigator-api`. Environment variables are added in the Render dashboard.
- **Frontend:** deployed on Cloudflare, connected to this repository. `VITE_` variables are added as build variables.
- After deploying, add the live frontend URL to the backend CORS list, to Supabase under Authentication > URL Configuration, and to the Google OAuth authorized origins.

## Future scope

- AI career assistant for follow-up questions
- Live sessions with expert career counsellors
- More careers and regularly updated market data

## Team

- Utkarsha Kanase
- Gauri Kumbhar
- Vasishnavi Mane
- Anuja Naik

Built as an academic project.

## Acknowledgements

- Holland's RIASEC (Holland Codes) interest model
- Career data compiled from public sources

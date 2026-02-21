# Eremos - Daily Prayer & Reflection App

## Overview
Eremos is a contemplative prayer and journaling application structured around daily scripture reading, meditation, self-examination, and free prayer. Data is stored locally per-user in IndexedDB (Dexie.js). Authentication is handled via Replit Auth (OpenID Connect) supporting email, Google, GitHub, and Apple sign-in.

## Architecture
- **Frontend**: React + Vite + TypeScript, TailwindCSS, shadcn/ui components, wouter for routing
- **Backend**: Express.js (minimal — auth routes only), PostgreSQL for auth sessions/users
- **Local Data**: Dexie.js (IndexedDB) for all prayer session data, scoped per userId
- **Auth**: Replit Auth (OIDC) via `server/replit_integrations/auth/`

## Key Files
- `client/src/lib/db.ts` — Dexie database schema (sessions, responses, checklist, mood, bible plan, exam questions)
- `client/src/hooks/use-eremos.ts` — Core hooks: session management, reading plan, prompts, checklist, mood, export
- `client/src/hooks/use-auth.ts` — Auth hook from Replit Auth integration
- `client/src/pages/Home.tsx` — Main dashboard (session start, resume, journal, delete/restart, history)
- `client/src/pages/Wizard.tsx` — Step-by-step prayer wizard (11 steps)
- `client/src/pages/Journal.tsx` — Mid-day/evening reflection journaling for completed sessions
- `client/src/pages/Landing.tsx` — Landing page for unauthenticated users
- `server/routes.ts` — Express routes (auth setup + health check)
- `shared/models/auth.ts` — Drizzle schema for users/sessions tables
- `public/data/bible_plan.csv` — 365-day Bible reading plan
- `public/data/desert_examination_framework.csv` — Examination questions by category

## Session Flow
1. User clicks "Start" → creates a new session for today with auto-incremented planDay
2. Wizard walks through: Orientation → Lectio Divina → 3 Meditations → 3 Examinations → Mood → Free Prayer → Benediction
3. On completion, session status changes to "completed"
4. Completed sessions for today show "Add Reflections" → Journal page with mid-day/evening tabs
5. Sessions can be restarted (clears responses, keeps day number) or deleted entirely
6. Markdown export includes all responses plus journal entries

## Color Palette
Warm contemplative parchment/stone palette: cream background, deep slate-blue primary, warm earthy neutrals.

## Recent Changes
- 2026-02-21: Added Replit Auth integration (email/password, Google, GitHub, Apple)
- 2026-02-21: Updated color palette from monochrome to warm contemplative tones
- 2026-02-21: Added delete day / restart day controls with confirmation dialogs
- 2026-02-21: Added Journal page for mid-day and evening reflections after session completion
- 2026-02-21: Scoped all session data by userId in IndexedDB for per-user isolation
- 2026-02-21: Added user bar with avatar, name, and sign-out button

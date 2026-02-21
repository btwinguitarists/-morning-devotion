# Eremos - Daily Prayer & Reflection App

## Overview
Eremos (ἔρημος — "the desolate place where Jesus withdrew to pray") is a contemplative prayer and journaling application structured around daily scripture reading, meditation, self-examination, and free prayer. All user data is stored server-side in PostgreSQL for permanent persistence across devices. Authentication is handled via Replit Auth (OpenID Connect) supporting email, Google, GitHub, and Apple sign-in.

## Architecture
- **Frontend**: React + Vite + TypeScript, TailwindCSS, shadcn/ui components, wouter for routing, TanStack React Query for data fetching
- **Backend**: Express.js with full REST API for prayer data, PostgreSQL (Drizzle ORM)
- **Data Storage**: All prayer sessions, responses, checklist items, mood entries, and highlights stored in PostgreSQL (server-side)
- **Reference Data**: Bible plan CSV and examination questions CSV loaded client-side (in-memory, not persisted)
- **Auth**: Replit Auth (OIDC) via `server/replit_integrations/auth/`
- **Bible Text**: BSB (Berean Standard Bible) fetched from bible.helloao.org API

## Key Files
- `shared/models/eremos.ts` — Drizzle schema for prayer data (sessions, responses, checklist, mood, highlights)
- `shared/models/auth.ts` — Drizzle schema for users/auth sessions tables
- `server/storage.ts` — Storage interface + DatabaseStorage implementation (all CRUD operations)
- `server/routes.ts` — Express API routes for sessions, responses, checklist, mood, highlights, export
- `client/src/hooks/use-eremos.ts` — Core hooks using TanStack Query: session management, reading plan, prompts, checklist, mood, export
- `client/src/hooks/use-auth.ts` — Auth hook from Replit Auth integration
- `client/src/lib/bible.ts` — Bible book mapping, reference parser, BSB API fetching
- `client/src/lib/benedictions.ts` — 30 rotating benedictions for closing prayers
- `client/src/components/ChapterReader.tsx` — Bible chapter reader with verse highlighting
- `client/src/components/MoodSlider.tsx` — Mood/inner state slider (1-10, Desolation to Consolation)
- `client/src/pages/Home.tsx` — Main dashboard (session start, resume, journal, delete/restart, history)
- `client/src/pages/Wizard.tsx` — Step-by-step prayer wizard (11 steps)
- `client/src/pages/Journal.tsx` — Mid-day/evening reflection journaling for completed sessions
- `client/src/pages/Landing.tsx` — Landing page with etymology, verse, donate link
- `public/data/bible_plan.csv` — 365-day Bible reading plan
- `public/data/desert_examination_framework.csv` — Examination questions by category

## API Routes
- `GET/POST /api/sessions` — List all / create session
- `GET /api/sessions/current?date=` — Get today's or in-progress session
- `GET /api/sessions/last-completed` — Get last completed session
- `PATCH /api/sessions/:id` — Update step/status
- `DELETE /api/sessions/:id` — Delete session and related data
- `POST /api/sessions/:id/restart` — Restart session (clear responses, keep day)
- `GET/POST /api/sessions/:id/responses` — Get/upsert response
- `GET/POST /api/sessions/:id/checklist` — Get/bulk create checklist
- `PATCH /api/checklist/:id` — Toggle checklist item
- `GET/POST /api/sessions/:id/mood` — Get/upsert mood
- `GET/POST /api/sessions/:id/highlights` — Get/create highlight
- `GET /api/sessions/:id/export` — Export session data for markdown

## Session Flow
1. User clicks "Start" → creates a new session for today with auto-incremented planDay
2. Wizard walks through: Morning Consecration → Lectio Divina → 3 Meditations → 3 Examinations → Inner State → Free Prayer → Benediction
3. On completion, session status changes to "completed"
4. Completed sessions for today show "Add Reflections" → Journal page with mid-day/evening tabs
5. Sessions can be restarted (clears responses, keeps day number) or deleted entirely
6. Markdown export includes all responses plus journal entries

## Color Palette
Warm contemplative parchment/stone palette: cream background, deep slate-blue primary, warm earthy neutrals.

## Donation
PayPal donate link in footer of landing page: `https://paypal.me/BenjaminVanScyoc`

## Recent Changes
- 2026-02-21: Migrated all user data from IndexedDB to server-side PostgreSQL for permanent cross-device persistence
- 2026-02-21: Added full REST API with Express routes for all prayer data
- 2026-02-21: Added PayPal donate button placeholder on landing page
- 2026-02-21: Added Greek etymology for "Eremos" on landing page
- 2026-02-21: Added scripture references to all quoted verses throughout the app
- 2026-02-21: Added BSB Bible text display with verse highlighting
- 2026-02-21: Added morning consecration prayer and 30 rotating benedictions
- 2026-02-21: Added Replit Auth integration (email/password, Google, GitHub, Apple)

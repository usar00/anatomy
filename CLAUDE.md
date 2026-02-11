# CLAUDE.md

## Project Overview

Anatomy Quiz (解剖学クイズ) is a full-stack Next.js web application for learning human anatomy through interactive quizzes. It features a Duolingo-style learning path with spaced repetition, multiple question formats, and a mascot character named Rin. Content and UI are in Japanese.

## Tech Stack

- **Framework:** Next.js 16.1.6 with App Router, React 19.2.3
- **Language:** TypeScript 5.9.3 (strict mode)
- **Styling:** Tailwind CSS 4 with CSS custom properties (light/dark theme via `prefers-color-scheme`)
- **Database:** PostgreSQL via Supabase (with Row Level Security)
- **Auth:** Supabase Auth (Google OAuth + anonymous sign-in)
- **State:** Zustand for client state
- **Animation:** Framer Motion
- **Fonts:** Geist Sans / Geist Mono (via `next/font/google`)

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint (flat config, eslint 9)
npm run import       # Import question data: tsx scripts/import-questions.ts
npm run import:dry   # Dry-run import (validation only)
# Learning path import (unit/section/concept structure):
npx tsx scripts/import-learning-path.ts scripts/data/unit1-skeletal-basics.json
npx tsx scripts/import-learning-path.ts scripts/data/unit1-skeletal-basics.json --replace  # 既存問題を削除して再インポート
```

There is no test framework configured. No test runner or test files exist.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/             # Authenticated route group (has Header + GuestBanner)
│   │   ├── home/           # Dashboard
│   │   ├── learn/          # Learning path (default experience)
│   │   │   └── [sectionId]/ # Section lesson view
│   │   ├── quiz/           # Quiz mode
│   │   ├── categories/     # Category selection
│   │   │   └── [id]/modes/ # Quiz mode picker
│   │   └── debug/          # Debug/testing page
│   ├── (public)/           # Public route group
│   │   └── login/          # Login page
│   ├── auth/callback/      # OAuth callback route handler
│   ├── layout.tsx          # Root layout (AuthProvider, fonts, metadata)
│   ├── page.tsx            # Landing page (hero, features, pricing)
│   └── globals.css         # Theme variables + Tailwind import
│
├── components/
│   ├── auth/               # AuthProvider (context), GuestBanner
│   ├── character/          # Rin mascot: Rin.tsx, SpeechBubble.tsx, messages.ts
│   ├── layout/             # Header
│   ├── learn/              # UnitMap, SectionCard
│   ├── lesson/             # Question renderers by interaction type:
│   │   ├── QuestionRenderer.tsx  # Routes to correct component
│   │   ├── StandardMCQ.tsx       # Multiple choice
│   │   ├── WordBank.tsx          # Fill-in-the-blank
│   │   ├── MatchingPairs.tsx     # Pair matching
│   │   └── FreeInput.tsx         # Free text input
│   ├── quiz/               # ChoiceList, QuestionCard, ProgressBar, ExplanationPanel, QuizResult
│   └── ui/                 # Button, Card (shared primitives)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client (createBrowserClient)
│   │   ├── server.ts       # Server client (createServerClient with cookies)
│   │   └── middleware.ts    # Session refresh middleware
│   ├── queries/
│   │   ├── dashboard.ts    # Dashboard statistics queries
│   │   └── learning.ts     # Learning path data (units, sections, progress)
│   ├── spaced-repetition.ts # SM-2 algorithm (mastery 0-5, review intervals)
│   └── utils.ts            # cn(), formatPercent(), shuffle()
│
├── types/
│   ├── database.ts         # Auto-generated Supabase schema types
│   └── quiz.ts             # App-level type aliases and interfaces
│
└── middleware.ts            # Next.js middleware (auth session refresh)

supabase/migrations/         # SQL migration files (001-003)
scripts/                     # CLI utilities (import, image processing)
public/images/               # Static assets (anatomy images, Rin character WebPs)
```

## Architecture Patterns

### Routing

Uses Next.js App Router with route groups:
- `(main)` group: Protected pages with shared layout (Header + GuestBanner). The layout is in `src/app/(main)/layout.tsx`.
- `(public)` group: Login page, no auth required.
- Root `layout.tsx` wraps everything in `AuthProvider`.

### Authentication

- `AuthProvider` (`src/components/auth/AuthProvider.tsx`) is a React context providing `user`, `isGuest`, `isFreeMember`, `signInAnonymously`, `upgradeToGoogle`, `signOut`.
- Three user roles: `guest` (anonymous), `free` (Google-authenticated), `premium` (Stripe subscription, planned).
- Middleware at `src/middleware.ts` refreshes Supabase sessions on every request.
- Guest users can use the app immediately; Google upgrade preserves their data via `linkIdentity`.

### Supabase Clients

- **Browser:** `src/lib/supabase/client.ts` - use in `"use client"` components.
- **Server:** `src/lib/supabase/server.ts` - use in Server Components and Route Handlers (async, reads cookies).
- **Import scripts:** Use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

### Data Model

Learning hierarchy: **Unit** -> **Section** -> **Concept** -> **Question**

Question interaction types: `standard_mcq`, `word_bank`, `matching_pairs`, `free_input`. The `metadata` JSONB column stores type-specific data (`WordBankMeta`, `MatchingPairsMeta`, `FreeInputMeta` in `src/types/quiz.ts`).

### Component Patterns

- Client components use `"use client"` directive at the top.
- Props interfaces are defined inline above the component in the same file.
- Named exports for components (not default), except page components which use `export default function`.
- `cn()` utility for conditional class merging (no clsx/classnames library).
- Tailwind classes directly in JSX; theme colors via CSS variables (e.g., `text-primary`, `bg-card`).

## Code Conventions

- **Path aliases:** `@/*` maps to `./src/*` (e.g., `import { cn } from "@/lib/utils"`).
- **Types:** Row types are aliased from the auto-generated `Database` type in `src/types/quiz.ts`. Composite types (e.g., `QuestionWithChoices`) extend row types with additional fields.
- **No Prettier:** No formatter configured. Follow existing code style (2-space indent, double quotes, semicolons).
- **ESLint:** Flat config with `next/core-web-vitals` and `next/typescript` presets.
- **TypeScript:** Strict mode enabled. Non-null assertions (`!`) used for env vars. Avoid `any`; use `Record<string, unknown>` for dynamic objects.
- **Comments:** In-code comments are in Japanese. Function/module-level doc comments use JSDoc format in Japanese.
- **Commit messages:** In Japanese, prefixed with conventional commit types (`feat:`, `fix:`, `chore:`).

## Database

- PostgreSQL via Supabase with RLS on all tables.
- Migrations in `supabase/migrations/` (ordered 001-003).
- UUID primary keys throughout.
- Content tables (categories, questions, choices, units, sections, concepts) are publicly readable.
- User data tables (quiz_sessions, quiz_answers, daily_streaks, user_section_progress, user_concept_mastery) are scoped to `auth.uid()`.
- Profile creation is automatic via a database trigger on `auth.users` insert.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Client-side anon key
SUPABASE_SERVICE_ROLE_KEY       # Server-only, for import scripts (bypasses RLS)
```

Stripe keys are defined in the example but not yet active (planned for premium tier).

## Content Import

Question data lives in `scripts/data/*.json`. Import workflow:

1. Create/edit JSON files following the schema in `scripts/schemas/question-schema.json`.
2. Validate with dry run: `npm run import:dry`
3. Import to database: `npm run import`

The import script (`scripts/import-questions.ts`) handles category creation, section/concept linking, duplicate detection, and slug generation.

AI-generated questions can use the prompt template at `scripts/prompts/generate-questions.md`.

## Anatomy Images

Question images are sourced from **Wikimedia Commons** (Gray's Anatomy plates, OpenStax, Blausen Medical etc.) and stored in `public/images/anatomy/`. All images are Public Domain or CC BY 3.0 licensed.

- **Attribution file:** `public/images/anatomy/ATTRIBUTIONS.md` — lists source, author, and license for each image. Must be updated when adding new images.
- **Image roles in questions:** `main` (shown during quiz), `explanation` (shown after answering), `choice` (per-choice images).
- **Naming convention:** Descriptive kebab-case filenames (e.g., `bone-classification-types.png`, `vertebral-column-colored.png`).
- **Formats:** PNG/JPG for raster images from Wikimedia, SVG for vector diagrams. All served from `public/` via Next.js `<Image>`.
- **Question text style:** Image-based questions reference English anatomical labels visible in the images (e.g., "図中の「Compact bone」に相当する日本語名称は？") to reinforce bilingual terminology learning.

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, AuthProvider wrapper, metadata |
| `src/components/auth/AuthProvider.tsx` | Auth context (user state, sign-in/out) |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/types/quiz.ts` | All app-level TypeScript types |
| `src/types/database.ts` | Auto-generated DB schema types |
| `src/lib/spaced-repetition.ts` | SM-2 review scheduling algorithm |
| `src/components/lesson/QuestionRenderer.tsx` | Routes questions to interaction-specific components |
| `src/lib/queries/learning.ts` | Learning path data fetching |
| `src/app/globals.css` | Theme color definitions (light + dark) |
| `supabase/migrations/001_initial_schema.sql` | Core database tables |
| `supabase/migrations/003_learning_path.sql` | Learning path tables |

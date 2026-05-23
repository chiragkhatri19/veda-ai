# VedaAI — Assessment Creator

AI-powered question paper generator for Indian school teachers. Describe what you need — subject, grade, question types, difficulty split — and get back a properly structured, print-ready exam paper in under two minutes.

**Live →** `[add Vercel URL after deployment]`  
**API →** `[add Railway URL after deployment]/api/health`

---

## How it works

A teacher fills out the creation form, hits submit, and the UI immediately transitions to a live progress view. The progress bar moves in real time as the backend works: prompt is built, Gemini generates, the response is parsed and validated, the paper is stored. When it's done, the output page renders — sections, questions, difficulty badges, marks, answer key — ready to print or download as PDF.

Nothing from the LLM is ever rendered directly. Every response goes through `responseParser.ts` before it reaches the frontend.

---

## Architecture

The generation pipeline is asynchronous by design. The HTTP endpoint returns in under 50ms; a BullMQ worker handles the long-running Gemini call in the background.

```
Browser (Next.js 14)
├── REST via Axios       →  Express API  →  MongoDB (Atlas)
└── Socket.IO client     ←  Socket.IO server
                                  ↑
                           BullMQ Worker
                                  ↑
                         Google Gemini API
                        (gemini-2.5-flash)
                                  ↑
                         Redis (Upstash)
                       job queue + state
```

**Generation flow, step by step:**

1. `POST /api/assignments` creates a Mongoose document (`jobStatus: 'queued'`), calls `assignmentQueue.add()`, and returns the document ID — the HTTP response is back before a single token is generated.
2. The BullMQ worker picks up the job and emits five Socket.IO progress events (10% → 25% → 70% → 90% → 100%) as it works through each stage.
3. At 70%, the raw Gemini text goes through `responseParser.ts`. It validates every field, normalises difficulty strings (`"Medium"` → `"moderate"`, `"Hard"` → `"hard"`), and coerces null hints to empty strings. A malformed or incomplete response throws — the job fails cleanly and can be retried.
4. On success, `questionPaper` is written back to MongoDB, `jobStatus` becomes `'completed'`, and the client auto-navigates to the output view.

**Why a job queue rather than `await aiService.generate()`?**

Gemini takes 15–30 seconds on a full paper. Doing this inline blocks the event loop for that entire duration, and a server restart mid-request loses the result with no recovery path. BullMQ with Redis gives us retry logic, progress tracking, and a result that survives restarts. The queue also naturally handles burst traffic — multiple simultaneous submissions don't stack up on a single thread.

---

## What's implemented

### Per the assignment

- Multi-step creation form: file upload (PDF/image), due date, up to six question types with per-type count and marks, difficulty percentage split, additional instructions, class group assignment
- Zod validation at the schema level — negative marks, empty question type names, and zero counts all fail before any network request is made
- `promptBuilder.ts` constructs a structured prompt that specifies subject, grade, question types with exact counts, difficulty split, reference material, and the complete JSON output schema. The prompt ends with `"Start your response with \`{\`"` to prevent markdown wrapping.
- LLM output goes through `responseParser.ts` before touching the frontend. Validates structure, types, difficulty enum values, and presence of required fields.
- Full backend: MongoDB (data), Redis (job state via ioredis), BullMQ (worker), Socket.IO (real-time progress)
- Output page: student info section, questions grouped by section, difficulty badge per question (Easy / Moderate / Hard), marks, answer key, download as PDF, regenerate action

### Beyond the brief

| Addition | Why |
|----------|-----|
| **Rubric Generator** | A natural companion to question paper creation — same Gemini → parse → display pattern, different prompt shape |
| **Class Groups** | Teachers organise students into groups; `groupId` is threaded through shared types, Mongoose schema, service layer, and creation form |
| **My Library** | Browse and re-download every completed paper without regenerating; filtered by subject, searchable |
| **Seed script** | `pnpm --filter @veda/api seed` — three realistic demo assignments so reviewers see a populated dashboard, not an empty state |
| **19 unit tests** | Vitest tests on `promptBuilder` and `responseParser` — the two functions where a silent bug degrades output quality without any visible error |
| **Navigation progress bar** | Custom `NavigationProgress` component that listens for link clicks in the capture phase and shows an orange bar immediately — before the JS bundle for the next route even loads |
| **Pixel-accurate skeleton loaders** | Every route has a `loading.tsx` whose DOM structure mirrors the real page exactly, so the skeleton-to-content transition involves no layout shift |

---

## Quick start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 LTS |
| pnpm | ≥ 9 |
| Docker | for local MongoDB + Redis |

### Local setup

```bash
git clone https://github.com/YOUR_USERNAME/veda-ai.git
cd veda-ai
pnpm install

# Start MongoDB and Redis
docker-compose up -d

# Environment
cp apps/api/.env.example apps/api/.env
# Open apps/api/.env and add your Gemini API key

# Seed demo data (optional — gives you a populated UI on first run)
pnpm --filter @veda/api seed

# Start both services
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/api/health |

---

## Deployment

### 1. MongoDB — Atlas (free M0)

1. Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user and allow access from anywhere (`0.0.0.0/0`)
3. Copy the connection string — use it for `MONGODB_URI`

### 2. Redis — Upstash (free)

1. Create a Redis database at [console.upstash.com](https://console.upstash.com)
2. Copy the Redis URL — use it for `REDIS_URL`

### 3. Backend — Railway

1. New project → Deploy from GitHub repo
2. Leave root directory as `/` (monorepo root)
3. Set **Build Command**: `pnpm install && pnpm --filter @veda/shared build && pnpm --filter @veda/api build`
4. Set **Start Command**: `pnpm --filter @veda/api start`
5. Add all environment variables from the table below
6. Note the generated Railway URL — you'll need it for the frontend

### 4. Frontend — Vercel

1. Import the repo in [vercel.com](https://vercel.com)
2. Set **Root Directory** to `apps/web`
3. Vercel auto-detects Next.js; override **Build Command** to:
   ```
   cd ../.. && pnpm install && pnpm --filter @veda/shared build && pnpm --filter @veda/web build
   ```
4. Add environment variables:
   - `API_URL` → your Railway backend URL (server-side rewrite target — never exposed to the browser)
   - `NEXT_PUBLIC_SOCKET_URL` → your Railway backend URL

---

## Environment variables

### `apps/api/.env`

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `GEMINI_API_KEY` | ✅ | — | [Get one free at Google AI Studio](https://aistudio.google.com) |
| `MONGODB_URI` | ✅ | `mongodb://localhost:27017/veda_ai` | Atlas connection string in production |
| `REDIS_URL` | ✅ | `redis://localhost:6379` | Upstash URL in production |
| `FRONTEND_URL` | ✅ | `http://localhost:3000` | Vercel URL in production — used for CORS |
| `PORT` | — | `4000` | Railway sets this automatically |
| `NODE_ENV` | — | `development` | Set to `production` when deployed |

### `apps/web/.env.local`

| Variable | Required | Notes |
|----------|----------|-------|
| `API_URL` | ✅ | Backend base URL — used by Next.js rewrites on the server; Railway URL in production |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | Same as API URL; Socket.IO connects directly from the browser |

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/assignments` | List all assignments (newest first) |
| `POST` | `/api/assignments` | Create assignment and enqueue generation job |
| `GET` | `/api/assignments/:id` | Fetch a single assignment with its question paper |
| `DELETE` | `/api/assignments/:id` | Delete assignment |
| `POST` | `/api/assignments/:id/regenerate` | Re-queue generation (resets `jobStatus` to `queued`) |
| `GET` | `/api/assignments/:id/pdf` | Stream generated PDF |
| `POST` | `/api/toolkit/rubric` | Generate a marking rubric with four performance levels |
| `GET` | `/api/health` | Health check — returns `{ status: "ok" }` |

---

## Project structure

```
veda-ai/
├── apps/
│   ├── api/                        # Express + TypeScript backend
│   │   └── src/
│   │       ├── config/             # env validation (Zod), MongoDB, Redis
│   │       ├── controllers/        # HTTP handlers — thin, delegate to services
│   │       ├── middleware/         # error handler, file upload (multer), request validation
│   │       ├── models/             # Mongoose schemas + IAssignment interface
│   │       ├── queues/             # BullMQ queue definition + worker (full generation pipeline)
│   │       ├── routes/             # Express routers
│   │       ├── scripts/            # seed.ts — demo data
│   │       ├── services/           # ai, assignment, pdf, rubric
│   │       ├── socket/             # Socket.IO server + emitJobProgress helper
│   │       └── utils/
│   │           ├── logger.ts       # Custom coloured logger (no third-party logging lib)
│   │           ├── promptBuilder.ts
│   │           ├── promptBuilder.test.ts
│   │           ├── responseParser.ts
│   │           └── responseParser.test.ts
│   └── web/                        # Next.js 14 App Router frontend
│       ├── app/                    # Pages + loading.tsx skeleton per route
│       │   ├── dashboard/
│       │   ├── assignments/[id]/
│       │   ├── assignments/create/
│       │   ├── groups/
│       │   ├── library/
│       │   ├── toolkit/rubric/
│       │   └── settings/
│       ├── components/
│       │   ├── layout/             # Sidebar, TopBar, NavigationProgress
│       │   ├── assignments/        # AssignmentCard, AssignmentList, EmptyState
│       │   ├── create/             # StepIndicator, Step1_UploadDetails
│       │   ├── output/             # QuestionPaperView, SectionBlock, QuestionItem, DifficultyBadge, ActionBar
│       │   └── shared/             # JobProgressIndicator, SkeletonCard
│       ├── hooks/                  # useAssignments, useJobProgress, useCreateAssignment
│       ├── lib/                    # Axios client (typed), Socket.IO client
│       └── store/                  # Zustand stores — assignments, groups, user
└── packages/
    └── shared/                     # TypeScript types shared between api and web
        └── src/types/
            └── assignment.ts       # Assignment, CreateAssignmentInput, GeneratedQuestionPaper, JobStatus
```

---

## Running tests

```bash
pnpm --filter @veda/api test
```

19 tests across two files:

**`promptBuilder.test.ts`** — 9 tests covering total marks calculation, total question count, section label generation, reference material inclusion/exclusion/truncation, additional instructions, subject and grade embedding, and the JSON-start instruction.

**`responseParser.test.ts`** — 10 tests covering valid JSON parsing, code-fence stripping (with and without language tag), malformed JSON, missing required fields, invalid difficulty values, null hint coercion, all three valid difficulty strings, and Gemini capitalisation normalisation (`"Medium"` → `"moderate"`, `"Hard"` → `"hard"`).

---

## Type-checking

```bash
# Check all three packages at once
pnpm typecheck

# Or individually
pnpm --filter @veda/shared exec tsc --noEmit
pnpm --filter @veda/api exec tsc --noEmit
pnpm --filter @veda/web exec tsc --noEmit
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 14 App Router |
| Language | TypeScript (strict mode, both apps) |
| Styling | Tailwind CSS v3 |
| State management | Zustand with immer + persist middleware |
| Form handling | React Hook Form + Zod |
| Backend | Express 4 |
| Database | MongoDB + Mongoose |
| Job queue | BullMQ |
| Cache / queue broker | Redis (ioredis) |
| Real-time | Socket.IO |
| AI model | Google Gemini `gemini-2.5-flash` |
| Testing | Vitest |
| Monorepo | pnpm workspaces |
| Frontend deployment | Vercel |
| Backend deployment | Railway |
| Database (prod) | MongoDB Atlas |
| Redis (prod) | Upstash |

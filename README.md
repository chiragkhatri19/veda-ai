# VedaAI

Most AI tools hand you a list of questions. VedaAI hands you an exam paper — school name on top, sections with instructions, question numbers, marks per question, difficulty split, answer key, diagram space, the works. Print it and walk into class.

Built for Indian school teachers. CBSE and ICSE curriculum. Under two minutes.

**Live →** https://veda-ai-tawny.vercel.app
**API health →** https://api-production-eeb3.up.railway.app/api/health

---

## What we did differently

**The output is a paper, not a list.** The prompt includes the full JSON schema the model must return — sections, question types, marks, difficulty, answers, `diagramDescription` for graph questions. The response is validated by `responseParser.ts` (Zod, strict) before a single field touches the database. Garbage output fails fast, the job can be retried, the DB stays clean.

**The generation is async by design.** Gemini takes 15–30 seconds on a full paper. Doing that inline blocks your event loop and loses the result if the server restarts mid-request. Instead: the HTTP endpoint returns in under 50ms with a job ID. A BullMQ worker handles the actual LLM call in the background, emitting five Socket.IO progress events as it moves through stages. The client watches a live progress bar and auto-navigates when the paper lands.

**Diagram questions actually have a diagram space.** When the question type is `diagram_graph`, the AI is explicitly instructed to fill `diagramDescription` with precise axis labels, units, data ranges, or structural parts to draw. The output page renders a dashed-border figure box with that description and a blank drawing area below it. The print version keeps the dashed border.

**The prompt ends with `"Start your response with \`{\`".`** This sounds small. It matters. Without it, Gemini wraps its JSON in markdown code fences half the time. The parser strips those anyway, but starting the response with an open brace is a 0ms fix that makes the rest more reliable.

---

## How generation works, step by step

1. Teacher fills in the form. Subject, grade, due date, question types with counts and marks per question, optional reference material or extra instructions.

2. `POST /api/assignments` creates a record (`jobStatus: 'queued'`), adds the job to BullMQ, and returns the ID. HTTP response is back before a token is generated.

3. The worker picks it up. It emits progress over Socket.IO at 10%, 25%, 70%, 90%, and 100% as it: validates input, builds the prompt, calls Gemini, parses and validates the response, and writes the paper to MongoDB.

4. The client is watching. `useJobProgress` listens via Socket.IO and drives the progress bar in real time. On completion it re-fetches the assignment and the output page renders.

```
Browser (Next.js 14)
  REST via Axios        Express API      MongoDB Atlas
  Socket.IO client      Socket.IO server
                                 BullMQ Worker
                                 Google Gemini (gemini-2.5-flash)
                                 Redis (Upstash, job queue)
```

---

## What's in the box

**Question paper generator** — six question types (MCQ, short answer, long answer, numerical, diagram/graph, true/false). Configurable count and marks per type. CBSE/ICSE difficulty split: 40% easy, 40% moderate, 20% hard. Optional file upload for reference material (the first 3000 chars land in the prompt). School name, subject, grade, and generated timestamp on every paper.

**Rubric and marking scheme** — describe an assessment topic, get back a four-level rubric (Excellent, Good, Satisfactory, Needs Work) with up to eight criteria. Same Gemini → Zod → display pipeline, different prompt shape.

**My Library** — every completed paper lives here, searchable by title and filterable by subject. Re-download the PDF anytime without regenerating.

**Class Groups** — organise students into named groups with a subject and grade. `groupId` is threaded through types, schema, service, and the creation form.

**19 unit tests** — `promptBuilder.test.ts` (9 tests) covers total marks, question counts, section labels, reference material truncation, and the JSON-start instruction. `responseParser.test.ts` (10 tests) covers valid input, code-fence stripping, malformed JSON, missing fields, difficulty normalisation (`"Medium"` → `"moderate"`), and null coercion.

**Seed script** — `pnpm --filter @veda/api seed` drops three realistic demo assignments so reviewers see a populated dashboard.

---

## Quick start

```bash
git clone https://github.com/chiragkhatri19/veda-ai.git
cd veda-ai
pnpm install

# Start MongoDB and Redis (or point the env vars at Atlas + Upstash)
docker-compose up -d

cp apps/api/.env.example apps/api/.env
# Add GEMINI_API_KEY to apps/api/.env

pnpm --filter @veda/api seed   # optional demo data
pnpm dev
```

Frontend runs at `http://localhost:3000`, API at `http://localhost:4000`.

---

## Environment variables

`apps/api/.env`

| Variable | Notes |
|---|---|
| `GEMINI_API_KEY` | Get one free at aistudio.google.com |
| `MONGODB_URI` | Local: `mongodb://localhost:27017/veda_ai`. Prod: Atlas connection string |
| `REDIS_URL` | Local: `redis://localhost:6379`. Prod: Upstash URL |
| `FRONTEND_URL` | Vercel URL in production, used for CORS |
| `PORT` | Defaults to 4000. Railway sets this automatically |

`apps/web/.env.local`

| Variable | Notes |
|---|---|
| `API_URL` | Backend URL. Used by Next.js rewrites server-side, never exposed to the browser |
| `NEXT_PUBLIC_SOCKET_URL` | Same backend URL. Socket.IO connects directly from the browser |

---

## Tech stack

| | |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS v3 |
| State | Zustand with persist and immer |
| Backend | Express 4, TypeScript |
| Database | MongoDB via Mongoose |
| Job queue | BullMQ over Redis (ioredis) |
| Real-time | Socket.IO |
| AI | Google Gemini `gemini-2.5-flash` |
| Testing | Vitest |
| Monorepo | pnpm workspaces |
| Deployed | Vercel (frontend) + Railway (backend) + Atlas + Upstash |

---

## Running tests

```bash
pnpm --filter @veda/api test
```

---

## Project structure (short version)

```
veda-ai/
  apps/
    api/src/
      queues/       worker.ts — the full generation pipeline lives here
      utils/        promptBuilder.ts, responseParser.ts (and their tests)
      services/     ai, assignment, pdf, rubric
      socket/       Socket.IO server + progress emitter
    web/
      app/          one folder per route, loading.tsx skeleton for each
      components/
        output/     QuestionPaperView, SectionBlock, QuestionItem (diagram box here)
        shared/     GenerationScreen (the document-animation loader)
        layout/     Sidebar, MobileDock, NavigationProgress
      store/        Zustand — assignments, groups, user, notifications
  packages/
    shared/         TypeScript types shared between api and web
```

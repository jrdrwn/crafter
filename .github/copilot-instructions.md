# Copilot Instructions for this Repo

Purpose: enable AI coding agents to be productive fast by explaining architecture, workflows, conventions, and integration points specific to this project.

## Big Picture

- Stack: Next.js 15 (App Router) + Hono for API routing, Prisma ORM on PostgreSQL, pgvector for embeddings, Google Gemini for LLM+embeddings, Tailwind v4 UI.
- Core domains: personas (generated with prompt+RAG), contributions (RAG knowledge base), users/auth.
- Path aliases: `@/*` → `src/*`, `@db` → `prisma/`, `@sql` → Prisma typed SQL.

## Where Things Live

- API: `src/app/api/[[...route]]/` (catch‑all) with routers: `auth.ts`, `persona.ts`, `rag.ts`, `user.ts`; composed in `route.ts` via `app.route('/', ...)`.
- Persona + RAG: `src/lib/persona.service.ts` (prompting, retrieval, structured output), `src/lib/ingestion.ts` (RAG CRUD + embeddings pipeline).
- DB: Prisma schema + migrations in `prisma/`. Client exported as `@db` from `prisma/index.ts` (singleton for dev).
- Prompts: `prompt-en.yaml`, `prompt-id.yaml` (project root), fallback `public/prompt.yaml`.

## API Architecture & Conventions

- Hono app base path: `/api`. Authentication is JWT (Hono `jwt()` middleware) with allowlist bypasses for unauthenticated endpoints defined in `route.ts` (e.g., `/auth/login`, `/auth/register`, `/persona/generate/guest`, `persona/helper/*`).
- Validation: `@hono/zod-validator` + `zod`. Request bodies/queries use `zValidator` and `c.req.valid('json'|'query')`.
- Responses: JSON. Success typically `{ status: true, ... }`; errors return `{ status: false, message }` with appropriate HTTP codes.
- JWT payload is available as `c.get('jwtPayload')` and typed via `JWTPayload` in `types.d.ts`.

## Persona Generation Pattern

- Entrypoints: `/api/persona/generate` (auth) and `/api/persona/generate/guest`.
- Flow: Build YAML `construct` that encodes the expected output schema, choose prompt file by language (`prompt-id.yaml` or `prompt-en.yaml` → fallback `public/prompt.yaml`), optionally retrieve RAG docs, then LLM call returns a Zod‑validated JSON structure `{ result, taxonomy }`.
- Retrieval: `runPersonaRAG(model, construct, { topK, filters, queryTerms, skipRAG })` uses PGVectorStore. If `author_id` is present, results blend personal (private+public) and general (public) docs.

## RAG Knowledge Base

- Create/update/delete contributions via `/api/rag/contributions` (CRUD) and `/api/rag/contributions/upload` for `.txt/.docx/.xlsx`.
- Ingestion: raw text is chunked with `RecursiveCharacterTextSplitter`, embedded with `GoogleGenerativeAIEmbeddings(model: text-embedding-004)`, stored in `rag_embeddings` (PGVector) with metadata linking `doc_id`, author, language, visibility.
- Normalization: uploads are converted to a markdown “RAG note” by `normalizeToRAGNote` (Gemini) before ingesting.

## Data Model Essentials (Prisma)

- Core tables: `user`, `persona`, `domain`, `language`, `llm`, `attribute`, `persona_attribute`, `rag_documents`, `rag_embeddings`.
- Enums: `layer` (internal|external), `visibility` (private|public). `rag_embeddings.embedding` uses `vector` type.

## Dev Workflows

- Run dev: `npm run dev` (Turbopack). Build: `npm run build` (runs `prisma generate` then `next build`). Start: `npm start`.
- Database: PostgreSQL required (pgvector extension). Apply schema: `npx prisma migrate dev` (creates and applies migrations). Generate client: `npm run prisma:generate`.
- Env vars (see `example.env` but note DB must be Postgres): `DATABASE_URL` (Postgres), `JWT_SECRET`, `GEMINI_API_KEY`. pgvector must be installed; migrations create required indexes.
- BigInt JSON: handled via `types/global.d.ts` and an override in `rag.ts`.

## Adding/Changing API Routes (Pattern)

1. Create a router, e.g. `src/app/api/[[...route]]/foo.ts`:

```ts
import { Hono } from 'hono';

export const foo = new Hono().basePath('/foo');
foo.get('/bar', (c) => c.json({ status: true }));
```

2. Mount it in `src/app/api/[[...route]]/route.ts`:

```ts
import { foo } from './foo';

app.route('/', foo);
```

3. If it needs auth, don’t add it to the allowlist in `except([...])`.

## UI Conventions

- Tailwind v4 with `cn` helper in `src/lib/utils.ts`. UI primitives under `src/components/ui/*` (shadcn‑style). Use path aliases in imports (e.g., `import prisma from '@db'`).

## Gotchas

- `example.env` shows a MySQL URL but the app uses PostgreSQL + pgvector. Use a Postgres `DATABASE_URL`.
- Prompts must exist; missing prompt files throw. Ensure `prompt-en.yaml`/`prompt-id.yaml` or `public/prompt.yaml` are present.
- LLM and embeddings require `GEMINI_API_KEY`.

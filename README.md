# JanSetu AI — Smart Bharat Civic Companion

> **जनसेतु** ("people's bridge") — an AI civic companion for the *Smart Bharat* challenge
> (Devengers × PromptWars, Google **Build with AI**).

Government portals are **information-first** and menu/search based — citizens must already know
*what* to look for. **JanSetu AI is action-first**: a citizen picks a service and *explains their
problem in their own language*, and the AI companion — already scoped to that service — finds the
right answer, documents, department, complaint path, and next action, and tracks it.

## What it does (6 modules)

1. **Find a Scheme** — eligibility recommender + document checklist + next steps.
2. **Document Requirements & Decoder** — "which documents do I need?" + upload a govt PDF → plain-language explanation, deadlines, checklist.
3. **Report a Public Issue** — photo → AI-classified complaint draft + submit.
4. **Track a Complaint** — status timeline by complaint ID.
5. **Ask Anything** — multilingual civic Q&A over a curated dataset + web fallback.
6. **Transparency Dashboard** — public complaint analytics.

Multilingual across **10 languages** (English, Hindi, Marathi, Gujarati, Tamil, Kannada, Telugu,
Bengali, Punjabi, Urdu) — the chat replies in whatever language the site UI is set to, and Urdu
renders right-to-left.

## Architecture

Logical microservices in a single Next.js monorepo — an API gateway (Next.js route handlers)
fronting independently-testable domain services that share only typed contracts.

```
src/                       Next.js 15 app (App Router) — UI + API gateway
packages/contracts/        Zod schemas + TS types (the shared seams)
services/complaint-service/  create + track complaints, keyword classification
services/profile-service/    citizen profiles
services/dashboard-service/  transparency analytics
data/schemes.json          curated real-scheme dataset (text/JSON retrieval, no vectors)
```

## Tech

Next.js 15 · React 19 · Tailwind v4 · TypeScript · Zod · Vitest · OpenRouter (OpenAI-compatible
LLM API, multimodal) · Recharts · unpdf (PDF text extraction).

## Getting started

```bash
npm install
cp .env.example .env.local   # add OPENROUTER_API_KEY (optional — app runs without it)
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm test` (service unit tests) · `npm run typecheck`.

## CI / CD

- **CI** (`.github/workflows/ci.yml`) — on every push/PR to `main`: typecheck → unit tests → Next.js build.
- **CD** (`.github/workflows/deploy.yml`) — on push to `main`: deploys to Vercel. Skips gracefully
  until these repo secrets are set: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Optionally add `OPENROUTER_API_KEY` as a repo secret for build parity.

## Positioning

JanSetu AI is **not another portal** — it delivers, action-first and in the citizen's own language,
the service *functions* today spread across India.gov.in, UMANG, DigiLocker, CPGRAMS, Swachhata,
eDistrict, MyGov, and Bhashini. Real integrations with those systems are designed-for future work.

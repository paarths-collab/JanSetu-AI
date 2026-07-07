# JanSetu AI

**Smart Bharat Civic Companion.** An AI civic companion that turns confusing government processes into simple, guided steps in the citizen's own language. Ask, upload, report, track, decoded and delivered.

- **Live:** https://devengers-hackathon-five.vercel.app
- **Repository:** https://github.com/paarths-collab/JanSetu-AI
- **Challenge:** Devengers × PromptWars, Google *Build with AI* — *Smart Bharat: AI-Powered Civic Companion*.

Government portals are information-first and menu-driven. Citizens must already know *what* to search for. JanSetu AI is action-first: describe a problem in plain words in any of 10 Indian languages, and the assistant finds the right scheme, the right documents, the right department, and tracks the complaint.

## What it does

Six modules cover the judging criteria end to end:

1. **Find a Scheme** — eligibility recommender over a curated dataset of real government schemes, with document checklists and next steps.
2. **Document Requirements and Decoder** — plain-language explanation of any government notice or PDF, extracted deadlines, and a required-document checklist.
3. **Report a Public Issue** — photograph a pothole, garbage dump, streetlight, or drainage problem; the AI classifies the issue, drafts the complaint, and routes it to the right department.
4. **Track a Complaint** — visual status timeline for a citizen's own complaints, keyed by ID.
5. **Ask Anything** — a service-scoped multilingual chat that pulls scheme context, supports image and PDF attachments, and replies in the site's active language.
6. **Transparency Dashboard** — public analytics: totals, open vs resolved, by department, by ward, average resolution time.

## Highlights

- **Ten languages, live-switching.** English, Hindi, Marathi, Gujarati, Tamil, Kannada, Telugu, Bengali, Punjabi, Urdu (RTL). The chat replies in whatever language the site is currently set to, so switching mid-conversation flips the assistant automatically.
- **Multimodal chat.** Images (vision) plus PDFs (extracted server-side via `unpdf`), scoped per service through the system prompt.
- **AI with graceful degradation.** Powered by Google Gemini through OpenRouter (`google/gemini-2.5-flash`). Without a key, the app still demos fully: the scheme finder falls back to the curated dataset, complaint classification runs on keyword rules, and the chat returns a friendly placeholder.
- **Microservice-shaped monorepo.** Next.js frontend and API gateway on top of independently-testable domain services that share only typed Zod contracts. Splittable to independent deployments without rewriting.
- **CI and CD.** GitHub Actions runs typecheck, tests, and build on every push and PR to `main`. Vercel deployment on merge.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind v4 · TypeScript · Zod · Vitest · OpenRouter (Google Gemini) · `unpdf` for PDF text extraction · Recharts.

## Getting started

```bash
git clone https://github.com/paarths-collab/JanSetu-AI.git
cd JanSetu-AI
npm install
cp .env.example .env.local        # optional: add OPENROUTER_API_KEY
npm run dev                       # http://localhost:3000
```

Scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload. |
| `npm run build` | Production build (`next build`). |
| `npm run start` | Serve the production build. |
| `npm test` | Vitest suite (14 backend tests). |
| `npm run typecheck` | `tsc --noEmit` across the whole repo. |
| `npm run lint` | ESLint. |

Environment variables (see `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | No | Enables live AI. Without it, the app runs in graceful demo mode. |
| `OPENROUTER_MODEL` | No | Model override. Default: `google/gemini-2.5-flash`. |
| `TAVILY_API_KEY` | No | Web-search fallback for scheme queries outside the curated dataset. |

## Deployment

The repository is deployed on Vercel. Push to `main` triggers CI and, if `VERCEL_*` secrets are set, a production deploy.

For a one-off manual deploy:

```bash
npx vercel@latest --prod --yes --scope <your-team-slug>
```

## Documentation

- [High-level architecture](./docs/architecture-high-level.md) — system context, containers, key design decisions.
- [Low-level architecture](./docs/architecture-low-level.md) — directory layout, component and module diagrams, data model, API surface.
- [Functioning and flows](./docs/functioning.md) — sequence diagrams for every user-facing flow.

## Repository layout

```
apps/
  web/               (this repo's src/, Next.js app + gateway)
src/
  app/               App Router pages and API route handlers
  components/        Shared UI primitives, nav, logo, floating chat
  lib/               AI client, i18n, retrieval, backend singletons, helpers
packages/
  contracts/         Zod schemas and TS types shared by services + app
services/
  complaint-service/ Complaint creation, classification, tracking
  profile-service/   Citizen profile persistence
  dashboard-service/ Transparency analytics aggregation
data/
  schemes.json       Curated dataset of Indian government schemes
docs/                High-level, low-level, and functional documentation
.github/workflows/   CI (typecheck + test + build) and CD (Vercel)
```

## Positioning

JanSetu AI does not attempt to replace or clone existing government portals. It delivers, action-first and in the citizen's own language, the service *functions* today spread across India.gov.in, UMANG, DigiLocker, CPGRAMS, Swachhata, eDistrict, MyGov, and Bhashini. Real portal integrations are designed-for future work.

## License

Prototype for the Devengers × PromptWars *Build with AI* challenge. Complaint submission is simulated in this prototype and is designed to integrate with CPGRAMS, DigiLocker, and UMANG.

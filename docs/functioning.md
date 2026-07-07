# Functioning and Flows

End-to-end sequence diagrams for every user-facing capability in JanSetu AI. Read [`architecture-high-level.md`](./architecture-high-level.md) for context and [`architecture-low-level.md`](./architecture-low-level.md) for module APIs.

Throughout, "Citizen" is the person in the browser, "UI" is the React client, "Gateway" is a Next.js API route handler, "AI" is `src/lib/ai.ts` calling OpenRouter, and "SchemesDS" and the domain services live server-side.

## Flow 0: language-follows-UI

The language toggle is not just cosmetic. It changes the language the AI answers in, live, mid-conversation.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant UI as Web UI
    participant Ctx as LanguageProvider
    participant Storage as localStorage
    participant Chat as /api/chat
    participant AI

    Citizen->>UI: Pick "தமிழ்" in nav switcher
    UI->>Ctx: setLang("ta")
    Ctx->>Storage: write jansetu.lang = "ta"
    Ctx->>UI: rerender with new dictionary + dir
    Note over UI: Static strings via useT()<br/>swap to Tamil
    Citizen->>UI: Send next chat message
    UI->>Chat: POST { messages, lang: "ta", service }
    Chat->>AI: system += "respond ONLY in Tamil"
    AI-->>Chat: reply in Tamil
    Chat-->>UI: { reply }
    UI-->>Citizen: Tamil answer
```

Urdu additionally sets `dir="rtl"` on `<html>`, which flips the layout right-to-left across the whole app.

## Flow 1: Find a Scheme

The scheme finder wants two things at once: solid deterministic recommendations (dataset fallback) and better-quality reasoning (AI). Both live in the same route so the app is fully usable without an AI key.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant UI as /schemes
    participant Gateway as /api/schemes
    participant Retrieval as filterSchemes
    participant Data as data/schemes.json
    participant AI

    Citizen->>UI: Type "pension for elderly mother in Maharashtra"
    UI->>Gateway: POST { query, lang: "en" }
    Gateway->>Retrieval: filterSchemes(query)
    Retrieval->>Data: read
    Data-->>Retrieval: full dataset
    Retrieval-->>Gateway: top 6 matches by keyword score

    alt AI configured
        Gateway->>AI: askLLMJson(system, query + schemesContext(matches))
        AI-->>Gateway: JSON { recommended: [...] }
    else No API key
        Note over Gateway: Fallback: map matches to<br/>{name, reason: benefits, documents, steps, url}
    end

    Gateway-->>UI: { recommended, aiUsed }
    UI-->>Citizen: Ranked scheme cards with docs + steps + official link
```

## Flow 2: Document Requirements and Decoder

Two paths funnel into the same chat route, service-scoped to `documents`. Either the citizen asks in plain language ("what documents do I need for a birth certificate in Maharashtra?"), or they upload a government PDF and ask "what does this say?".

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant UI as /chat?service=documents
    participant Chat as /api/chat
    participant PDF as unpdf
    participant AI

    Citizen->>UI: Upload notice.pdf + "What do I need to do?"
    UI->>UI: FileReader → base64 data URLs
    UI->>Chat: POST { messages, service: "documents",<br/>lang, pdfs: [{name, dataUrl}] }
    Chat->>PDF: getDocumentProxy + extractText
    PDF-->>Chat: extracted text
    Chat->>Chat: Append "[Attached document 'notice.pdf']:<br/>{text}" to user message
    Chat->>AI: askLLM(system + SERVICE_SCOPE.documents, user, lang)
    AI-->>Chat: plain-language explanation + deadlines + doc list
    Chat-->>UI: { reply }
    UI-->>Citizen: Markdown-rendered answer
```

Images (vision) travel differently: they are attached as `image_url` parts on the LLM message rather than pre-extracted. Both attachment types are supported in the same request.

## Flow 3: Report a Public Issue

Photo optional but strongly encouraged. When present, the AI enriches the citizen's short text with what it sees in the image before the deterministic keyword classifier picks a department and severity.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant UI as /report
    participant Gateway as /api/complaint
    participant AI
    participant Backend as backend.ts
    participant Svc as ComplaintService

    Citizen->>UI: Photo + short description + ward
    UI->>UI: FileReader → data URL
    UI->>Gateway: POST { text, imageDataUrl, location, lang }

    opt Image supplied
        Gateway->>AI: askLLM("describe the civic issue", user, en, [imageDataUrl])
        AI-->>Gateway: enrichment sentence
        Gateway->>Gateway: text = originalText + "\n\n" + enrichment
    end

    Gateway->>Backend: complaintService.createForUser(DEMO_USER, {text, location})
    Backend->>Svc: classifyComplaint(text)
    Svc-->>Backend: {issue_type, department, severity}
    Backend->>Svc: insert(complaint, initialUpdate)
    Svc-->>Backend: persisted Complaint (id SB-YYYY-NNNN)
    Backend-->>Gateway: complaint
    Gateway-->>UI: { complaint, note: "Routed to <department>" }
    UI-->>Citizen: Success card with Complaint ID + Track link
```

Note the deliberate separation: the AI helps *describe*, the deterministic classifier decides *routing*. This makes the routing reproducible and testable without the AI.

## Flow 4: Track a Complaint

Two entry points to the same handler: list mode when the citizen lands with no ID, and detail mode when they type or link to one.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant UI as /track
    participant Gateway as /api/track
    participant Backend as backend.ts
    participant Svc as ComplaintService

    par List mode (on mount)
        Citizen->>UI: /track
        UI->>Gateway: GET /api/track
        Gateway->>Backend: listForUser(DEMO_USER)
        Backend->>Svc: repo.listByUser
        Svc-->>Gateway: Complaint[]
        Gateway-->>UI: { complaints: [...] }
        UI-->>Citizen: Card list (id + issue + status badge + ward)
    and Detail mode (search or ?id=)
        Citizen->>UI: Enter SB-2026-0003
        UI->>Gateway: GET /api/track?id=SB-2026-0003
        Gateway->>Backend: trackForUser(DEMO_USER, id)
        alt Found + owned
            Backend->>Svc: getById + updatesFor
            Svc-->>Backend: {complaint, updates}
            Backend-->>Gateway: {complaint, updates}
            Gateway-->>UI: JSON
            UI-->>Citizen: Vertical timeline (submitted → assigned → resolved)
        else Not found
            Backend--xGateway: throws
            Gateway-->>UI: 404 {error: "not_found"}
            UI-->>Citizen: "No complaint found with that ID"
        end
    end
```

## Flow 5: Ask Anything

The catch-all service. The route enriches the user's question with matching scheme context (so answers about schemes are grounded in the dataset) and lets the AI answer in plain language.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant UI as /chat?service=ask
    participant Chat as /api/chat
    participant Retrieval as filterSchemes
    participant AI

    Citizen->>UI: "What is Ayushman Bharat and am I eligible?"
    UI->>Chat: POST { messages, service: "ask", lang }
    Chat->>Retrieval: filterSchemes(question)
    Retrieval-->>Chat: matching schemes text
    Chat->>Chat: system += schemesContext(matches)<br/>system += SERVICE_SCOPE.ask<br/>system += "respond ONLY in <lang>"

    alt AI configured
        Chat->>AI: askLLM(system, user, lang)
        AI-->>Chat: grounded answer
    else No API key
        Chat->>Chat: Fallback friendly message
    end

    Chat-->>UI: { reply }
    UI-->>Citizen: Markdown-rendered answer
```

If the user attaches an image or PDF, the same paths from Flow 2 apply.

## Flow 6: Transparency Dashboard

Public, aggregate view over all complaints in the system. In this MVP that means the seeded dataset plus anything the citizen has just filed.

```mermaid
sequenceDiagram
    autonumber
    actor Anyone
    participant UI as /dashboard
    participant Gateway as /api/dashboard
    participant Backend as backend.ts
    participant Complaint as ComplaintService
    participant Dashboard as DashboardService

    Anyone->>UI: /dashboard
    UI->>Gateway: GET /api/dashboard
    Gateway->>Backend: listAllForDashboard()
    Backend->>Complaint: repo.listAll()
    Complaint-->>Backend: Complaint[]
    Backend->>Dashboard: summarize(complaints)
    Dashboard-->>Backend: {totals, byDepartment, byStatus, byWard, avgResolutionDays}
    Backend-->>Gateway: aggregated JSON
    Gateway-->>UI: JSON

    UI-->>Anyone: 4 KPI cards + department bar chart +<br/>status donut + ward bar chart (Recharts)
```

## Bootstrapping and seed data

`src/lib/backend.ts` runs once per server process, wires up the three domain services, seeds a demo citizen and six varied complaints across Pune wards and departments, and drives a couple of status transitions so the dashboard and timeline demo well. Storage is in-memory; each cold start reseeds.

```mermaid
flowchart LR
    boot(("Server<br/>start"))-->init["init() in backend.ts"]
    init-->new["new ComplaintService()<br/>new ProfileService()<br/>new DashboardService()"]
    new-->seed["seed():<br/>upsert demo profile<br/>create 6 complaints<br/>run status transitions"]
    seed-->exp["export singletons<br/>for API routes"]
```

## What is not built in this MVP

Called out explicitly here so that anyone reading this document knows the boundary:

- No real user auth. Every request runs as `DEMO_USER`. The data model has `user_id` throughout so real auth drops in cleanly.
- No real portal submission. Complaints are stored in-memory only. Designed-for integrations: CPGRAMS (grievance submission and appeal), DigiLocker (document store), UMANG (service endpoints).
- No SMS or WhatsApp channel. Web only for this hackathon.
- No vector store. Retrieval is keyword and field-based over `data/schemes.json`.

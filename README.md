# 🤖 AI-Assisted Technical Communication Agent — PoC

> A lightweight proof-of-concept that transforms raw technical messages into clear, audience-friendly communications and publishes them to Viva Engage, Microsoft Teams, or Slack.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Part 1 — MCP Server (Context Layer)](#3-part-1--mcp-server-context-layer)
4. [Part 2 — UI Mockup (Frontend)](#4-part-2--ui-mockup-frontend)
5. [Folder Structure](#5-folder-structure)
6. [Implementation Plan](#6-implementation-plan)
7. [Constraints & Scope](#7-constraints--scope)
8. [End-to-End Testing](#8-end-to-end-testing)

---

## 1. Project Overview

### Problem

IT teams and engineers write technical incident reports, maintenance notices, and system updates that most employees cannot easily understand. These messages often cause confusion, unnecessary helpdesk tickets, and anxiety among frontline and office workers.

### Solution

An AI-powered agent that:

1. Accepts a raw technical message as input
2. Calls an MCP (Model Context Protocol-style) server to fetch communication guidelines and audience-specific context
3. Sends the enriched prompt to an AI model (Gemini via OpenRouter)
4. Returns a structured, human-readable message in a fixed 4-part format
5. Lets the user review, edit, and approve the transformed message
6. Publishes (or schedules) the message to the selected channel

### Key Value

| Without Agent | With Agent |
|---|---|
| "DB failover completed, replica promoted, RPO 0" | "Our systems experienced a brief technical issue this morning. Everything is now back to normal. No action is needed from you." |
| Written by IT for IT | Written by AI for people |

---

## 2. Architecture

### High-Level Flow

```
┌───────────┐     ┌───────────┐     ┌────────────┐     ┌─────────────────┐
│  Frontend │────▶│  Backend  │────▶│ MCP Server │     │  Gemini via     │
│  (React)  │     │ (Node.js) │◀────│ (Context)  │     │  OpenRouter API │
└───────────┘     └───────────┘     └────────────┘     └─────────────────┘
                       │                                        ▲
                       └────────────────────────────────────────┘
                         Backend enriches prompt, then calls AI
```

### Step-by-Step Flow (Plain Language)

```
Step 1 — User Input
        User pastes a technical message into the UI.
        User selects:  Audience  (Frontline / Office / IT)
                       Channel   (Viva Engage / Teams / Slack)

Step 2 — Backend Receives Request
        Frontend sends the message + audience + channel
        to the backend API via POST /api/transform.

Step 3 — Backend Calls MCP Server
        Before touching the AI, the backend calls:
          → GET /context?audience=frontline   (tone rules, vocabulary limits)
          → GET /template                     (fixed 4-section message structure)
        MCP returns JSON with guidelines and a message template.

Step 4 — Backend Builds AI Prompt
        Backend combines:
          • The raw technical message (from user)
          • Communication guidelines (from MCP /context)
          • Expected output format   (from MCP /template)
        Into a single, structured prompt for the AI.

Step 5 — AI Transforms the Message
        Gemini (via OpenRouter) returns a structured JSON response with 4 sections:
          1. What is happening
          2. What it means for you
          3. What you need to do
          4. Where to get help

Step 6 — User Reviews & Publishes
        Transformed message is displayed in the UI.
        User can Edit, Regenerate, or Approve.
        On Approve → user selects channel and clicks Publish.
        Backend calls a mock publish endpoint
        (or real webhook in production).
```

---

## 3. Part 1 — MCP Server (Context Layer)

### What Is the MCP Server?

The MCP (Model Context Protocol) server is a **lightweight context service** that sits between the backend and the AI model. It does not run the AI — it provides the **rules, tone guidelines, and message templates** that tell the AI *how* to write.

Think of it as a style guide that the AI reads before every transformation.

### Why a Separate MCP Server?

- Keeps communication rules **centralized and easy to update** without touching AI prompts
- Makes the system **audience-aware** (frontline workers need simpler language than IT staff)
- Separates concerns: MCP = *what to say and how*, AI = *generate the actual text*
- Easy to extend later (add new audiences, new channels, new templates)

---

### API Endpoints

#### `GET /context`

Returns tone and communication guidelines for a specific audience.

**Query Parameter:** `audience` — one of `frontline`, `office`, `it`

**Example Request:**
```
GET http://localhost:4000/context?audience=frontline
```

**Example Response:**
```json
{
  "audience": "frontline",
  "label": "Frontline Workers",
  "guidelines": {
    "tone": "Warm, calm, and reassuring. Avoid alarming language.",
    "language": "Plain English only. No acronyms or technical terms.",
    "maxSentenceLength": 15,
    "vocabulary": "Use everyday words. Prefer 'system' over 'server', 'fixed' over 'resolved'.",
    "focusOn": "Impact on their daily work and any actions they need to take.",
    "avoid": ["acronyms", "error codes", "technical root causes", "jargon"]
  },
  "examples": {
    "bad": "The ERP system experienced a P1 incident due to DB replica lag.",
    "good": "Our ordering system had a brief issue this morning. It is now working normally."
  }
}
```

---

**Example Response for `audience=office`:**
```json
{
  "audience": "office",
  "label": "Office Employees",
  "guidelines": {
    "tone": "Professional, clear, and informative.",
    "language": "Simple business language. Minimal jargon.",
    "maxSentenceLength": 20,
    "vocabulary": "Use common business terms. Spell out all acronyms.",
    "focusOn": "Business impact, timeline, and any required actions.",
    "avoid": ["technical root cause details", "infrastructure terms", "error codes"]
  },
  "examples": {
    "bad": "Kubernetes pod crash-loop caused service degradation for 22 minutes.",
    "good": "Our HR system was unavailable for approximately 20 minutes this morning. The issue has been resolved and all services are now fully operational."
  }
}
```

---

**Example Response for `audience=it`:**
```json
{
  "audience": "it",
  "label": "IT Staff",
  "guidelines": {
    "tone": "Factual, precise, and professional.",
    "language": "Technical language is acceptable. Include relevant system context.",
    "maxSentenceLength": 30,
    "vocabulary": "Use standard IT terminology. Acronyms are acceptable.",
    "focusOn": "Root cause summary, systems affected, resolution steps, and follow-up actions.",
    "avoid": ["vague descriptions", "omitting system names or timelines"]
  },
  "examples": {
    "bad": "Something broke and we fixed it.",
    "good": "Database replica lag caused a read timeout on the ERP API between 09:14–09:36 UTC. Primary failover completed. RCA in progress."
  }
}
```

---

#### `GET /template`

Returns the fixed 4-section message structure that the AI must follow.

**Example Request:**
```
GET http://localhost:4000/template
```

**Example Response:**
```json
{
  "templateId": "standard-communication-v1",
  "description": "Standard 4-section structure for all employee communications.",
  "sections": [
    {
      "id": "what_is_happening",
      "label": "📢 What Is Happening",
      "instruction": "Describe the event or situation in 1-2 plain sentences. No technical details.",
      "required": true
    },
    {
      "id": "what_it_means_for_you",
      "label": "👤 What It Means for You",
      "instruction": "Explain the impact on this specific audience group in 1-3 sentences.",
      "required": true
    },
    {
      "id": "what_you_need_to_do",
      "label": "✅ What You Need to Do",
      "instruction": "List any required actions. If no action is needed, say so explicitly.",
      "required": true
    },
    {
      "id": "help",
      "label": "💬 Need Help?",
      "instruction": "Provide a single contact point or support link. Keep it brief.",
      "required": true
    }
  ],
  "formatting": {
    "maxTotalLength": 300,
    "useBulletPoints": false,
    "useEmoji": true,
    "languageStyle": "Determined by /context response for the selected audience"
  }
}
```

---

### How the Backend Uses MCP Before Calling AI

```
1. Backend receives:  { message, audience, channel }

2. Backend calls MCP:
      const context  = await fetch(`http://localhost:4000/context?audience=${audience}`)
      const template = await fetch(`http://localhost:4000/template`)

3. Backend builds the AI prompt:
      You are a communication specialist at a large company.
      Your job is to rewrite a technical message for a specific audience.

      AUDIENCE:  ${context.label}
      TONE:      ${context.guidelines.tone}
      LANGUAGE:  ${context.guidelines.language}
      AVOID:     ${context.guidelines.avoid.join(', ')}

      OUTPUT FORMAT (you must follow this structure exactly):
      ${template.sections.map(s => `## ${s.label}\n${s.instruction}`).join('\n\n')}

      Return your response as a JSON object with exactly these keys:
      {
        "what_is_happening": "...",
        "what_it_means_for_you": "...",
        "what_you_need_to_do": "...",
        "help": "..."
      }

      Return ONLY the JSON object. No markdown, no explanation, no code fences.

      ORIGINAL TECHNICAL MESSAGE:
      ${message}

      Rewrite the above message following the audience guidelines and output format.

4. Backend sends the prompt to Gemini via OpenRouter

5. Backend parses the JSON response and returns it to the frontend
```

---

### `POST /api/transform` — Response Shape

This is the exact JSON the backend returns to the frontend after a successful AI transformation:

```json
{
  "success": true,
  "audience": "office",
  "transformedMessage": {
    "what_is_happening": "Our ordering system experienced a brief technical issue this morning. Everything is now back to normal.",
    "what_it_means_for_you": "If you tried to use the ordering system between 9:14 and 9:36 this morning, it may have been slow or unavailable. It is now fully working.",
    "what_you_need_to_do": "No action is needed. You can continue using the ordering system as normal.",
    "help": "If you experience any issues, contact the IT helpdesk at helpdesk@company.com or call extension 1234."
  }
}
```

On error:
```json
{
  "success": false,
  "error": "AI transformation failed. Please try again."
}
```

The frontend maps `transformedMessage` keys directly to the 4 `SectionCard` components on Step 2:
- `what_is_happening` → 📢 What Is Happening
- `what_it_means_for_you` → 👤 What It Means for You
- `what_you_need_to_do` → ✅ What You Need to Do
- `help` → 💬 Need Help?

---

### MCP Server — Node.js Folder Structure

```
mcp-server/
├── index.js              ← Express server entry point (port 4000)
├── package.json
├── routes/
│   ├── context.js        ← GET /context?audience=
│   └── template.js       ← GET /template
└── data/
    ├── audiences.json    ← All audience guidelines (frontline, office, it)
    └── template.json     ← Fixed message template definition
```

The MCP server is intentionally thin — it is a **JSON configuration service**, not a business logic layer. All data lives in `data/` files, making it easy to update guidelines without changing code.

---

## 4. Part 2 — UI Mockup (Frontend)

The UI follows a **linear 3-step wizard** pattern. The user cannot skip steps and always knows exactly where they are in the process.

---

### Step 1 — Input Your Message

```
╔══════════════════════════════════════════════════════════════════╗
║  🤖  AI Communication Agent                          Step 1 of 3 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Paste your technical message below                              ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ DB primary failover completed at 09:36 UTC. Replica was    │  ║
║  │ promoted. RPO achieved: 0. RTO: 22 minutes. Incident       │  ║
║  │ post-mortem scheduled for Tuesday.                         │  ║
║  │                                                            │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  Who is this message for?           Which channel?               ║
║  ┌──────────────────────┐           ┌──────────────────────┐     ║
║  │ ▾ Frontline Workers  │           │ ▾ Viva Engage        │     ║
║  └──────────────────────┘           └──────────────────────┘     ║
║      ○ Frontline Workers                ○ Viva Engage            ║
║      ○ Office Employees                 ○ Microsoft Teams        ║
║      ○ IT Staff                         ○ Slack                  ║
║                                                                  ║
║                              ┌──────────────────────────────┐    ║
║                              │  ✨ Transform with AI  →     │    ║
║                              └──────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════╝
```

**Components:**
- `<TextArea>` — large, resizable input for the raw technical message
- `<AudienceDropdown>` — single select: Frontline Workers / Office Employees / IT Staff
- `<ChannelDropdown>` — single select: Viva Engage / Microsoft Teams / Slack
- `<TransformButton>` — triggers the backend API call; shows loading spinner while waiting

---

### Step 2 — Review AI Output

```
╔══════════════════════════════════════════════════════════════════╗
║  🤖  AI Communication Agent                          Step 2 of 3 ║
╠══════════════════════════════════════════════════════════════════╣
║  ✅ Message transformed for: Frontline Workers                   ║
║  ─────────────────────────────────────────────────────────────── ║
║                                                                  ║
║  📢 What Is Happening                                            ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Our ordering system experienced a brief technical issue    │  ║
║  │ this morning. Everything is now back to normal.            │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  👤 What It Means for You                                        ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ If you tried to use the ordering system between 9:14 and   │  ║
║  │ 9:36 this morning, it may have been slow or unavailable.   │  ║
║  │ It is now fully working.                                   │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  ✅ What You Need to Do                                          ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ No action is needed. You can continue using the ordering   │  ║
║  │ system as normal.                                          │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  💬 Need Help?                                                   ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ If you experience any issues, contact the IT helpdesk at   │  ║
║  │ helpdesk@company.com or call extension 1234.               │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  ┌─────────┐   ┌────────────┐   ┌───────────────────────────┐   ║
║  │ ✏️ Edit │   │ 🔄 Regen. │   │  ✅ Approve & Continue →  │   ║
║  └─────────┘   └────────────┘   └───────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════╝
```

**Components:**
- `<SectionCard>` — reusable card component for each of the 4 message sections
  - Each card renders a label, an icon, and an editable text block
  - When `Edit` is clicked, all section cards switch to `<textarea>` for inline editing
- `<EditButton>` — toggle edit mode on/off for the full message
- `<RegenerateButton>` — sends the same input back to the backend for a new AI response
- `<ApproveButton>` — locks in the message and moves to Step 3

---

### Step 3 — Publish

```
╔══════════════════════════════════════════════════════════════════╗
║  🤖  AI Communication Agent                          Step 3 of 3 ║
╠══════════════════════════════════════════════════════════════════╣
║  Publish your message                                            ║
║  ─────────────────────────────────────────────────────────────── ║
║                                                                  ║
║  Channel                                                         ║
║  ┌──────────────────────────────────────────────────────────┐    ║
║  │  ◉ 🔥 Viva Engage     ○ 💬 Microsoft Teams   ○ # Slack  │    ║
║  └──────────────────────────────────────────────────────────┘    ║
║                                                                  ║
║  Message Preview                                                 ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │  📢 What Is Happening                                      │  ║
║  │  Our ordering system experienced a brief technical issue   │  ║
║  │  this morning. Everything is now back to normal.           │  ║
║  │                                                            │  ║
║  │  👤 What It Means for You                                  │  ║
║  │  If you tried to use the ordering system between 9:14 and  │  ║
║  │  9:36 this morning, it may have been slow or unavailable.  │  ║
║  │  It is now fully working.                                  │  ║
║  │                                                            │  ║
║  │  ✅ What You Need to Do                                    │  ║
║  │  No action is needed. You can continue using the ordering  │  ║
║  │  system as normal.                                         │  ║
║  │                                                            │  ║
║  │  💬 Need Help?                                             │  ║
║  │  Contact the IT helpdesk at helpdesk@company.com           │  ║
║  │  or call extension 1234.                                   │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  Schedule (optional)                                             ║
║  ┌──────────────────────────┐                                    ║
║  │  📅 2026-05-04  🕐 09:00 │  (leave blank to publish now)     ║
║  └──────────────────────────┘                                    ║
║                                                                  ║
║  ┌──────────────────────┐   ┌──────────────────────────────┐    ║
║  │  ← Back to Review    │   │  🚀 Publish Now              │    ║
║  └──────────────────────┘   └──────────────────────────────┘    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**After clicking Publish — Success State:**

```
╔══════════════════════════════════════════════════════════════════╗
║  🤖  AI Communication Agent                                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║              ✅  Message Published Successfully!                 ║
║                                                                  ║
║              Channel:   🔥 Viva Engage                           ║
║              Audience:  Frontline Workers                        ║
║              Time:      04 May 2026 at 09:00                     ║
║                                                                  ║
║              ┌──────────────────────────────────┐               ║
║              │  ✉️  Send Another Message        │               ║
║              └──────────────────────────────────┘               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Components:**
- `<ChannelSelector>` — radio button group (Viva Engage / Teams / Slack)
- `<MessagePreview>` — read-only preview of the approved message
- `<SchedulePicker>` — optional date + time inputs (blank = publish immediately)
- `<BackButton>` — returns to Step 2 without losing edits
- `<PublishButton>` — calls `POST /api/publish` on the backend
- `<SuccessBanner>` — confirmation with channel, audience, and timestamp

---

### React Component Tree

```
App
├── StepIndicator            ← "Step 1 of 3" progress bar
├── Step1_InputForm
│   ├── MessageTextArea
│   ├── AudienceDropdown
│   ├── ChannelDropdown
│   └── TransformButton
├── Step2_ReviewPanel
│   ├── SectionCard (×4)     ← What is happening / Means / Do / Help
│   ├── EditButton
│   ├── RegenerateButton
│   └── ApproveButton
└── Step3_PublishPanel
    ├── ChannelSelector
    ├── MessagePreview
    ├── SchedulePicker
    ├── BackButton
    ├── PublishButton
    └── SuccessBanner        ← shown after successful publish
```

---

### State Management (Simple)

For a PoC, all state lives in the top-level `App` component using React `useState` hooks:

| State Variable | Type | Purpose |
|---|---|---|
| `currentStep` | `number` (1-3) | Which step is active |
| `rawMessage` | `string` | The original technical message |
| `audience` | `string` | Selected audience |
| `channel` | `string` | Selected channel |
| `transformedMessage` | `object` | The 4-section AI output |
| `isLoading` | `boolean` | Show spinner during API call |
| `publishStatus` | `string` | null / 'success' / 'error' |

No external state library (Redux, Zustand) needed for the PoC.

---

## 5. Folder Structure

```
electrolux-ai-communication-tool/
│
├── README.md                          ← This file
├── .gitignore                         ← Must include backend/.env
│
├── frontend/                          ← React application (Vite)
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── main.jsx                   ← Entry point
│       ├── App.jsx                    ← Root component + state management
│       ├── components/
│       │   ├── StepIndicator.jsx      ← "Step X of 3" progress bar
│       │   ├── Step1_InputForm.jsx    ← Paste message, select audience + channel
│       │   ├── Step2_ReviewPanel.jsx  ← Display, edit, approve AI output
│       │   ├── Step3_PublishPanel.jsx ← Channel select, preview, publish
│       │   ├── SectionCard.jsx        ← Reusable message section card
│       │   └── SuccessBanner.jsx      ← Post-publish confirmation
│       └── services/
│           └── api.js                 ← fetch calls to backend
│
├── backend/                           ← Node.js + Express API
│   ├── package.json
│   ├── .env.example                   ← Template — copy to .env and add your key
│   ├── .env                           ← ⚠️ NEVER commit this file
│   ├── index.js                       ← Entry point (port 3001)
│   ├── mockAI.js                      ← Hardcoded mock response (USE_MOCK_AI=true)
│   └── routes/
│       ├── transform.js               ← POST /api/transform
│       │                                 1. Calls MCP /context + /template
│       │                                 2. Builds AI prompt
│       │                                 3. Calls Gemini via OpenRouter (or mock)
│       │                                 4. Returns structured message JSON
│       └── publish.js                 ← POST /api/publish
│                                         Mock publish: logs to console
│                                         (replace with real webhook later)
│
├── mcp-server/                        ← Context & guidelines service
│   ├── package.json
│   ├── index.js                       ← Entry point (port 4000)
│   ├── routes/
│   │   ├── context.js                 ← GET /context?audience=
│   │   └── template.js                ← GET /template
│   └── data/
│       ├── audiences.json             ← Guidelines for frontline, office, it
│       └── template.json              ← Standard 4-section message template
│
├── e2e/                               ← Playwright end-to-end tests
│   ├── playwright.config.js           ← Base URL, browser, timeout settings
│   ├── tests/
│   │   ├── mcp-context.spec.js
│   │   ├── mcp-template.spec.js
│   │   ├── transform-happy-path.spec.js
│   │   ├── transform-edit.spec.js
│   │   ├── transform-regenerate.spec.js
│   │   ├── publish-now.spec.js
│   │   ├── publish-schedule.spec.js
│   │   ├── channel-selection.spec.js
│   │   ├── back-navigation.spec.js
│   │   └── send-another.spec.js
│   └── fixtures/
│       └── technical-messages.js      ← Reusable sample input messages for all tests
│
└── docker-compose.yml                 ← Optional: run all 3 services together
```

---

## 6. Implementation Plan

### Step 1 — Build the MCP Server

**Goal:** Create a working context API that returns guidelines and templates.

- Set up Express app in `mcp-server/`
- Create `data/audiences.json` with entries for `frontline`, `office`, and `it`
- Create `data/template.json` with the 4-section message structure
- Implement `GET /context?audience=` route
- Implement `GET /template` route
- Test with `curl http://localhost:4000/context?audience=frontline`

**Done when:** Both endpoints return correct JSON for all three audience types.

---

### Step 2 — Build the Backend API

**Goal:** Create the transformation and publish endpoints.

- Set up Express app in `backend/` (port 3001)
- Implement `POST /api/transform`:
  - Accept `{ message, audience, channel }` in request body
  - Fetch context from MCP: `GET /context?audience=`
  - Fetch template from MCP: `GET /template`
  - Combine into a structured prompt string
  - For now, return a hardcoded mock response from `mockAI.js`
- Implement `POST /api/publish`:
  - Accept `{ message, channel, audience, scheduledAt }` in request body
  - Log to console (mock)
  - Return `{ success: true, publishedAt: <timestamp> }`
- Add CORS middleware so the frontend can call the backend

**Done when:** `POST /api/transform` returns a structured mock message and `POST /api/publish` returns success.

---

### Step 3 — Integrate Gemini via OpenRouter

**Goal:** Replace the hardcoded mock response in `/api/transform` with a real AI call.

- Store the OpenRouter API key in `backend/.env` — never commit this file
- Call the OpenRouter API using plain `fetch` — no SDK needed, it is OpenAI-compatible:

```javascript
// backend/routes/transform.js

const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-pro",
    messages: [{ role: "user", content: prompt }]
  })
});

const data = await response.json();
const text = data.choices[0].message.content;
const parsed = JSON.parse(text);  // AI is instructed to return JSON only
```

- Use the structured prompt from Step 2 (includes MCP context + template)
- Parse the AI JSON response and return it to the frontend (see response shape in Section 3)
- Add error handling: if the AI call fails, return `{ success: false, error: "..." }`
- Toggle between real and mock via environment variable: `USE_MOCK_AI=true`

**Done when:** Submitting a real technical message returns a contextually appropriate structured response.

---

### Step 4 — Build the Frontend UI

**Goal:** Create the 3-step wizard interface.

- Scaffold React app in `frontend/` using Vite
- Build `StepIndicator` component
- Build Step 1: `InputForm` with textarea, audience dropdown, channel dropdown
- Build Step 2: `ReviewPanel` with 4 `SectionCard` components; implement Edit / Regenerate / Approve
- Build Step 3: `PublishPanel` with channel selector, preview, optional scheduler, publish button, success banner
- Wire up `services/api.js` to call `POST /api/transform` and `POST /api/publish`
- Map `transformedMessage` keys from API response to the 4 `SectionCard` components:
  - `what_is_happening` → 📢 What Is Happening
  - `what_it_means_for_you` → 👤 What It Means for You
  - `what_you_need_to_do` → ✅ What You Need to Do
  - `help` → 💬 Need Help?

**Done when:** All 3 steps flow correctly end-to-end in the browser.

---

### Step 5 — Mock Publish & End-to-End Testing

**Goal:** Verify the complete flow works from input to "published" — both manually and with automated Playwright E2E tests.

- Ensure the backend's `publish.js` logs a formatted mock publish event to the console
- Add a channel-specific confirmation message in the success banner:
  - Viva Engage: "Posted to your Viva Engage community"
  - Teams: "Sent to the selected Microsoft Teams channel"
  - Slack: "Posted to the selected Slack channel"
- Set up Playwright in `e2e/` and configure `playwright.config.js` to point to `http://localhost:5173`
- Set `USE_MOCK_AI=true` in backend so E2E tests are deterministic (no live AI calls needed)
- Implement all 10 E2E test specs described in Section 8
- Run the full automated test suite: `cd e2e && npx playwright test`
- All 10 tests must pass before the PoC is considered complete
- (Optional) Replace mock publish with real webhook calls for Teams or Slack

**Done when:** All 10 Playwright tests pass and the full PoC flow works end-to-end without errors.

---

## 7. Constraints & Scope

| Item | Decision |
|---|---|
| **Authentication** | None — this is a PoC |
| **Database** | None — no data persistence |
| **Real channel integration** | Mocked — no real Viva Engage / Teams / Slack calls |
| **AI model** | Gemini via OpenRouter (`google/gemini-2.5-pro`) |
| **AI API base URL** | `https://openrouter.ai/api/v1/chat/completions` |
| **Auth header** | `Authorization: Bearer <OPENROUTER_API_KEY>` |
| **Error handling** | Minimal — happy path only for PoC |
| **Styling** | Functional CSS or Tailwind — no design system required |
| **Testing** | Playwright E2E tests covering all 10 user-facing scenarios (see Section 8) |
| **Deployment** | Local only (`localhost`) — no cloud deployment |

### Environment Variables

`backend/.env.example` — copy to `backend/.env` and fill in your key:

```bash
# OpenRouter API key — provided by hackathon organizers via your private team channel
# ⚠️  NEVER commit this file to any repository (public or private).
# ⚠️  NEVER paste this key in Slack, Discord, or any public channel.
# ⚠️  If this key is pushed to a public repo it will be immediately disabled
#     and your entire team will lose API access for the rest of the hackathon.
OPENROUTER_API_KEY=your_key_here

# Set to true to skip real AI calls during development and E2E tests
USE_MOCK_AI=false
```

Make sure the root `.gitignore` includes:

```
backend/.env
```

### What This PoC Proves

1. ✅ AI can reliably transform technical messages into structured, audience-appropriate communications
2. ✅ An MCP-style context layer makes the AI output more consistent and controllable
3. ✅ The 3-step review workflow is intuitive for non-technical communicators
4. ✅ The architecture is extensible — real channel integrations can replace the mock with minimal code changes

### What This PoC Does NOT Prove

- ❌ Security or authentication design
- ❌ Scale or performance at volume
- ❌ Real-time collaboration between multiple communicators
- ❌ Message audit trail or compliance logging

---

## Quick Start (Local Development)

```bash
# Terminal 1 — Start MCP Server
cd mcp-server
npm install
npm start          # Runs on http://localhost:4000

# Terminal 2 — Start Backend
cd backend
npm install
cp .env.example .env   # Paste your OPENROUTER_API_KEY into .env
npm start              # Runs on http://localhost:3001

# Terminal 3 — Start Frontend
cd frontend
npm install
npm run dev            # Runs on http://localhost:5173
```

Then open `http://localhost:5173` in your browser.

---

## 8. End-to-End Testing

### Why Playwright?

[Playwright](https://playwright.dev/) is the best choice for this PoC because it:

- Runs tests in a real browser (Chromium by default) — exactly how users experience the app
- Can intercept and assert on API calls made to the backend
- Has zero configuration overhead for a simple local setup
- Supports async/await natively, matching the async nature of the AI transform flow
- Generates an HTML test report out of the box

### Prerequisites

All three services must be running before executing the test suite:

```bash
# All services must be running:
MCP Server  →  http://localhost:4000
Backend     →  http://localhost:3001   (with USE_MOCK_AI=true)
Frontend    →  http://localhost:5173
```

> **Important:** Always set `USE_MOCK_AI=true` when running E2E tests. This ensures the AI always returns the same structured mock response, making every test deterministic and consistent.

### Setup

```bash
cd e2e
npm install
npx playwright install chromium   # Install browser once
```

### Running Tests

```bash
# Run all 10 tests (headless)
npx playwright test

# Run with visible browser (useful for debugging)
npx playwright test --headed

# Run a single test file
npx playwright test tests/transform-happy-path.spec.js

# View the HTML test report after a run
npx playwright show-report
```

---

### Playwright Configuration (`playwright.config.js`)

```
baseURL:        http://localhost:5173   ← React frontend
timeout:        15000ms                 ← Per test timeout
retries:        1                       ← Retry once on failure (flakiness buffer)
browser:        Chromium
reporter:       html                    ← Generates visual report
```

---

### Shared Fixtures (`fixtures/technical-messages.js`)

All test specs import sample messages from this shared fixture file so test data stays consistent and easy to update.

```
INCIDENT_MESSAGE:
  "DB primary failover completed at 09:36 UTC. Replica was promoted.
   RPO achieved: 0. RTO: 22 minutes. Incident post-mortem on Tuesday."

MAINTENANCE_MESSAGE:
  "Scheduled maintenance window: SAP ERP will be offline 22:00–02:00 UTC
   Saturday. Kernel patch + index rebuild. Expected downtime: 4 hours."

SECURITY_MESSAGE:
  "CVE-2026-1234 patched on all nodes. TLS 1.0/1.1 deprecated.
   Clients must upgrade to TLS 1.2+. 30-day migration window active."
```

---

### Test Specs — Full Description

---

#### Test 1 — `mcp-context.spec.js`

**What it tests:** MCP Server `GET /context` returns valid, complete JSON for all three audience types.

**Category:** API / MCP Server

**Steps:**
```
1. Send GET http://localhost:4000/context?audience=frontline
   Assert: status 200
   Assert: response.audience === "frontline"
   Assert: response.guidelines.tone is a non-empty string
   Assert: response.guidelines.avoid is an array with at least 1 item
   Assert: response.examples.good is a non-empty string

2. Repeat for audience=office
   Assert: status 200
   Assert: response.audience === "office"
   Assert: response.guidelines.language includes "business"

3. Repeat for audience=it
   Assert: status 200
   Assert: response.audience === "it"
   Assert: response.guidelines.focusOn includes "Root cause"
```

**Pass criteria:** All 3 audiences return HTTP 200 with the expected JSON shape.

---

#### Test 2 — `mcp-template.spec.js`

**What it tests:** MCP Server `GET /template` returns the correct 4-section message structure.

**Category:** API / MCP Server

**Steps:**
```
1. Send GET http://localhost:4000/template
   Assert: status 200
   Assert: response.sections is an array of length 4
   Assert: sections[0].id === "what_is_happening"
   Assert: sections[1].id === "what_it_means_for_you"
   Assert: sections[2].id === "what_you_need_to_do"
   Assert: sections[3].id === "help"
   Assert: every section has required === true
   Assert: response.formatting.maxTotalLength is a positive number
```

**Pass criteria:** Template endpoint returns all 4 required sections with correct IDs.

---

#### Test 3 — `transform-happy-path.spec.js`

**What it tests:** The complete Step 1 → Step 2 flow. A user pastes a technical message, selects an audience and channel, clicks Transform, and sees a structured 4-section AI output.

**Category:** Frontend / Full wizard flow

**Steps:**
```
1. Open http://localhost:5173
   Assert: page shows "Step 1 of 3"
   Assert: textarea is visible and empty
   Assert: audience dropdown defaults to "Frontline Workers"
   Assert: channel dropdown defaults to "Viva Engage"

2. Type INCIDENT_MESSAGE into the textarea

3. Select audience "Office Employees" from the dropdown

4. Select channel "Microsoft Teams" from the dropdown

5. Click "Transform with AI"
   Assert: loading spinner appears (Step 1 is processing)

6. Wait for Step 2 to appear (timeout: 10s)
   Assert: page shows "Step 2 of 3"
   Assert: heading "Message transformed for: Office Employees" is visible
   Assert: "📢 What Is Happening" section card is visible with non-empty text
   Assert: "👤 What It Means for You" section card is visible with non-empty text
   Assert: "✅ What You Need to Do" section card is visible with non-empty text
   Assert: "💬 Need Help?" section card is visible with non-empty text
   Assert: Edit button is visible
   Assert: Regenerate button is visible
   Assert: "Approve & Continue" button is visible
```

**Pass criteria:** Step 2 renders with all 4 section cards populated after Transform.

---

#### Test 4 — `transform-edit.spec.js`

**What it tests:** On Step 2, the user clicks Edit, modifies the "What Is Happening" section text, and the edited text is preserved when the user clicks Approve.

**Category:** Frontend / Step 2 edit flow

**Steps:**
```
1. Complete steps 1–6 from transform-happy-path.spec.js (shared setup)

2. Click "Edit"
   Assert: all 4 section cards switch to editable <textarea> mode

3. Clear the "What Is Happening" textarea
   Type: "This is my custom edited message for the test."

4. Click "Edit" again to exit edit mode (or click "Approve & Continue")
   Assert: "What Is Happening" card now shows "This is my custom edited message for the test."

5. Click "Approve & Continue"
   Assert: page advances to Step 3

6. In the Message Preview on Step 3:
   Assert: "What Is Happening" section shows "This is my custom edited message for the test."
```

**Pass criteria:** User-edited text is preserved through the Approve action and visible in the Step 3 preview.

---

#### Test 5 — `transform-regenerate.spec.js`

**What it tests:** Clicking Regenerate on Step 2 makes a new call to the backend and returns a fresh AI response (visible as an update to the section cards).

**Category:** Frontend / Step 2 regenerate

**Steps:**
```
1. Complete steps 1–6 from transform-happy-path.spec.js (shared setup)

2. Record the current text of the "What Is Happening" section card

3. Click "Regenerate"
   Assert: loading indicator appears briefly

4. Wait for the updated output (timeout: 10s)
   Assert: Step 2 is still visible (no step change)
   Assert: all 4 section card texts are non-empty
   Assert: backend received a second POST /api/transform request
     (verify via network intercept or backend log count)
```

**Pass criteria:** Regenerate triggers a second API call and refreshes the section card content.

---

#### Test 6 — `publish-now.spec.js`

**What it tests:** The complete Step 2 → Step 3 → Publish Now flow. After approving, the user clicks Publish Now and sees the success banner.

**Category:** Frontend / Full publish flow

**Steps:**
```
1. Complete steps 1–6 from transform-happy-path.spec.js (shared setup)

2. Click "Approve & Continue"
   Assert: page shows "Step 3 of 3"
   Assert: "Publish your message" heading is visible
   Assert: "Viva Engage" radio button is pre-selected (default)
   Assert: Message Preview shows all 4 section headings
   Assert: Schedule input is empty
   Assert: "Publish Now" button is visible

3. Leave the Schedule input blank

4. Click "Publish Now"
   Assert: backend receives POST /api/publish with correct payload:
     { channel: "viva-engage", audience: "office", scheduledAt: null }

5. Wait for success state (timeout: 5s)
   Assert: "Message Published Successfully!" text is visible
   Assert: "Channel: Viva Engage" is shown in the success banner
   Assert: "Audience: Office Employees" is shown in the success banner
   Assert: "Send Another Message" button is visible
```

**Pass criteria:** Success banner appears with correct channel and audience after Publish Now.

---

#### Test 7 — `publish-schedule.spec.js`

**What it tests:** The user enters a future date and time in the Schedule input on Step 3. After clicking Publish, the success banner shows the scheduled time rather than "now."

**Category:** Frontend / Scheduled publish

**Steps:**
```
1. Complete steps 1–2 from publish-now.spec.js (shared setup, stop before clicking Publish Now)

2. Fill in the Schedule date input with "2026-06-01"
   Fill in the Schedule time input with "09:00"

3. Click "Publish Now" (label may change to "Schedule" — either is acceptable)
   Assert: backend receives POST /api/publish with:
     { scheduledAt: "2026-06-01T09:00" }   (or equivalent format)

4. Wait for success state (timeout: 5s)
   Assert: "Message Published Successfully!" text is visible
   Assert: success banner shows a date/time containing "2026" and "09:00"
   Assert: "Send Another Message" button is visible
```

**Pass criteria:** Success banner reflects the scheduled time, not the current time.

---

#### Test 8 — `channel-selection.spec.js`

**What it tests:** On Step 3, switching the channel radio button updates the channel shown in the success banner after publishing.

**Category:** Frontend / Channel selection

**Sub-tests (run for each channel):**

```
Sub-test A — Viva Engage (default)
  1. Reach Step 3 (via standard happy path)
  2. Verify "Viva Engage" radio is selected by default
  3. Click "Publish Now"
  4. Assert success banner shows "Viva Engage"

Sub-test B — Microsoft Teams
  1. Reach Step 3
  2. Click "Microsoft Teams" radio button
  3. Click "Publish Now"
  4. Assert backend receives { channel: "teams" }
  5. Assert success banner shows "Microsoft Teams"

Sub-test C — Slack
  1. Reach Step 3
  2. Click "Slack" radio button
  3. Click "Publish Now"
  4. Assert backend receives { channel: "slack" }
  5. Assert success banner shows "Slack"
```

**Pass criteria:** Each channel selection results in the correct channel name in the payload and success banner.

---

#### Test 9 — `back-navigation.spec.js`

**What it tests:** On Step 3, clicking "Back to Review" returns the user to Step 2 without losing any edits they made to the message.

**Category:** Frontend / Navigation

**Steps:**
```
1. Reach Step 2 via transform-happy-path steps

2. Click "Edit"
   Edit "What Is Happening" to: "Custom text that must survive navigation."
   Exit edit mode

3. Click "Approve & Continue"
   Assert: now on Step 3

4. Click "← Back to Review"
   Assert: page returns to Step 2
   Assert: "Step 2 of 3" is visible
   Assert: "What Is Happening" section card shows "Custom text that must survive navigation."
   Assert: all other 3 section cards are still populated (non-empty)
   Assert: Edit, Regenerate, and Approve buttons are all visible
```

**Pass criteria:** Back navigation preserves the full edited message state on Step 2.

---

#### Test 10 — `send-another.spec.js`

**What it tests:** After a successful publish, clicking "Send Another Message" resets the entire wizard back to Step 1 with a clean, empty state.

**Category:** Frontend / Wizard reset

**Steps:**
```
1. Complete the full publish flow (Steps 1 → 2 → 3 → Publish Now)
   Assert: success banner is visible

2. Click "Send Another Message"
   Assert: page returns to Step 1
   Assert: "Step 1 of 3" is visible
   Assert: textarea is empty
   Assert: audience dropdown is reset to default ("Frontline Workers")
   Assert: channel dropdown is reset to default ("Viva Engage")
   Assert: no remnants of the previous message are visible anywhere on the page
```

**Pass criteria:** The wizard is fully reset to its initial empty state after clicking "Send Another Message."

---

### Test Summary Table

| # | Spec File | Feature Tested | Step(s) |
|---|---|---|---|
| 1 | `mcp-context.spec.js` | MCP /context returns valid JSON for all audiences | API |
| 2 | `mcp-template.spec.js` | MCP /template returns 4-section structure | API |
| 3 | `transform-happy-path.spec.js` | Transform a message, see structured AI output | Step 1 → 2 |
| 4 | `transform-edit.spec.js` | Edit a section, text persists on Approve | Step 2 |
| 5 | `transform-regenerate.spec.js` | Regenerate triggers a fresh AI response | Step 2 |
| 6 | `publish-now.spec.js` | Approve → Publish Now → success banner | Step 2 → 3 |
| 7 | `publish-schedule.spec.js` | Schedule future time → success banner shows time | Step 3 |
| 8 | `channel-selection.spec.js` | Each channel shows correct name in success banner | Step 3 |
| 9 | `back-navigation.spec.js` | Back to Review preserves edited message | Step 3 → 2 |
| 10 | `send-another.spec.js` | Send Another resets wizard to clean Step 1 | Reset |

**Total: 10 tests | Expected result: all pass with `USE_MOCK_AI=true`**---

# 🚀 Next-Level Enhancements & Enterprise Roadmap

## Phase 1 — UI Foundation
Focus on transforming the application into a modern enterprise communication platform with scalable UI architecture and improved user experience.

### Planned Enhancements
- Enterprise sidebar navigation
- Full-width responsive dashboard layout
- Advanced typography system
- Rich semantic AI message cards
- Improved publishing preview experience
- Enhanced workflow stepper component

---

# AI Communication Agent — Screen-by-Screen README Specification

This document provides implementation-ready screen specifications for every major UI screen in the AI Communication Agent platform.

The goal of this document is to help GitHub Copilot, Cline, Cursor, or other AI coding assistants generate production-quality React frontend screens consistently.

---

# Global Product Context

## Product Name
AI Communication Agent

## Product Purpose
An enterprise AI-powered communication platform that transforms raw technical IT updates into clear, audience-friendly employee communications.

---

# Global Design System

## Design Style
Modern enterprise SaaS dashboard.

### Visual Characteristics
- Clean whitespace
- Microsoft Fluent + Linear style inspiration
- Dark enterprise sidebar
- Rounded cards
- Subtle shadows
- Soft gray backgrounds
- Blue primary actions
- Semantic status colors
- Responsive desktop-first layout

---

# Global Layout Structure

Every screen uses the same application shell.

## App Shell Layout

```txt
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Main Content Area                               │
│         │                                                  │
│         │                                                  │
│         │                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

# Sidebar Navigation

## Purpose
Primary enterprise navigation.

## Width
- Expanded: 240px
- Collapsed: 72px

## Background
Dark navy gradient.

## Sidebar Sections

### Header
- Product logo
- Product name
- Environment badge

### Workspace
- New Communication
- History
- Templates

### Channels
- Viva Engage
- Microsoft Teams
- Slack

### Admin
- Settings
- Audit Logs
- Analytics

---

# Shared Components

## Components Used Across Screens

| Component | Purpose |
|---|---|
| Sidebar | Navigation |
| HeaderBar | Page header |
| Stepper | Workflow progress |
| SectionCard | Message sections |
| StatusBadge | Status display |
| AIInsightCard | AI explanations |
| PublishPreview | Final preview |
| ChannelBadge | Channel indicator |
| AnalyticsCard | Metrics |
| ComplianceBadge | Governance indicators |

---

# Screen 1 — Dashboard

## Screen Name
Dashboard

## Route
```txt
/dashboard
```

---

## Screen Purpose
Provide enterprise overview of communication activity.

This is the landing screen after login.

---

# Dashboard Layout

## Top Header

### Left Side
- Page title: “Dashboard”
- Subtitle:
  “Monitor communication operations and AI-assisted publishing.”

### Right Side
- New Communication button
- Notification icon
- User profile menu

---

# Dashboard Sections

## Section 1 — KPI Cards

### Purpose
Show operational metrics.

### Cards

#### Total Messages
- Total communications generated
- Trend indicator

#### Published
- Successfully published communications
- Trend percentage

#### Scheduled
- Future scheduled communications

#### Drafts
- Saved drafts

---

## Section 2 — Recent Communications Table

### Columns
| Column | Description |
|---|---|
| Title | Communication title |
| Audience | Target audience |
| Channel | Publish channel |
| Status | Draft / Scheduled / Published |
| Updated | Last updated timestamp |

### Features
- Sorting
- Search
- Status filtering
- Pagination

---

## Section 3 — AI Activity Feed

### Purpose
Show latest AI transformations.

### Feed Item Fields
- Message title
- Audience
- Confidence score
- AI transformation summary
- Timestamp

---

## Section 4 — Communication Performance

### Charts
- Engagement trends
- Channel usage
- Message open rate
- Read completion rate

---

# Dashboard Technical Requirements

## API Requirements

### GET /api/dashboard

Returns:

```json
{
  "metrics": {},
  "recentCommunications": [],
  "activityFeed": [],
  "analytics": {}
}
```

---

# Dashboard Components

```txt
DashboardPage
├── HeaderBar
├── MetricsGrid
│   ├── MetricCard
│   ├── MetricCard
│   ├── MetricCard
│   └── MetricCard
├── RecentCommunicationsTable
├── AIActivityFeed
└── AnalyticsCharts
```

---

# Screen 2 — New Communication (Step 1)

## Route
```txt
/new-communication
```

---

# Purpose
Primary communication composition screen.

Users paste raw technical messages.

AI transforms them.

---

# Layout Structure

## Top Stepper

### Steps
1. Input Message
2. Review Output
3. Publish

### Behavior
- Active step highlighted
- Completed steps show green check
- Future steps disabled

---

# Main Input Card

## Card Title
Compose Your Message

## Subtitle
“Paste your technical message below. AI will transform it into audience-friendly communication.”

---

# Input Fields

## Raw Message Textarea

### Purpose
Accept raw technical communication.

### Features
- Auto-resize
- Character counter
- Syntax highlighting optional
- Max length: 2000
- Placeholder example

### Example Placeholder
```txt
The Kubernetes cluster ingress controller experienced TLS certificate rotation failure...
```

---

## Target Audience Dropdown

### Options
- Frontline Workers
- Office Employees
- IT Staff
- Executives
- External Partners

### Behavior
Changing audience updates:
- tone preview
- vocabulary rules
- AI guidance

---

## Destination Channel Dropdown

### Options
- Viva Engage
- Microsoft Teams
- Slack
- Email
- SMS

---

## Tone Customization

### Options
- Professional
- Calm
- Reassuring
- Executive
- Urgent
- Friendly

---

## Language Selector

### Supported Languages
- English
- Swedish
- German
- French
- Spanish

---

# AI Guidance Panel

## Purpose
Show audience transformation rules.

### Example
```txt
Audience: Frontline Workers
Avoid jargon and acronyms.
Focus on employee impact.
```

---

# Action Buttons

## Transform with AI

### Behavior
- Sends request to backend
- Shows loading state
- Displays AI processing animation

---

# Step 1 API

## POST /api/transform

Request:

```json
{
  "message": "...",
  "audience": "frontline",
  "channel": "teams",
  "tone": "reassuring",
  "language": "en"
}
```

---

# Step 1 Components

```txt
NewCommunicationPage
├── WorkflowStepper
├── InputCard
│   ├── RawMessageTextarea
│   ├── AudienceDropdown
│   ├── ChannelDropdown
│   ├── ToneSelector
│   ├── LanguageSelector
│   └── TransformButton
├── AIContextPanel
└── PromptPreviewDrawer
```

---

# Screen 3 — Review Output (Step 2)

## Route
```txt
/review
```

---

# Purpose
Human review and approval stage.

This is the most critical enterprise AI screen.

---

# Layout

## Left Side
AI-generated communication sections.

## Right Side
AI governance and explainability panel.

---

# AI Message Sections

## Sections

### 1. What Is Happening

### 2. What It Means for You

### 3. What You Need To Do

### 4. Need Help?

---

# Section Card Features

## Capabilities
- Inline editing
- Expand/collapse
- Regenerate section only
- AI explanation tooltip
- Copy section
- Version history

---

# AI Explainability Panel

## Purpose
Explain why AI generated this output.

### Contents
- Audience reasoning
- Tone reasoning
- Simplification score
- Sensitive data masking
- Confidence score
- Compliance indicators

---

# AI Confidence Indicators

## Confidence Levels
| Level | Meaning |
|---|---|
| High | Safe enterprise output |
| Medium | Human review recommended |
| Low | Requires manual revision |

---

# Compliance Checks

## Checks
- Sensitive data leakage
- Technical jargon detection
- Acronym detection
- Tone compliance
- Accessibility readability score

---

# Actions

## Regenerate
Re-run transformation.

## Edit All
Enable editable mode.

## Approve & Continue
Move to publish step.

---

# Step 2 API

## POST /api/regenerate

## POST /api/explain

## POST /api/compliance-check

---

# Step 2 Components

```txt
ReviewOutputPage
├── WorkflowStepper
├── AIMessagePanel
│   ├── SectionCard
│   ├── SectionCard
│   ├── SectionCard
│   └── SectionCard
├── AIExplainabilityPanel
├── CompliancePanel
└── ActionBar
```

---

# Screen 4 — Publish (Step 3)

## Route
```txt
/publish
```

---

# Purpose
Finalize and publish approved communication.

---

# Layout

## Left Side
Publishing configuration.

## Right Side
Final communication preview.

---

# Destination Channel Selector

## Supported Channels
- Viva Engage
- Microsoft Teams
- Slack
- Email

---

# Channel Configuration

## Viva Engage
- Community selector
- Post preview

## Teams
- Team selector
- Channel selector

## Slack
- Workspace selector
- Channel selector

---

# Scheduling Section

## Features
- Publish now
- Schedule later
- Timezone selection
- Recurring schedule

---

# Approval Workflow

## Features
- Require manager approval
- Require compliance approval
- Multi-stage approval

---

# Final Preview Panel

## Features
- Exact channel formatting
- Mobile preview
- Desktop preview
- Accessibility preview

---

# Publish Actions

## Buttons
- Back to Review
- Save Draft
- Schedule
- Publish Now

---

# Step 3 API

## POST /api/publish

Request:

```json
{
  "message": {},
  "channel": "teams",
  "scheduledAt": "2026-06-01T09:00",
  "approvalRequired": true
}
```

---

# Step 3 Components

```txt
PublishPage
├── WorkflowStepper
├── ChannelConfigurationPanel
├── SchedulingPanel
├── ApprovalWorkflowPanel
├── PublishPreview
└── PublishActions
```

---

# Screen 5 — Publish Success

## Route
```txt
/publish-success
```

---

# Purpose
Provide publish confirmation and next actions.

---

# Main Content

## Success Icon
Large green animated success check.

---

## Confirmation Details

### Fields
- Channel
- Audience
- Publish timestamp
- Message ID
- Approval chain

---

# Actions

## Buttons
- Send Another Message
- View Analytics
- View Published Post
- Download Report

---

# Success Components

```txt
PublishSuccessPage
├── SuccessAnimation
├── SuccessSummary
├── PublishedChannelCard
└── SuccessActions
```

---

# Screen 6 — History

## Route
```txt
/history
```

---

# Purpose
Enterprise communication archive.

---

# Features

## Search
- Full-text search
- Audience filtering
- Channel filtering
- Status filtering
- Date range filtering

---

# History Table Columns

| Column | Purpose |
|---|---|
| Title | Communication title |
| Audience | Target audience |
| Status | Draft / Published |
| AI Confidence | AI quality score |
| Version | Current version |
| Updated | Last updated |

---

# History Actions

## Per Row Actions
- View
- Edit
- Duplicate
- Republish
- Export PDF
- Delete

---

# Versioning Support

## Features
- Track all edits
- Compare versions
- Restore previous version

---

# History Components

```txt
HistoryPage
├── SearchToolbar
├── FilterPanel
├── CommunicationsTable
├── VersionDrawer
└── ExportActions
```

---

# Screen 7 — Templates

## Route
```txt
/templates
```

---

# Purpose
Reusable communication templates.

---

# Template Categories

- Incident Reports
- Maintenance Notices
- Security Alerts
- Service Restorations
- Executive Updates

---

# Template Card

## Fields
- Template name
- Usage count
- Audience type
- Channel compatibility
- Last updated

---

# Template Actions

- Use Template
- Edit Template
- Duplicate
- Archive

---

# AI-Assisted Templates

## Features
- AI suggests templates
- Auto-fill placeholders
- Dynamic variables

---

# Template Components

```txt
TemplatesPage
├── TemplateCategoryTabs
├── TemplateGrid
├── TemplateCard
└── TemplateEditorDrawer
```

---

# Screen 8 — Settings

## Route
```txt
/settings
```

---

# Purpose
User and enterprise configuration.

---

# Settings Tabs

## General
- Default audience
- Default channel
- Timezone
- Language

## AI Preferences
- Preferred model
- Tone defaults
- AI aggressiveness
- Auto-simplification level

## Channels
- Teams integration
- Slack integration
- Viva Engage integration

## Notifications
- Email alerts
- Approval notifications
- Publish confirmations

## Security
- API tokens
- RBAC
- Session management

---

# Settings Components

```txt
SettingsPage
├── SettingsTabs
├── GeneralSettings
├── AIPreferences
├── ChannelIntegrations
├── NotificationSettings
└── SecuritySettings
```

---

# Screen 9 — Analytics Dashboard

## Route
```txt
/analytics
```

---

# Purpose
Measure communication impact.

---

# KPI Metrics

- Total Views
- Engagement Rate
- Click-through Rate
- Read Completion
- Average Sentiment
- Helpdesk Ticket Reduction

---

# Charts

## Engagement Over Time
Line chart.

## Channel Distribution
Pie chart.

## Audience Engagement
Bar chart.

## Sentiment Analysis
Heatmap.

---

# AI Impact Metrics

## Example
```txt
AI-generated communications reduced support tickets by 28%.
```

---

# Analytics Components

```txt
AnalyticsPage
├── MetricsOverview
├── EngagementCharts
├── ChannelPerformance
├── SentimentAnalysis
└── AIImpactInsights
```

---

# Screen 10 — Audit Logs

## Route
```txt
/audit-logs
```

---

# Purpose
Enterprise governance and traceability.

---

# Audit Log Fields

| Field | Purpose |
|---|---|
| User | Who performed action |
| Action | What happened |
| Timestamp | When |
| AI Model | Which AI model |
| Channel | Publish destination |
| Compliance Result | Governance status |

---

# Audit Features

- Immutable logs
- Export CSV
- Compliance filtering
- Security monitoring

---

# Audit Components

```txt
AuditLogsPage
├── AuditFilters
├── AuditTable
├── ComplianceIndicators
└── ExportControls
```

---

# Enterprise AI Features

# RAG Architecture

## Purpose
Provide company-specific context.

---

# Knowledge Sources

- Internal communication policies
- Incident templates
- Brand guidelines
- Compliance rules
- Historical communications

---

# Governance Features

## Sensitive Data Detection
- API keys
- Passwords
- Internal IPs
- Employee data

---

# AI Explainability

## Example Insights

```txt
The AI simplified 12 technical terms for frontline workers.
```

---

# Recommended Frontend Stack

## Framework
React + Vite

## Styling
Tailwind CSS

## State Management
Zustand

## Data Fetching
React Query

## Forms
React Hook Form

## Charts
Recharts

## Animations
Framer Motion

## Tables
TanStack Table

---

# Recommended Backend Stack

## Backend
Node.js + Express

## AI
Gemini via OpenRouter

## Database
PostgreSQL

## Authentication
Azure AD / Auth0

## Queue
BullMQ

## Caching
Redis

---

# Enterprise UX Guidelines

## UX Principles

### 1. Human-in-the-loop AI
Humans always approve before publishing.

### 2. AI Transparency
Always explain why AI generated output.

### 3. Enterprise Safety
Never auto-publish without governance.

### 4. Accessibility
WCAG-compliant interfaces.

### 5. Trustworthy AI
Show confidence indicators and compliance badges.

---

# Final Notes for Copilot / Cline

When generating code:

## Priorities
1. Modular components
2. Reusable cards
3. Responsive layout
4. Enterprise-grade UX
5. Semantic accessibility
6. Loading states
7. Empty states
8. Error states
9. Skeleton loaders
10. Type-safe APIs

---

# Suggested Folder Structure

```txt
src/
├── pages/
├── components/
├── layouts/
├── services/
├── hooks/
├── store/
├── utils/
├── types/
├── styles/
└── assets/
```

---

# Suggested Component Structure

```txt
components/
├── dashboard/
├── communication/
├── ai/
├── analytics/
├── governance/
├── publish/
└── shared/
```

---

# End of README Specification


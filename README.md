# Cline-Hack: Slack AI Simplifier Assistant

A robust, Python-based AI assistant designed to simplify technical jargon and communication for various audiences. This project leverages the **Model Context Protocol (MCP)** and **LangGraph** to provide a modular, high-performance reasoning engine that integrates seamlessly with Slack.

## 🚀 Overview

Cline-Hack automates the process of translating complex technical text into audience-appropriate content. Whether you're communicating with Management, Engineering, or General stakeholders, this assistant ensures your message is clear, concise, and technically accurate.

### Key Features
- **LangGraph Reasoning:** Advanced autonomous reasoning loop for processing and refining text.
- **MCP Architecture:** Decoupled tools and brain using SSE (Server-Sent Events) transport.
- **Audience-Aware Simplification:** Tailors tone and detail based on the target persona.
- **Accuracy Validation:** Cross-checks simplified text against the original source to ensure no loss of meaning.
- **Slack Integration:** Real-time processing via Slack Slash commands and interactions.

---

## 🏗️ Architecture

The project is split into two primary components:

1.  **Python MCP Server (`python-mcp-server`)**:
    - Exposes core simplification and validation tools.
    - Operates as a standalone service via SSE.
    - Handles external API calls (e.g., OpenRouter/Gemini).

2.  **Python AI Agent (`python-ai-agent`)**:
    - The "Brain" of the operation using LangGraph.
    - Connects to the MCP server to execute tools.
    - Manages Slack interactions and request lifecycle.

---

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.10+
- A Slack App with Slash Commands enabled.
- OpenRouter API Key.

### 1. Configure the MCP Server

```bash
cd python-mcp-server

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

### 2. Configure the AI Agent

```bash
cd python-ai-agent

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your SLACK_SIGNING_SECRET and OPENROUTER_API_KEY
```

---

## 🏃 Running the Application

You need to run both services simultaneously.

### Start MCP Server
```bash
cd python-mcp-server
source venv/bin/activate
python server.py
```
*Default port: `4000`*

### Start AI Agent
```bash
cd python-ai-agent
source venv/bin/activate
python agent.py
```
*Default port: `3000`*

---

## 💬 Slack Configuration

1.  **Slash Command:** Create `/simplify`.
2.  **Request URL:** Point to your agent's endpoint (e.g., `https://<your-ngrok-url>/slack/simplify`).
3.  **Verification:** Ensure `SLACK_SIGNING_SECRET` in `python-ai-agent/.env` matches your Slack App's secret.

---

## 🔗 GitHub Integration

The platform now supports automated GitHub push monitoring. When a developer pushes code to a connected repository, the system intercepts the webhook payload, extracts the commit SHA, branch ref, and pusher metadata, then orchestrates a multi-step MCP tool chain to enrich the event with contextual data — including repository description, decoded README content, commit diff summary, linked pull request title and body, and any referenced issue threads. The enriched payload is passed to a LangGraph ReAct agent which autonomously reasons over the data and produces a concise, jargon-free natural language summary that is published directly to the configured Slack `#updates` channel via an incoming webhook.

### How it works internally

1. **Webhook ingestion** — `POST /github/webhook` receives the push event, verifies the `X-Hub-Signature-256` HMAC header using `GITHUB_WEBHOOK_SECRET`, and dispatches processing as a FastAPI background task to immediately return HTTP 200 and avoid GitHub's 10-second timeout.
2. **MCP tool orchestration** — The agent calls the following tools in parallel via the SSE-connected MCP server:
   - `get_github_repo` → repository metadata (language, topics, star count)
   - `get_github_readme` → base64-decoded README snippet
   - `get_github_commit_detail` → commit message, author, changed files
   - `get_github_open_issues` → active issue titles for ambient context
3. **Contextual enrichment** — If the pushed branch has an associated open PR, the agent additionally calls `find_github_pull_request_for_branch`, `get_github_pull_request`, and `get_github_pr_files`. If commit messages reference issue numbers (e.g. `Fixes #42`), `get_github_issue` and `get_github_issue_comments` are invoked to surface the original problem statement and team discussion.
4. **AI simplification** — The composed context is sent to Gemini 2.5 Pro via OpenRouter with a strict system prompt constraining output to 2–3 non-technical sentences focused on business impact.
5. **Slack delivery** — The simplified message is posted to `SLACK_UPDATES_WEBHOOK_URL` using Block Kit formatting.

### Configuration

Add to `python-ai-agent/.env`:
```
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=your_secret
```

Add to `python-mcp-server/.env`:
```
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...
```

---

## 📄 License

MIT

---

## 📝 AI Communication Assistant — Consolidated Implementation Change List

### 1. Application Shell & Layout
#### 1.1 Add Enterprise Sidebar Navigation
Implement permanent left navigation panel with:
* Create Message
* My Messages
* Templates
* Approvals
* History
* Analytics
* Settings

#### 1.2 Convert Modal Layout → Full Application Layout
Change from centered narrow wizard to:
* responsive full-width dashboard layout
* max width: 1280–1440px
* proper page gutters and spacing

#### 1.3 Improve Responsive Grid Structure
Adopt:
* 3-column layout for desktop
* stacked layout for tablet/mobile
Suggested:
[Input Panel] [AI Output] [Publishing Panel]

---

### 2. Visual Design & UX Improvements
#### 2.1 Typography System
Implement consistent hierarchy:
* Page title
* Section titles
* Labels
* Body text
* Caption/helper text
Recommended:
* Inter / Segoe UI / SF Pro

#### 2.2 Increase Whitespace & Padding
Improve:
* card padding
* vertical spacing
* section separation
* line heights

#### 2.3 Refine Card Design
Replace heavy borders with:
* subtle borders
* soft shadows
* elevated cards

#### 2.4 Improve Stepper Component
Enhance:
* connector lines
* active states
* completed checkmarks
* animations
* spacing

#### 2.5 Rich Semantic Message Sections
Convert AI output into visually distinct cards:
* What’s Happening
* What This Means
* Action Required
* Need Help
* Timeline
* Risks / Impact
Add icons and colored indicators.

#### 2.6 Enhanced Success Screen
Add:
* publication summary
* channel badge
* timestamp
* “View Message”
* “Send Another”
* “Duplicate Message”
Optional:
* success animation/confetti

---

### 3. Message Authoring Features
#### 3.1 Target Audience Support
Add audience selector:
* All Employees
* Frontline Workers
* IT Teams
* Factory Staff
* Executives
* Pilot Users
* Regional Teams
AI should adapt tone/content based on audience.

#### 3.2 Multi-Language Support
Implement language selector:
* English
* Swedish
* German (future)
* French (future)
AI output should generate localized business messages.

#### 3.3 Message Character Limits
Add:
* live character counter
* channel-specific limits
* warning/error states
Optional AI actions:
* Shorten Message
* Summarize
* Reduce Length

#### 3.4 Tone Selection
Add tone options:
* Professional
* Friendly
* Executive
* Urgent
* Simplified
* Technical-lite

#### 3.5 Editable AI Output
Allow:
* inline editing
* regenerate section
* regenerate full message
* undo/restore original

---

### 4. AI Features & Intelligence
#### 4.1 RAG (Retrieval Augmented Generation)
Integrate enterprise knowledge sources:
* communication templates
* security policies
* HR policies
* approved terminology
* previous announcements
* style guides

#### 4.2 AI Governance & Data Masking
Implement sensitive data detection and masking.
Detect:
* server names
* employee IDs
* credentials
* IP addresses
* emails
* confidential project names
Display:
✓ Sensitive information masked
✓ Policy compliant

#### 4.3 AI Confidence Indicators
Add:
* confidence %
* AI-generated badge
* compliance badge
* readability score

#### 4.4 AI Explainability
Show transformation insights:
* technical terms simplified
* data masked
* reading level adjusted
* message shortened

#### 4.5 AI Output Caching
Cache transformations using:
message + audience + language + tone
Benefits:
* lower latency
* lower AI cost
* consistent outputs

---

### 5. Publishing Workflow
#### 5.1 Channel Selection UI
Improve publishing options with branded cards/icons:
* Microsoft Teams
* Slack
* Viva Engage
* Email (future)

#### 5.2 Destination Selection
Allow selecting:
* Teams channel
* Slack channel
* Viva community
* Distribution group

#### 5.3 Message Preview
Render accurate previews for:
* Teams
* Slack
* Viva Engage
Should resemble actual published appearance.

#### 5.4 Scheduling Support
Add:
* publish now
* scheduled publishing
* timezone support

#### 5.5 Back & Navigation Controls
Improve navigation:
* Back
* Edit
* Save Draft
* Cancel
* Regenerate

---

### 6. Integration Layer
#### 6.1 Microsoft Teams Integration
Implement:
* Microsoft Graph API
* Teams authentication
* channel discovery
* posting capability

#### 6.2 Slack Integration
Implement:
* Slack OAuth
* workspace selection
* channel publishing

#### 6.3 Viva Engage Integration
Implement publishing support for:
* communities
* announcements

---

### 7. Enterprise Workflow Features
#### 7.1 Approval Workflow
Implement:
Draft → Review → Approve → Publish
Roles:
* Author
* Reviewer
* Approver
* Publisher

#### 7.2 Templates System
Add reusable templates:
* Security update
* Maintenance notice
* HR communication
* Incident response
* Office closure

#### 7.3 Message History
Store:
* previous messages
* publication logs
* drafts
* regenerated versions

#### 7.4 Analytics Dashboard
Track:
* delivery status
* engagement
* read rate
* acknowledgements
* reactions

#### 7.5 Audit Logging
Track:
* who generated message
* edits made
* approval actions
* publication timestamps

---

### 8. Performance & Technical Improvements
#### 8.1 Skeleton Loading States
Add loading placeholders during:
* AI transformation
* publishing
* channel loading

#### 8.2 Animation & Microinteractions
Add:
* smooth transitions
* hover states
* button feedback
* step transitions

#### 8.3 Error Handling
Implement graceful handling for:
* AI failures
* publishing failures
* integration issues
* API timeout

#### 8.4 Save Draft Functionality
Persist unfinished messages.

---

### 9. Security & Compliance
#### 9.1 Authentication & Authorization
Support:
* SSO
* Microsoft Entra ID
* RBAC permissions

#### 9.2 Compliance Controls
Add:
* data retention policy
* audit trail
* export logs
* governance checks

---

### 10. Recommended Implementation Priority
**Phase 1 — UI Foundation**
1. Sidebar
2. Full-width layout
3. Typography improvements
4. Rich cards
5. Message preview
6. Better stepper

**Phase 2 — Core Product Features**
1. Audience support
2. Language support
3. Character limit
4. Tone selection
5. Edit/regenerate flow
6. Destination selection

**Phase 3 — Enterprise AI**
1. RAG
2. Governance/data masking
3. Confidence indicators
4. AI explainability

**Phase 4 — Integrations & Workflow**
1. Teams integration
2. Slack integration
3. Approval workflow
4. Templates
5. History
6. Analytics

**Phase 5 — Enterprise Maturity**
1. Audit logs
2. Security/RBAC
3. Compliance controls
4. Performance optimization
5. AI caching

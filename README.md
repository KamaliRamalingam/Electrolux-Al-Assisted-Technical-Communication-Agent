> **Cline AI-Assisted Enterprise Coding Hackathon · May 2026 · Team of five**
>
> Built during a 48-hour hackathon on an Electrolux challenge: turning technical
> engineering updates into clear, audience-specific messages for non-technical teams.
> Developed with AI-assisted coding using [Cline](https://cline.bot).
>
> **My contribution:** the dashboard UI and Teams integration, built on separate
> feature branches. See
> [`1.5-History-Integration`](https://github.com/KamaliRamalingam/electrolux-ai-technical-communication-agent/tree/1.5-History-Integration)
> for my latest work:
> - Phase 1 UI and Node.js backend / MCP server setup
> - Microsoft Teams integration
> - Dashboard, History and "New Communication" screens
> - Enterprise UI redesign: Analytics, Audit Logs, Settings and Templates pages
>
> The files in `enterprise-documentation/` are **fictional sample documents** created
> to demonstrate the documentation-search tool. They are not Electrolux material.

---

# Electrolux Enterprise AI Communication Hub

An advanced, agentic AI platform designed to automatically bridge the communication gap between highly technical engineering workflows (GitHub, Jira) and non-technical business stakeholders (Management, Marketing, Frontline Workers).

By leveraging **LangGraph** for autonomous reasoning and the **Model Context Protocol (MCP)** for secure, decoupled tool execution, this platform transforms cryptic system logs, pull requests, and incident reports into clear, actionable, and audience-tailored business updates.

---

## 🎯 Why This Project is Important

In large enterprises, miscommunication between engineering and business units leads to friction, delayed decision-making, and wasted time. Engineers spend hours manually translating technical jargon into executive summaries, while managers struggle to understand the business impact of a `SIGSEGV in kubelet` or a `feat: implement async context adapter`.

**This platform solves this by:**
1. **Automating Translation:** Instantly turning code pushes and Jira tickets into plain-English updates.
2. **Enterprise Grounding:** Dynamically reading internal enterprise documentation to ensure AI outputs are factually aligned with internal project names and architectures.
3. **Saving Time & Money:** Eliminating the manual overhead of incident reporting and release notes.
4. **Improving Transparency:** Keeping all stakeholders informed in real-time via Slack/Teams without overwhelming them with jargon.

---

## ⚙️ How Everything Works

The platform operates on a reactive, event-driven orchestration pipeline:

1. **Trigger:** A developer pushes code to GitHub, a Jira ticket is created, or a user submits text via the Dashboard.
2. **Orchestration (LangGraph):** The core AI Agent receives the payload and begins its autonomous reasoning loop.
3. **Context Gathering (MCP):** The agent securely delegates tasks to the MCP Server. It pulls the latest GitHub commits, associated pull requests, referenced issues, and searches the `enterprise-documentation` folder for relevant architectural context.
4. **Simplification & Validation:** The AI simplifies the technical text. It then triggers an internal validation loop to ensure the "core business impact" wasn't lost during the translation. If it failed, the agent corrects itself.
5. **Distribution:** The polished, audience-aware message is automatically published to designated Slack channels.

---

## 📂 Codebase Breakdown & File Structure

The repository is modularized into three main components: the AI Agent (Brain), the MCP Server (Tools), and the Dashboard (UI).

### 1. The AI Agent (`/python-ai-agent`)
The "Brain" of the operation. It manages the stateful orchestration of the AI workflow.
* **`agent.py`:** The core FastAPI server. It defines the LangGraph ReAct agent, exposes the webhook endpoints (`/github/webhook`, `/jira/webhook`, `/simplify`), and manages the connection to the MCP server. It handles the routing of incoming events and dispatches the final outputs to Slack.
* **`app.db`:** An SQLite database storing analytics, message history, and templates.

### 2. The MCP Server (`/python-mcp-server`)
The "Hands" of the operation. A decoupled Python process exposing enterprise tools via Server-Sent Events (SSE) using the Model Context Protocol.
* **`server.py`:** Defines and registers all the discrete tools the agent can use.
  * **GitHub Tools:** `get_github_repo`, `get_github_commit_detail`, `get_github_pull_request`, etc.
  * **Enterprise Context Tools:** `list_enterprise_docs`, `read_enterprise_doc`.
  * **AI Processing Tools:** `detect_audience`, `simplify_text`, `validate_accuracy`.

### 3. The Enterprise Frontend (`/frontend`)
A modern React application providing a rich administrative interface for the platform.
* **`src/components/PipelineExplorerPage.jsx`:** A visual, interactive node-based architecture diagram (using React Flow) showing the live execution pathways of the agent (e.g., Master Flow, GitHub Webhook Flow).
* **`src/components/Pages.jsx`:** Houses the Analytics and History dashboards, displaying KPIs like "Technical Hours Saved" and a log of all AI-generated communications.
* **`src/App.jsx` & `Sidebar.jsx`:** Defines the routing and layout for the enterprise SaaS-style dashboard.

### 4. Enterprise Documentation (`/enterprise-documentation`)
* A directory containing Markdown files (e.g., IoT Platforms, OTA pipelines). The MCP server searches and reads these files to ground the AI's knowledge in real company context, preventing hallucinations.

---

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- An OpenRouter API key, and a GitHub personal access token for the MCP server

### 1. Set up the MCP Server
```bash
cd python-mcp-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up the AI Agent
```bash
cd python-ai-agent
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Add your environment variables
Create a `.env` file in `python-mcp-server` and `python-ai-agent` with the
variables listed under **Environment Variables Needed** below.

---

## 🚀 Running the Application Locally

You need to run all three services simultaneously.

### 1. Start the MCP Server
This exposes the tools to the AI Agent on port `4000`.
```bash
cd python-mcp-server
source venv/bin/activate
python server.py
```

### 2. Start the LangGraph AI Agent
This runs the orchestrator and webhook listener on port `3000`.
```bash
cd python-ai-agent
source venv/bin/activate
python agent.py
```

### 3. Start the Frontend Dashboard
This serves the React UI on port `5173`.
```bash
cd frontend
npm install
npm run dev
```

*(Note: To receive live GitHub or Jira webhooks locally, use `ngrok http 3000` and configure the webhook URLs in your GitHub/Jira developer settings).*

---

## 🔐 Environment Variables Needed
- `OPENROUTER_API_KEY`: For Gemini/LLM access.
- `GITHUB_PERSONAL_ACCESS_TOKEN`: For the MCP server to read private repositories.
- `GITHUB_WEBHOOK_SECRET`: For the AI agent to verify incoming push events.
- `SLACK_UPDATES_WEBHOOK_URL`: For publishing outputs to Slack.

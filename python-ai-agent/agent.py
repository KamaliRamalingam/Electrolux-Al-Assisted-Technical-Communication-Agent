import os
import json
import urllib.parse
from contextlib import asynccontextmanager, AsyncExitStack
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import sqlite3
from datetime import datetime

from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
import httpx
import requests

# MCP Client
from mcp import ClientSession
from mcp.client.sse import sse_client

load_dotenv()

MCP_SERVER_URL = os.environ.get("MCP_SERVER_URL", "http://127.0.0.1:4000/sse")

# Global variables for the MCP session
mcp_session = None
exit_stack = None

async def init_mcp():
    global mcp_session, exit_stack
    if mcp_session is not None:
        return
    if exit_stack is None:
        exit_stack = AsyncExitStack()
    print(f"[Agent] Connecting to MCP Server at {MCP_SERVER_URL}...")
    try:
        sse_transport = await exit_stack.enter_async_context(sse_client(MCP_SERVER_URL))
        mcp_session = await exit_stack.enter_async_context(ClientSession(sse_transport[0], sse_transport[1]))
        await mcp_session.initialize()
        print("[Agent] Successfully connected to MCP Server via SSE")
    except Exception as e:
        print(f"[Agent] Failed to connect to MCP Server: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global exit_stack
    exit_stack = AsyncExitStack()
    await init_mcp()
    yield
    await exit_stack.aclose()

def init_db():
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        original_text TEXT,
                        simplified_text TEXT,
                        audience TEXT,
                        status TEXT,
                        created_at TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS templates (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        content TEXT,
                        category TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS analytics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        messages_generated INTEGER,
                        messages_published INTEGER)''')
    
    # Pre-populate templates
    cursor.execute("SELECT COUNT(*) FROM templates")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO templates (title, content, category) VALUES (?, ?, ?)",
                       ("System Outage", "We are experiencing a system outage. Engineers are investigating. ETA for resolution is 2 hours.", "IT Incident"))
        cursor.execute("INSERT INTO templates (title, content, category) VALUES (?, ?, ?)",
                       ("Quarterly Update", "Our quarterly earnings have exceeded expectations by 15%. Great job team!", "Management"))
    
    # Pre-populate analytics
    cursor.execute("SELECT COUNT(*) FROM analytics")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO analytics (messages_generated, messages_published) VALUES (0, 0)")
        
    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect("app.db")
    conn.row_factory = sqlite3.Row
    return conn

app = FastAPI(lifespan=lifespan)

# --- Define LangChain Tools that proxy to our MCP server ---

@tool
async def detect_audience(text: str) -> str:
    """Detect the appropriate audience for a given technical text. Returns a string representing the audience (management, marketing, engineering, general)."""
    print(f"[Tool Executing] detect_audience")
    await init_mcp()
    result = await mcp_session.call_tool("detect_audience", arguments={"text": text})
    return result.content[0].text

@tool
async def simplify_text(text: str, audience: str) -> str:
    """Simplify technical text based on specific audience requirements."""
    print(f"[Tool Executing] simplify_text")
    await init_mcp()
    result = await mcp_session.call_tool("simplify_text", arguments={"text": text, "audience": audience})
    return result.content[0].text

@tool
async def validate_accuracy(original_text: str, simplified_text: str) -> dict:
    """Validate if simplified text maintains key technical meaning compared to original."""
    print(f"[Tool Executing] validate_accuracy")
    await init_mcp()
    result = await mcp_session.call_tool("validate_accuracy", arguments={
        "original_text": original_text,
        "simplified_text": simplified_text
    })
    return json.loads(result.content[0].text)

@tool
async def list_enterprise_docs() -> str:
    """List all available enterprise project documentation files to find relevant context."""
    print(f"[Tool Executing] list_enterprise_docs")
    await init_mcp()
    result = await mcp_session.call_tool("list_enterprise_docs", arguments={})
    return result.content[0].text

@tool
async def read_enterprise_doc(filename: str) -> str:
    """Read a specific enterprise documentation file to extract project-specific context."""
    print(f"[Tool Executing] read_enterprise_doc")
    await init_mcp()
    result = await mcp_session.call_tool("read_enterprise_doc", arguments={"filename": filename})
    return result.content[0].text

tools = [detect_audience, simplify_text, validate_accuracy, list_enterprise_docs, read_enterprise_doc]

# Build the LangGraph ReAct Agent
llm = ChatOpenAI(
    model="google/gemini-2.5-pro",
    api_key=os.environ.get("OPENROUTER_API_KEY", "dummy"),
    base_url="https://openrouter.ai/api/v1",
    temperature=0.2
)

agent = create_react_agent(llm, tools)

async def run_mcp_pipeline(text: str, audience: str = "management", language: str = "English", tone: str = "Professional") -> dict:
    print(f"[Agent] Starting autonomous ReAct reasoning loop for text: {text[:30]}...")
    system_prompt = (
        f"You are an autonomous AI Agent responsible for converting technical text into business communication. "
        f"Target Audience: {audience}. Language: {language}. Tone: {tone}. "
        "ORCHESTRATION RULES:\n"
        "1. Start by listing enterprise documentation (list_enterprise_docs) to see if this relates to an existing project.\n"
        "2. If a relevant document is found, read it (read_enterprise_doc) to extract specific business and operational context.\n"
        "3. Use this context to make the simplification 'grounded' in the enterprise ecosystem.\n"
        "4. Use detect_audience, simplify_text, and validate_accuracy as part of the loop.\n"
        "5. If validation fails, retry ONCE with stricter technical facts.\n"
        "6. In your final response, use the format: 'CONTEXT_USED: [doc1, doc2]\\n\\n[Simplified Text]'"
    )
    
    # Invoke the ReAct graph
    result = await agent.ainvoke({
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Please simplify this text: {text}"}
        ]
    })
    
    raw_output = result["messages"][-1].content
    docs_used = []
    final_output = raw_output

    if "CONTEXT_USED:" in raw_output:
        parts = raw_output.split("\n\n", 1)
        header = parts[0]
        if len(parts) > 1:
            final_output = parts[1]
        
        # Extract docs from header like CONTEXT_USED: [doc1.md, doc2.md]
        try:
            doc_str = header.split("CONTEXT_USED:")[1].strip()
            if doc_str.startswith("[") and doc_str.endswith("]"):
                docs_used = [d.strip() for d in doc_str[1:-1].split(",") if d.strip()]
        except:
            pass

    return {
        "final_output": final_output,
        "audience": audience,
        "validation_passed": True,
        "docs_used": docs_used
    }

async def process_and_respond(text: str, response_url: str):
    try:
        pipeline_result = await run_mcp_pipeline(text)
        final_message = pipeline_result["final_output"]
        print("[Agent] Finished processing. Sending response to Slack.")
        
        # Send response back to Slack
        async with httpx.AsyncClient() as client:
            await client.post(response_url, json={
                "response_type": "in_channel",
                "text": f"✨ *Simplified:*\n{final_message}"
            })
            
    except Exception as e:
        print(f"Error processing async task: {e}")
        async with httpx.AsyncClient() as client:
            await client.post(response_url, json={
                "text": "An error occurred while processing your request."
            })

from pydantic import BaseModel

class SimplifyRequest(BaseModel):
    text: str
    audience: str = "management"
    language: str = "English"
    tone: str = "Professional"

class PublishRequest(BaseModel):
    message: str

# ──────────────────────────────────────────────
# Slack helper: UPDATES channel (frontend publishes)
# Uses SLACK_UPDATES_WEBHOOK_URL
# ──────────────────────────────────────────────
def send_to_slack_updates(message: str):
    """Post a simplified message to the #updates channel (triggered from the frontend)."""
    webhook_url = os.environ.get("SLACK_UPDATES_WEBHOOK_URL")
    if not webhook_url:
        print("[Agent] Error: SLACK_UPDATES_WEBHOOK_URL is not set!")
        return
    payload = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*📢 Simplified Update*\n{message}"
                }
            }
        ]
    }
    try:
        requests.post(webhook_url, json=payload)
        print("[Agent] Message posted to #updates channel")
    except Exception as e:
        print(f"[Agent] Error sending to #updates channel: {e}")

@app.post("/simplify")
async def simplify_endpoint(req: SimplifyRequest):
    result = await run_mcp_pipeline(req.text, req.audience, req.language, req.tone)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO messages (original_text, simplified_text, audience, status, created_at) VALUES (?, ?, ?, ?, ?)",
                   (req.text, result['final_output'], req.audience, 'Draft', datetime.now().isoformat()))
    cursor.execute("UPDATE analytics SET messages_generated = messages_generated + 1")
    conn.commit()
    conn.close()
    return result

@app.post("/slack/publish")
async def publish_endpoint(req: PublishRequest):
    """Frontend-triggered: publish simplified message to the #updates Slack channel."""
    send_to_slack_updates(req.message)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE analytics SET messages_published = messages_published + 1")
    conn.commit()
    conn.close()
    return {"status": "ok"}

@app.get("/messages")
async def get_messages():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/templates")
async def get_templates():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM templates")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/approvals")
async def get_approvals():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE status='Pending Approval' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/approvals/{msg_id}/approve")
async def approve_message(msg_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE messages SET status='Approved' WHERE id=?", (msg_id,))
    conn.commit()
    conn.close()
    return {"status": "ok"}

@app.get("/analytics")
async def get_analytics():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analytics LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else {"messages_generated": 0, "messages_published": 0}

@app.get("/settings")
async def get_settings():
    return {"theme": "dark", "notifications": True}

@app.post("/slack/simplify")
async def slack_endpoint(req: Request, background_tasks: BackgroundTasks):
    body_bytes = await req.body()
    body_str = body_bytes.decode('utf-8')
    parsed = urllib.parse.parse_qs(body_str)
    
    text = parsed.get("text", [""])[0]
    response_url = parsed.get("response_url", [""])[0]
    
    if not text:
        return JSONResponse({"response_type": "ephemeral", "text": "Please provide text to simplify."})

    # Kick off background task
    background_tasks.add_task(process_and_respond, text, response_url)
    
    # Return immediate 200 OK so Slack doesn't timeout and retry!
    return JSONResponse({
        "response_type": "in_channel", 
        "text": f"📝 *Original Request:*\n{text}\n\n⏳ Processing..."
    })

# ──────────────────────────────────────────────
# Slack helper: JIRA TICKETS channel
# Uses SLACK_WEBHOOK_URL
# ──────────────────────────────────────────────
def send_to_slack(message: str):
    """Post a Jira-ticket simplified message to the dedicated Jira Slack channel."""
    webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        print("[Agent] Error: SLACK_WEBHOOK_URL is not set!")
        return
    payload = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*🎫 New Jira Ticket Simplified*\n{message}"
                }
            }
        ]
    }
    try:
        requests.post(webhook_url, json=payload)
        print("[Agent] Jira message posted to Slack")
    except Exception as e:
        print(f"[Agent] Error sending Jira message to Slack: {e}")

@app.post("/jira/webhook")
async def jira_webhook(req: Request):
    data = await req.json()

    issue = data.get("issue", {})
    summary = issue.get("fields", {}).get("summary", "")
    description = issue.get("fields", {}).get("description", "")

    full_text = f"{summary}. {description}"

    # 👉 Call your MCP agent
    result = await run_mcp_pipeline(full_text)

    simplified = result["final_output"]

    # 👉 Send to Slack
    send_to_slack(simplified)

    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Start both backend services for the Electrolux AI Comms Tool
#
# Terminal A: ./start-backend.sh mcp     → MCP server  (port 4000)
# Terminal B: ./start-backend.sh agent   → AI agent    (port 3000)
# Terminal C: cd frontend && npm run dev  → Frontend   (port 5173)
# ─────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

case "$1" in
  mcp)
    echo "🔧 Starting MCP Server on port 4000…"
    cd "$PROJECT_DIR/python-mcp-server"

    # Create venv if it doesn't exist
    if [ ! -d venv ]; then
      echo "📦 Creating virtualenv…"
      python3 -m venv venv
      venv/bin/pip install -r requirements.txt
    fi

    # Create .env if missing
    if [ ! -f .env ]; then
      cp .env.example .env
      echo "⚠️  .env created from .env.example — add your OPENROUTER_API_KEY if needed"
    fi

    venv/bin/python server.py
    ;;

  agent)
    echo "🤖 Starting AI Agent on port 3000…"
    cd "$PROJECT_DIR/python-ai-agent"

    # Create venv if it doesn't exist
    if [ ! -d venv ]; then
      echo "📦 Creating virtualenv…"
      python3 -m venv venv
      venv/bin/pip install -r requirements.txt
    fi

    # Create .env if missing
    if [ ! -f .env ]; then
      cp .env.example .env
      echo "⚠️  .env created from .env.example"
    fi

    venv/bin/uvicorn agent:app --host 0.0.0.0 --port 3000 --reload
    ;;

  *)
    echo ""
    echo "Usage:"
    echo "  ./start-backend.sh mcp    # Start MCP Server on port 4000"
    echo "  ./start-backend.sh agent  # Start AI Agent on port 3000"
    echo ""
    echo "Then in another terminal:"
    echo "  cd frontend && npm run dev   # Start frontend on port 5173"
    echo ""
    ;;
esac

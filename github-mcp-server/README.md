# GitHub MCP Server

The agent connects to the GitHub MCP server via stdio (launched automatically by the agent on startup using `npx`). No separate setup needed — just set your token.

## Setup

### 1. Generate a GitHub Personal Access Token (PAT)

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token

### 2. Add to your `.env` file

```
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
GITHUB_WEBHOOK_SECRET=any_random_secret_string
```

### 3. Configure the GitHub Webhook

1. Go to your GitHub repository → Settings → Webhooks → Add webhook
2. Set:
   - **Payload URL**: `https://<your-domain>/github/webhook`  
     (use [ngrok](https://ngrok.com/) for local dev: `ngrok http 3000`)
   - **Content type**: `application/json`
   - **Secret**: same value as `GITHUB_WEBHOOK_SECRET` in your `.env`
   - **Events**: Just the push event
3. Click **Add webhook**

## How it works

When someone pushes code to the repo:

1. GitHub sends a push event to `/github/webhook`
2. The agent fetches repo info, README, and commit details via GitHub MCP tools
3. The AI simplifies it into a plain-English summary
4. The summary is posted to your Slack `#updates` channel

## MCP Tools used

| Tool | What it fetches |
|------|----------------|
| `search_repositories` | Repo name, description, language, stars |
| `get_file_contents` | README.md content |
| `list_commits` | Recent commit history |
| `get_commit` | Commit message, author, files changed |

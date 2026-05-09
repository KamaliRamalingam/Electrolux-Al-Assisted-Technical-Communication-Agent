from mcp.server.fastmcp import FastMCP
import os
import json
import base64
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize FastMCP Server
mcp = FastMCP("simplification-tools")

client = OpenAI(
    api_key=os.environ.get("OPENROUTER_API_KEY", "dummy"),
    base_url="https://openrouter.ai/api/v1"
)

@mcp.tool()
def detect_audience(text: str) -> str:
    """Detect the appropriate audience for a given technical text."""
    prompt = f"""
You are an expert intent and audience detector.
Analyze the following text input.
Determine which audience is this text meant for? Choose from: "management", "marketing", "engineering", or "general". Default to "general" if unclear.

Return JSON ONLY. Format:
{{ "audience": "management | marketing | engineering | general" }}

Text: "{text}"
"""
    response = client.chat.completions.create(
        model="google/gemini-2.5-flash",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    return json.loads(response.choices[0].message.content).get("audience", "general")


@mcp.tool()
def simplify_text(text: str, audience: str) -> str:
    """Simplify technical text based on specific audience requirements."""
    rules = ""
    if audience == "management":
        rules += "\n- Focus on business impact and resolution."
    elif audience == "marketing":
        rules += "\n- Highlight user impact and benefits."

    system_prompt = f"""You are an expert at translating complex technical updates into clear, simple communication for business audiences.

STRICT RULES:
- Maximum 2 sentences
- No technical jargon (avoid words like Kubernetes, TLS, ingress unless absolutely necessary)
- Focus on impact, not implementation
- Make it understandable to a non-technical manager
- Keep it concise and clear{rules}

Audience: {audience}

Output ONLY the simplified version.
"""
    response = client.chat.completions.create(
        model="google/gemini-2.5-pro",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Please simplify this text:\n\n{text}"}
        ],
        temperature=0.3
    )
    output = response.choices[0].message.content.strip()
    words = output.split()
    if len(words) > 30:
        output = " ".join(words[:30]) + "..."
    return output


@mcp.tool()
def validate_accuracy(original_text: str, simplified_text: str) -> dict:
    """Validate if simplified text maintains key technical meaning compared to original."""
    prompt = f"""
You are an accuracy validator for business simplifications.
Compare the original technical text with the simplified version.
Determine if the CORE BUSINESS IMPACT was preserved.
Since the simplified version MUST strip technical jargon, it is expected to lose technical details.
If the high-level message is accurate, return valid: true.
If the high-level business impact is completely wrong, return valid: false and a brief reason.

Return JSON ONLY:
{{
  "valid": boolean,
  "reason": "string (null if valid)"
}}

Original Text:
{original_text}

Simplified Text:
{simplified_text}
"""
    response = client.chat.completions.create(
        model="google/gemini-2.5-flash",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    result = json.loads(response.choices[0].message.content)
    return json.dumps({
        "is_valid": result.get("valid", True),
        "confidence": 0.95 if result.get("valid") else 0.4,
        "reason": result.get("reason")
    })


# ──────────────────────────────────────────────
# GitHub Tools
# ──────────────────────────────────────────────

def _github_headers() -> dict:
    token = os.environ.get("GITHUB_PERSONAL_ACCESS_TOKEN", "")
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers

def _gh(path: str, params: dict = None) -> dict | list:
    url = f"https://api.github.com{path}"
    r = requests.get(url, headers=_github_headers(), params=params or {}, timeout=10)
    r.raise_for_status()
    return r.json()


@mcp.tool()
def get_github_repo(owner: str, repo: str) -> str:
    """Fetch GitHub repository metadata: name, description, language, topics, and star count."""
    data = _gh(f"/repos/{owner}/{repo}")
    return json.dumps({
        "name": data.get("name"),
        "full_name": data.get("full_name"),
        "description": data.get("description"),
        "language": data.get("language"),
        "topics": data.get("topics", []),
        "stars": data.get("stargazers_count"),
        "open_issues_count": data.get("open_issues_count"),
    })


@mcp.tool()
def get_github_readme(owner: str, repo: str) -> str:
    """Fetch and decode the README.md of a GitHub repository (first 600 characters)."""
    try:
        data = _gh(f"/repos/{owner}/{repo}/readme")
        raw = data.get("content", "")
        decoded = base64.b64decode(raw).decode("utf-8", errors="ignore")
        return decoded[:600]
    except Exception as e:
        return f"README not available: {e}"


@mcp.tool()
def get_github_commits(owner: str, repo: str, branch: str = "main", per_page: int = 5) -> str:
    """List the most recent commits on a GitHub repository branch."""
    data = _gh(f"/repos/{owner}/{repo}/commits", {"sha": branch, "per_page": per_page})
    commits = [
        {
            "sha": c["sha"][:7],
            "message": c["commit"]["message"].split("\n")[0],
            "author": c["commit"]["author"]["name"],
            "date": c["commit"]["author"]["date"],
        }
        for c in data
    ]
    return json.dumps(commits)


@mcp.tool()
def get_github_commit_detail(owner: str, repo: str, sha: str) -> str:
    """Get full detail of a specific commit: message, author, and files changed."""
    data = _gh(f"/repos/{owner}/{repo}/commits/{sha}")
    files = [{"filename": f["filename"], "status": f["status"], "changes": f["changes"]}
             for f in data.get("files", [])[:10]]
    return json.dumps({
        "sha": data["sha"][:7],
        "message": data["commit"]["message"],
        "author": data["commit"]["author"]["name"],
        "date": data["commit"]["author"]["date"],
        "files_changed": files,
    })


@mcp.tool()
def get_github_pull_request(owner: str, repo: str, pull_number: int) -> str:
    """Get a GitHub pull request's title, body, state, and reviewer info."""
    data = _gh(f"/repos/{owner}/{repo}/pulls/{pull_number}")
    return json.dumps({
        "number": data.get("number"),
        "title": data.get("title"),
        "body": (data.get("body") or "")[:400],
        "state": data.get("state"),
        "author": data.get("user", {}).get("login"),
        "base": data.get("base", {}).get("ref"),
        "head": data.get("head", {}).get("ref"),
    })


@mcp.tool()
def get_github_pr_files(owner: str, repo: str, pull_number: int) -> str:
    """List files changed in a GitHub pull request."""
    data = _gh(f"/repos/{owner}/{repo}/pulls/{pull_number}/files")
    files = [{"filename": f["filename"], "status": f["status"], "changes": f["changes"]}
             for f in data[:10]]
    return json.dumps(files)


@mcp.tool()
def get_github_issue(owner: str, repo: str, issue_number: int) -> str:
    """Get a GitHub issue's title, body, and labels."""
    data = _gh(f"/repos/{owner}/{repo}/issues/{issue_number}")
    return json.dumps({
        "number": data.get("number"),
        "title": data.get("title"),
        "body": (data.get("body") or "")[:400],
        "state": data.get("state"),
        "labels": [l["name"] for l in data.get("labels", [])],
        "author": data.get("user", {}).get("login"),
    })


@mcp.tool()
def get_github_issue_comments(owner: str, repo: str, issue_number: int) -> str:
    """Get discussion comments on a GitHub issue — useful for understanding the context behind a fix."""
    data = _gh(f"/repos/{owner}/{repo}/issues/{issue_number}/comments", {"per_page": 5})
    comments = [{"author": c["user"]["login"], "body": c["body"][:200]} for c in data]
    return json.dumps(comments)


@mcp.tool()
def get_github_open_issues(owner: str, repo: str) -> str:
    """List the most recent open issues in a GitHub repository."""
    data = _gh(f"/repos/{owner}/{repo}/issues", {"state": "open", "per_page": 5})
    issues = [{"number": i["number"], "title": i["title"],
               "labels": [l["name"] for l in i.get("labels", [])]}
              for i in data if "pull_request" not in i]
    return json.dumps(issues)


@mcp.tool()
def find_github_pull_request_for_branch(owner: str, repo: str, branch: str) -> str:
    """Find open pull requests for a given branch to understand the intent of a push."""
    data = _gh(f"/repos/{owner}/{repo}/pulls", {"head": f"{owner}:{branch}", "state": "open"})
    prs = [{"number": p["number"], "title": p["title"], "body": (p.get("body") or "")[:300]}
           for p in data]
    return json.dumps(prs)


if __name__ == "__main__":
    # Start an SSE server on port 4000
    mcp.settings.port = int(os.environ.get("MCP_PORT", 4000))
    mcp.run(transport='sse')

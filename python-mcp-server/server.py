from mcp.server.fastmcp import FastMCP
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize FastMCP Server
mcp = FastMCP("simplification-tools")

client = OpenAI(
    api_key=os.environ.get("OPENROUTER_API_KEY", "dummy"),
    base_url="https://openrouter.ai/api/v1"
)

DOC_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "enterprise-documentation")

@mcp.tool()
def list_enterprise_docs() -> str:
    """List all available enterprise project documentation files."""
    if not os.path.exists(DOC_FOLDER):
        return "Error: enterprise-documentation folder not found."
    files = os.listdir(DOC_FOLDER)
    return "\n".join(files)

@mcp.tool()
def read_enterprise_doc(filename: str) -> str:
    """Read the content of a specific enterprise documentation file."""
    # Security: ensure we stay within the folder
    base_name = os.path.basename(filename)
    path = os.path.join(DOC_FOLDER, base_name)
    if not os.path.exists(path):
        return f"Error: File {base_name} not found."
    with open(path, "r") as f:
        return f.read()

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


if __name__ == "__main__":
    # Start an SSE server on port 4000
    mcp.settings.port = int(os.environ.get("MCP_PORT", 4000))
    mcp.run(transport='sse')

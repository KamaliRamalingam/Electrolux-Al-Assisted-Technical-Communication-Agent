/**
 * Electrolux AI Communication Agent — Node.js MCP Server
 * Provides AI simplification tools via SSE on port 4000.
 *
 * Tools:
 *   detect_audience   — Detect the best audience for a technical message
 *   simplify_text     — Simplify text for a given audience
 *   validate_accuracy — Validate that simplified text preserves the core message
 */

import 'dotenv/config';
import express from 'express';
import { McpServer }       from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import OpenAI from 'openai';
import { z } from 'zod';

// ── Config ────────────────────────────────────────────────────────────────────
const PORT     = parseInt(process.env.MCP_PORT || '4000', 10);
const USE_MOCK = (process.env.USE_MOCK_AI || 'true').toLowerCase() === 'true';
const AI_KEY   = process.env.OPENROUTER_API_KEY || 'dummy';
const AI_BASE  = 'https://openrouter.ai/api/v1';

// ── OpenAI / OpenRouter client ────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: AI_KEY, baseURL: AI_BASE });

// ── MCP Server ────────────────────────────────────────────────────────────────
const mcp = new McpServer({
  name:    'simplification-tools',
  version: '1.0.0',
});

// ── Tool: detect_audience ─────────────────────────────────────────────────────
mcp.tool(
  'detect_audience',
  'Detect the appropriate audience for a given technical text.',
  { text: z.string().describe('The technical text to analyse') },
  async ({ text }) => {
    if (USE_MOCK) {
      return { content: [{ type: 'text', text: 'management' }] };
    }

    const prompt = `You are an expert intent and audience detector.
Analyse the following text and determine which audience it is meant for.
Choose from: "management", "marketing", "engineering", or "general". Default to "general" if unclear.

Return JSON ONLY. Format: { "audience": "management | marketing | engineering | general" }

Text: "${text}"`;

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const audience = JSON.parse(response.choices[0].message.content).audience || 'general';
    return { content: [{ type: 'text', text: audience }] };
  }
);

// ── Tool: simplify_text ───────────────────────────────────────────────────────
mcp.tool(
  'simplify_text',
  'Simplify technical text based on specific audience requirements.',
  {
    text:     z.string().describe('The technical text to simplify'),
    audience: z.string().describe('Target audience: management | marketing | engineering | general'),
  },
  async ({ text, audience }) => {
    if (USE_MOCK) {
      return {
        content: [{
          type: 'text',
          text: `A system update was completed successfully. The service is now running normally and all users can resume their activities.`,
        }],
      };
    }

    let rules = '';
    if (audience === 'management')  rules = '\n- Focus on business impact and resolution.';
    if (audience === 'marketing')   rules = '\n- Highlight user impact and benefits.';

    const systemPrompt = `You are an expert at translating complex technical updates into clear, simple communication for business audiences.

STRICT RULES:
- Maximum 2 sentences
- No technical jargon
- Focus on impact, not implementation
- Keep it concise and clear${rules}

Audience: ${audience}

Output ONLY the simplified version.`;

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: `Please simplify this text:\n\n${text}` },
      ],
      temperature: 0.3,
    });

    let output = response.choices[0].message.content.trim();
    const words = output.split(' ');
    if (words.length > 30) output = words.slice(0, 30).join(' ') + '...';

    return { content: [{ type: 'text', text: output }] };
  }
);

// ── Tool: validate_accuracy ───────────────────────────────────────────────────
mcp.tool(
  'validate_accuracy',
  'Validate if simplified text maintains key technical meaning compared to the original.',
  {
    original_text:   z.string().describe('The original technical text'),
    simplified_text: z.string().describe('The simplified version to validate'),
  },
  async ({ original_text, simplified_text }) => {
    if (USE_MOCK) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ is_valid: true, confidence: 0.95, reason: null }),
        }],
      };
    }

    const prompt = `You are an accuracy validator for business simplifications.
Compare the original technical text with the simplified version.
If the high-level business message is accurate, return valid: true.
If the business impact is completely wrong, return valid: false and a brief reason.

Return JSON ONLY:
{
  "valid": boolean,
  "reason": "string or null"
}

Original: ${original_text}
Simplified: ${simplified_text}`;

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          is_valid:   result.valid ?? true,
          confidence: result.valid ? 0.95 : 0.4,
          reason:     result.reason ?? null,
        }),
      }],
    };
  }
);

// ── Express + SSE transport ───────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Keep track of active SSE transports
const transports = new Map();

app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports.set(transport.sessionId, transport);
  res.on('close', () => transports.delete(transport.sessionId));
  await mcp.connect(transport);
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);
  if (!transport) {
    return res.status(404).json({ error: 'Session not found' });
  }
  await transport.handlePostMessage(req, res);
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', tools: 3 }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🔧 MCP Server running on http://localhost:${PORT}`);
  console.log(`   SSE endpoint : http://localhost:${PORT}/sse`);
  console.log(`   USE_MOCK_AI  = ${USE_MOCK}`);
  console.log(`   Tools: detect_audience | simplify_text | validate_accuracy\n`);
});

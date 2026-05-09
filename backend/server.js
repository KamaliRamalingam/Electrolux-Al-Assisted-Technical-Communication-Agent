/**
 * Electrolux AI Communication Agent — Node.js / Express Backend
 * Listens on port 3000 (proxied from Vite frontend via /api)
 *
 * Endpoints:
 *   POST /transform          → AI-transform raw message → 4-section output
 *   POST /publish            → Save published message, return success meta
 *   POST /simplify           → Legacy: plain-text simplification
 *   POST /slack/publish      → Legacy: publish to Slack webhook
 *   GET  /messages           → Message history
 *   GET  /templates          → Saved templates
 *   GET  /approvals          → Pending-approval messages
 *   POST /approvals/:id/approve
 *   GET  /analytics
 *   GET  /settings
 */

import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import Database from 'better-sqlite3';
import OpenAI   from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const PORT       = parseInt(process.env.PORT || '3000', 10);
const USE_MOCK   = (process.env.USE_MOCK_AI || 'true').toLowerCase() === 'true';
const AI_KEY     = process.env.OPENROUTER_API_KEY || 'dummy';
const AI_BASE    = 'https://openrouter.ai/api/v1';
const AI_MODEL   = 'google/gemini-2.5-flash';

// ── AI client ─────────────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: AI_KEY, baseURL: AI_BASE });

// ── SQLite DB ─────────────────────────────────────────────────────────────────
const db = new Database(join(__dirname, 'app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    original_text  TEXT,
    simplified_text TEXT,
    audience       TEXT,
    status         TEXT,
    created_at     TEXT
  );

  CREATE TABLE IF NOT EXISTS templates (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    title    TEXT,
    content  TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    messages_generated  INTEGER DEFAULT 0,
    messages_published  INTEGER DEFAULT 0
  );
`);

// Seed templates
const templateCount = db.prepare('SELECT COUNT(*) as n FROM templates').get().n;
if (templateCount === 0) {
  db.prepare('INSERT INTO templates (title, content, category) VALUES (?, ?, ?)').run(
    'System Outage',
    'We are experiencing a system outage. Engineers are investigating. ETA for resolution is 2 hours.',
    'IT Incident'
  );
  db.prepare('INSERT INTO templates (title, content, category) VALUES (?, ?, ?)').run(
    'Quarterly Update',
    'Our quarterly earnings have exceeded expectations by 15%. Great job team!',
    'Management'
  );
}

// Seed analytics row
const analyticsCount = db.prepare('SELECT COUNT(*) as n FROM analytics').get().n;
if (analyticsCount === 0) {
  db.prepare('INSERT INTO analytics (messages_generated, messages_published) VALUES (0, 0)').run();
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Audience labels ───────────────────────────────────────────────────────────
const AUDIENCE_LABELS = {
  frontline: 'Frontline Workers',
  office:    'Office Employees',
  it:        'IT Staff',
};

// ── AI transform helper ───────────────────────────────────────────────────────
async function runTransform(rawMessage, audience, channel) {
  if (USE_MOCK) {
    const label = AUDIENCE_LABELS[audience] || audience;
    return {
      what_is_happening:      `A planned system maintenance window has been scheduled. Our engineering team is performing routine upgrades to improve reliability on ${channel}.`,
      what_it_means_for_you:  `As ${label}, you may experience brief service interruptions during the maintenance window. Normal service will resume promptly once complete.`,
      what_you_need_to_do:    'Please save your work and log out before the maintenance window begins tonight. You can resume normal activities once the window is complete.',
      help:                   'For questions or urgent issues, contact IT Support at helpdesk@company.com or call extension 4444.',
    };
  }

  const audienceLabel = AUDIENCE_LABELS[audience] || audience;
  const prompt = `You are an expert enterprise communication specialist.
Transform the following raw message into a structured 4-section communication for ${audienceLabel} to be published on ${channel}.

Return ONLY valid JSON with exactly these four keys:
{
  "what_is_happening": "Clear explanation of what is happening (2-3 sentences)",
  "what_it_means_for_you": "What this means for ${audienceLabel} specifically (2-3 sentences)",
  "what_you_need_to_do": "Clear action items for the audience (2-3 sentences)",
  "help": "Who to contact for help or questions (1-2 sentences)"
}

Raw message: ${rawMessage}`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Phase 1 wizard: transform
app.post('/transform', async (req, res) => {
  const { rawMessage, audience = 'frontline', channel = 'Viva Engage' } = req.body;
  if (!rawMessage?.trim()) {
    return res.status(400).json({ success: false, error: 'rawMessage is required' });
  }
  try {
    const result = await runTransform(rawMessage, audience, channel);
    db.prepare(
      'INSERT INTO messages (original_text, simplified_text, audience, status, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(rawMessage, JSON.stringify(result), audience, 'Draft', new Date().toISOString());
    db.prepare('UPDATE analytics SET messages_generated = messages_generated + 1').run();
    return res.json({ success: true, transformedMessage: result });
  } catch (err) {
    console.error('[/transform]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Phase 1 wizard: publish
app.post('/publish', (req, res) => {
  const { transformedMessage, channel = 'Viva Engage', audience = 'frontline', scheduledAt } = req.body;
  if (!transformedMessage) {
    return res.status(400).json({ success: false, error: 'transformedMessage is required' });
  }
  try {
    db.prepare(
      'INSERT INTO messages (original_text, simplified_text, audience, status, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run('', JSON.stringify(transformedMessage), audience, 'Published', new Date().toISOString());
    db.prepare('UPDATE analytics SET messages_published = messages_published + 1').run();
    return res.json({
      success:     true,
      channel,
      audience,
      publishedAt: scheduledAt || new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/publish]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Legacy: plain simplify
app.post('/simplify', async (req, res) => {
  const { text, audience = 'management' } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const sections = await runTransform(text, audience, 'general');
    const finalOutput = Object.values(sections).join(' ');
    db.prepare(
      'INSERT INTO messages (original_text, simplified_text, audience, status, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(text, finalOutput, audience, 'Draft', new Date().toISOString());
    db.prepare('UPDATE analytics SET messages_generated = messages_generated + 1').run();
    return res.json({ final_output: finalOutput, audience, validation_passed: true });
  } catch (err) {
    console.error('[/simplify]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Legacy: Slack publish
app.post('/slack/publish', (req, res) => {
  const { message } = req.body;
  console.log('[/slack/publish] message (no webhook configured):', message?.slice(0, 60));
  db.prepare('UPDATE analytics SET messages_published = messages_published + 1').run();
  return res.json({ status: 'ok' });
});

// Messages history
app.get('/messages', (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  return res.json(rows);
});

// Templates
app.get('/templates', (req, res) => {
  const rows = db.prepare('SELECT * FROM templates').all();
  return res.json(rows);
});

// Approvals
app.get('/approvals', (req, res) => {
  const rows = db.prepare("SELECT * FROM messages WHERE status='Pending Approval' ORDER BY id DESC").all();
  return res.json(rows);
});

app.post('/approvals/:id/approve', (req, res) => {
  db.prepare("UPDATE messages SET status='Approved' WHERE id=?").run(req.params.id);
  return res.json({ status: 'ok' });
});

// Analytics
app.get('/analytics', (req, res) => {
  const row = db.prepare('SELECT * FROM analytics LIMIT 1').get();
  return res.json(row || { messages_generated: 0, messages_published: 0 });
});

// Settings
app.get('/settings', (req, res) => {
  return res.json({ theme: 'dark', notifications: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🤖 AI Communication Backend running on http://localhost:${PORT}`);
  console.log(`   USE_MOCK_AI = ${USE_MOCK} ${USE_MOCK ? '(mock responses — no API key needed)' : '(real AI via OpenRouter)'}`);
  console.log(`   Endpoints: /transform  /publish  /simplify  /messages  /templates  /analytics\n`);
});

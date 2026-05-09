/**
 * Step1_InputForm
 * First step of the 3-step wizard.
 * Collects: raw message, target audience, destination channel,
 *           tone customization, language, and shows AI Guidance Panel.
 *
 * Props:
 *   rawMessage        {string}      - The raw message text
 *   audience          {string}      - Selected audience key
 *   channel           {string}      - Selected channel name
 *   tone              {string}      - Selected tone key
 *   language          {string}      - Selected language code
 *   isLoading         {boolean}     - True while the API call is in-flight
 *   error             {string|null} - Error message to display
 *   onMessageChange   {fn(string)}  - Update rawMessage
 *   onAudienceChange  {fn(string)}  - Update audience
 *   onChannelChange   {fn(string)}  - Update channel
 *   onToneChange      {fn(string)}  - Update tone
 *   onLanguageChange  {fn(string)}  - Update language
 *   onTransform       {fn()}        - Trigger AI transformation
 */

/* ─────────────────────────────────────────────
   Field configuration
───────────────────────────────────────────── */
const AUDIENCE_OPTIONS = [
  { value: 'frontline',  label: '👷 Frontline Workers'  },
  { value: 'office',     label: '🏢 Office Employees'   },
  { value: 'it',         label: '💻 IT Staff'            },
  { value: 'executives', label: '🎯 Executives'          },
  { value: 'partners',   label: '🤝 External Partners'  },
];

const CHANNEL_OPTIONS = [
  { value: 'Viva Engage',     label: ' Viva Engage'     },
  { value: 'Microsoft Teams', label: ' Microsoft Teams' },
  { value: 'Slack',           label: '#  Slack'            },
  { value: 'Email',           label: '✉️  Email'           },
  { value: 'SMS',             label: '📱 SMS'              },
];

const TONE_OPTIONS = [
  { value: 'Professional', label: '💼 Professional', hint: 'Formal and precise'   },
  { value: 'Calm',         label: '😌 Calm',         hint: 'Steady and composed'  },
  { value: 'Reassuring',   label: '🤝 Reassuring',   hint: 'Supportive and clear' },
  { value: 'Executive',    label: '🎯 Executive',    hint: 'Concise, high-level'  },
  { value: 'Urgent',       label: '⚡ Urgent',        hint: 'Action-focused'       },
  { value: 'Friendly',     label: '😊 Friendly',     hint: 'Warm and approachable'},
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: '🇬🇧 English'  },
  { value: 'sv', label: '🇸🇪 Swedish'  },
  { value: 'de', label: '🇩🇪 German'   },
  { value: 'fr', label: '🇫🇷 French'   },
  { value: 'es', label: '🇪🇸 Spanish'  },
];

/* ─────────────────────────────────────────────
   AI Guidance rules per audience
───────────────────────────────────────────── */
const AI_GUIDANCE = {
  frontline: {
    icon: '👷',
    title: 'Frontline Workers',
    color: 'orange',
    rules: [
      'Use plain, simple language — no jargon or acronyms.',
      'Focus on: what it means for their daily work.',
      'Keep action steps short and numbered.',
      'Avoid technical details; lead with employee impact.',
    ],
  },
  office: {
    icon: '🏢',
    title: 'Office Employees',
    color: 'blue',
    rules: [
      'Use professional but accessible language.',
      'Explain business impact and timeline.',
      'Highlight any required actions clearly.',
      'Include a help/contact reference.',
    ],
  },
  it: {
    icon: '💻',
    title: 'IT Staff',
    color: 'purple',
    rules: [
      'Technical terminology is acceptable.',
      'Include root cause and resolution details.',
      'Provide system, service, and timeline specifics.',
      'Action items should reference ticket IDs or runbooks.',
    ],
  },
  executives: {
    icon: '🎯',
    title: 'Executives',
    color: 'green',
    rules: [
      'Lead with business impact and bottom line.',
      'Keep to 3–5 bullet points maximum.',
      'Avoid operational details — stay strategic.',
      'End with a clear decision or action request.',
    ],
  },
  partners: {
    icon: '🤝',
    title: 'External Partners',
    color: 'blue',
    rules: [
      'Use formal, professional tone.',
      'Avoid internal jargon and system names.',
      'Focus on SLA impacts and customer-facing effects.',
      'Include escalation contact information.',
    ],
  },
};

/* ─────────────────────────────────────────────
   AI Guidance Panel sub-component
───────────────────────────────────────────── */
function AIGuidancePanel({ audience }) {
  const guidance = AI_GUIDANCE[audience] || AI_GUIDANCE.frontline;
  return (
    <div className={`ai-guidance-panel ai-guidance--${guidance.color}`}>
      <div className="ai-guidance-header">
        <span className="ai-guidance-icon">{guidance.icon}</span>
        <div>
          <div className="ai-guidance-title">AI Guidance</div>
          <div className="ai-guidance-audience">{guidance.title}</div>
        </div>
      </div>
      <ul className="ai-guidance-rules">
        {guidance.rules.map((rule, i) => (
          <li key={i} className="ai-guidance-rule">
            <span className="ai-guidance-bullet">→</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const CHAR_LIMIT = 2000;
const CHAR_WARN  = 1500;

export default function Step1_InputForm({
  rawMessage,
  audience,
  channel,
  tone,
  language,
  isLoading,
  error,
  onMessageChange,
  onAudienceChange,
  onChannelChange,
  onToneChange,
  onLanguageChange,
  onTransform,
}) {
  const charCount = rawMessage.length;
  const overLimit = charCount > CHAR_LIMIT;
  const nearLimit = charCount > CHAR_WARN;
  const canSubmit = rawMessage.trim().length > 0 && !overLimit && !isLoading;

  return (
    <div className="card-body step1-layout">

      {/* ── Left: Input form ── */}
      <div className="step1-form">

        {/* Page heading */}
        <h2 className="step1-card-title">Compose Your Message</h2>
        <p className="step1-card-subtitle">
          Paste your technical message below. AI will transform it into audience-friendly communication.
        </p>

        {/* Error */}
        {error && <div className="error-box"> {error}</div>}

        {/* Raw message textarea */}
        <div className="form-group">
          <label htmlFor="raw-message">
            Raw Message
            <span
              style={{
                float: 'right',
                fontWeight: 400,
                color: overLimit
                  ? 'var(--color-error)'
                  : nearLimit
                  ? 'var(--color-warning)'
                  : 'var(--gray-400)',
              }}
            >
              {charCount} / {CHAR_LIMIT}
            </span>
          </label>
          <textarea
            id="raw-message"
            rows={7}
            placeholder="e.g. The Kubernetes cluster ingress controller experienced a TLS certificate rotation failure causing 503 errors on prod-eu-west for ~12 minutes from 09:14–09:26 UTC. Root cause was an expired cert in the cert-manager secret. Manually rotated and redeployed ingress pod to restore service."
            value={rawMessage}
            onChange={e => onMessageChange(e.target.value)}
            disabled={isLoading}
            maxLength={CHAR_LIMIT + 50}
            aria-label="Raw message input"
          />
        </div>

        {/* Audience + Channel row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="audience-select">Target Audience</label>
            <select
              id="audience-select"
              value={audience}
              onChange={e => onAudienceChange(e.target.value)}
              disabled={isLoading}
            >
              {AUDIENCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="channel-select">Destination Channel</label>
            <select
              id="channel-select"
              value={channel}
              onChange={e => onChannelChange(e.target.value)}
              disabled={isLoading}
            >
              {CHANNEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tone + Language row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="language-select">Language</label>
            <select
              id="language-select"
              value={language}
              onChange={e => onLanguageChange(e.target.value)}
              disabled={isLoading}
            >
              {LANGUAGE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Placeholder to keep grid alignment */}
          <div className="form-group" />
        </div>

        {/* Tone Customization */}
        <div className="form-group" style={{ marginTop: 'var(--space-1)' }}>
          <label>Tone</label>
          <div className="tone-pill-group">
            {TONE_OPTIONS.map(t => (
              <button
                key={t.value}
                type="button"
                className={`tone-pill ${tone === t.value ? 'tone-pill--active' : ''}`}
                onClick={() => onToneChange(t.value)}
                disabled={isLoading}
                title={t.hint}
                aria-pressed={tone === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary btn-full"
          onClick={onTransform}
          disabled={!canSubmit}
          type="button"
          style={{ marginTop: 'var(--space-6)' }}
        >
          {isLoading ? (
            <><span className="spinner" /> Transforming with AI…</>
          ) : (
            <> Transform with AI →</>
          )}
        </button>

      </div>

      {/* ── Right: AI Guidance Panel ── */}
      <div className="step1-sidebar">
        <AIGuidancePanel audience={audience} />

        {/* Active selections summary */}
        <div className="step1-config-summary">
          <div className="step1-config-title">Current Configuration</div>
          <div className="step1-config-row">
            <span className="step1-config-key">Audience</span>
            <span className="step1-config-val">
              {AUDIENCE_OPTIONS.find(a => a.value === audience)?.label || audience}
            </span>
          </div>
          <div className="step1-config-row">
            <span className="step1-config-key">Channel</span>
            <span className="step1-config-val">{channel}</span>
          </div>
          <div className="step1-config-row">
            <span className="step1-config-key">Tone</span>
            <span className="step1-config-val">{tone}</span>
          </div>
          <div className="step1-config-row">
            <span className="step1-config-key">Language</span>
            <span className="step1-config-val">
              {LANGUAGE_OPTIONS.find(l => l.value === language)?.label || language}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

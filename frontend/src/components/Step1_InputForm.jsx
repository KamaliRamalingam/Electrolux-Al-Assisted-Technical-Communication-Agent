/**
 * Step1_InputForm
 * First step of the 3-step wizard.
 * Collects the raw message, target audience, and destination channel.
 *
 * Props:
 *   rawMessage        {string}   - The raw message text
 *   audience          {string}   - Selected audience key
 *   channel           {string}   - Selected channel name
 *   isLoading         {boolean}  - True while the API call is in-flight
 *   error             {string|null} - Error message to display
 *   onMessageChange   {fn(string)} - Update rawMessage
 *   onAudienceChange  {fn(string)} - Update audience
 *   onChannelChange   {fn(string)} - Update channel
 *   onTransform       {fn()}      - Trigger AI transformation
 */

const AUDIENCE_OPTIONS = [
  { value: 'frontline', label: '👷 Frontline Workers' },
  { value: 'office',    label: '🏢 Office Employees'  },
  { value: 'it',        label: '💻 IT Staff'           },
];

const CHANNEL_OPTIONS = [
  { value: 'Viva Engage',     label: '🔥 Viva Engage'      },
  { value: 'Microsoft Teams', label: '💬 Microsoft Teams'  },
  { value: 'Slack',           label: '#  Slack'             },
];

const CHAR_LIMIT  = 2000;
const CHAR_WARN   = 1500;

export default function Step1_InputForm({
  rawMessage,
  audience,
  channel,
  isLoading,
  error,
  onMessageChange,
  onAudienceChange,
  onChannelChange,
  onTransform,
}) {
  const charCount  = rawMessage.length;
  const overLimit  = charCount > CHAR_LIMIT;
  const nearLimit  = charCount > CHAR_WARN;
  const canSubmit  = rawMessage.trim().length > 0 && !overLimit && !isLoading;

  return (
    <div className="card-body">

      {/* Page heading */}
      <h2 className="section-title" style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>
        Compose Your Message
      </h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-5)', marginTop: 0 }}>
        Enter your raw technical message below. Our AI will transform it into a
        clear, audience-appropriate communication.
      </p>

      {/* Error */}
      {error && <div className="error-box">⚠️ {error}</div>}

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

      {/* Submit */}
      <button
        className="btn btn-primary btn-full"
        onClick={onTransform}
        disabled={!canSubmit}
        type="button"
      >
        {isLoading ? (
          <><span className="spinner" /> Transforming with AI…</>
        ) : (
          '✨ Transform with AI →'
        )}
      </button>

    </div>
  );
}

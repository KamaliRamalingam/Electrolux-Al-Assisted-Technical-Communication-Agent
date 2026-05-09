/**
 * SuccessBanner
 * Shown after a message is successfully published (Step 3).
 *
 * Props:
 *   channel      {string}  - Channel the message was published to
 *   audience     {string}  - Audience key (frontline | office | it)
 *   publishedAt  {string}  - ISO date string (or null for immediate)
 *   onReset      {fn()}    - Called when user clicks "Send Another Message"
 */

const AUDIENCE_LABELS = {
  frontline: 'Frontline Workers',
  office:    'Office Employees',
  it:        'IT Staff',
};

export default function SuccessBanner({ channel, audience, publishedAt, onReset }) {
  const audienceLabel = AUDIENCE_LABELS[audience] || audience;

  let publishLabel = 'Immediately';
  if (publishedAt) {
    try {
      const d = new Date(publishedAt);
      publishLabel = d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      publishLabel = publishedAt;
    }
  }

  return (
    <div className="success-banner">
      <div className="success-icon">🎉</div>

      <h2>Message Published Successfully!</h2>

      <div className="success-details">
        <div className="success-detail-row">
          <span className="success-detail-label">Channel</span>
          <span className="success-detail-value">{channel}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Audience</span>
          <span className="success-detail-value">{audienceLabel}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Published</span>
          <span className="success-detail-value">{publishLabel}</span>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={onReset}
        type="button"
        style={{ marginTop: 'var(--space-4)' }}
      >
        ✨ Send Another Message
      </button>
    </div>
  );
}

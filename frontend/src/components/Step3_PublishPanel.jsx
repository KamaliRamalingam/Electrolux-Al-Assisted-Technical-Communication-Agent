import { useState } from 'react';
import SuccessBanner from './SuccessBanner';

const CHANNELS = [
  { value: 'Viva Engage',     icon: '🔥', skin: 'viva'  },
  { value: 'Microsoft Teams', icon: '💬', skin: 'teams' },
  { value: 'Slack',           icon: '#',  skin: 'slack' }
];

const CHANNEL_LIMITS = {
  'Viva Engage':     4096,
  'Microsoft Teams': 28000,
  'Slack':           40000
};

const CHANNEL_SKIN = {
  'Viva Engage':     'viva',
  'Microsoft Teams': 'teams',
  'Slack':           'slack'
};

const SECTIONS = [
  { key: 'what_is_happening',     label: '📢 What Is Happening'     },
  { key: 'what_it_means_for_you', label: '👤 What It Means for You' },
  { key: 'what_you_need_to_do',   label: '✅ What You Need to Do'    },
  { key: 'help',                  label: '💬 Need Help?'             }
];

const CHANNEL_DISPLAY_NAMES = {
  'Viva Engage':     'Viva Engage',
  'Microsoft Teams': 'Microsoft Teams',
  'Slack':           'Slack'
};

/**
 * Step3_PublishPanel
 * Channel selector + channel-skinned message preview + optional scheduler + Publish button.
 * After successful publish, renders SuccessBanner.
 */
export default function Step3_PublishPanel({
  transformedMessage,
  audience,
  defaultChannel,
  isLoading,
  publishStatus,
  publishResult,
  error,
  onPublish,
  onBack,
  onReset
}) {
  const [channel, setChannel]         = useState(defaultChannel || 'Viva Engage');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [previewCopied, setPreviewCopied] = useState(false);

  const skin = CHANNEL_SKIN[channel] || 'viva';
  const charLimit = CHANNEL_LIMITS[channel] || 4096;

  // Build the full preview text for char count + copy
  const fullText = SECTIONS
    .map(s => `${s.label}\n${transformedMessage[s.key] || ''}`)
    .join('\n\n');
  const charCount  = fullText.length;
  const overLimit  = charCount > charLimit;

  function handlePublish() {
    let scheduledAt;
    if (scheduleDate && scheduleTime) {
      scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }
    onPublish(channel, scheduledAt);
  }

  function handleCopyPreview() {
    navigator.clipboard.writeText(fullText).then(() => {
      setPreviewCopied(true);
      setTimeout(() => setPreviewCopied(false), 2000);
    });
  }

  // Show success state
  if (publishStatus === 'success' && publishResult) {
    return (
      <SuccessBanner
        channel={publishResult.channel}
        audience={audience}
        publishedAt={publishResult.publishedAt}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="card-body">

      {/* Channel selector */}
      <p className="section-title">Channel</p>
      <div className="channel-selector">
        {CHANNELS.map(({ value, icon }) => (
          <label
            key={value}
            className={`channel-option ${channel === value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="channel"
              value={value}
              checked={channel === value}
              onChange={() => setChannel(value)}
            />
            {icon} {value}
          </label>
        ))}
      </div>

      {/* Channel-skinned message preview */}
      <p className="section-title" style={{ marginTop: 24 }}>Message Preview</p>
      <div className={`preview-wrapper preview-skin--${skin}`}>
        {/* Toolbar bar with channel branding + copy button */}
        <div className="preview-toolbar">
          <span>
            {channel === 'Slack'           && '# general · Slack preview'}
            {channel === 'Microsoft Teams' && '💬 General · Teams preview'}
            {channel === 'Viva Engage'     && '🔥 Company Feed · Viva Engage preview'}
          </span>
          <button
            type="button"
            className={`preview-copy-btn ${previewCopied ? 'copied' : ''}`}
            onClick={handleCopyPreview}
          >
            {previewCopied ? '✓ Copied' : '⎘ Copy all'}
          </button>
        </div>

        {/* Preview body */}
        <div className="preview-body">
          {SECTIONS.map(({ key, label }) => (
            <div key={key} className="preview-section-block">
              <div className="preview-section-heading">{label}</div>
              <div className="preview-section-text">{transformedMessage[key]}</div>
            </div>
          ))}
        </div>

        {/* Character count footer */}
        <div className={`preview-char-count ${overLimit ? 'over-limit' : ''}`}>
          {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters
          {overLimit && ' · ⚠️ Exceeds channel limit'}
        </div>
      </div>

      {/* Schedule picker */}
      <p className="section-title" style={{ marginTop: 24 }}>Schedule (optional)</p>
      <div className="schedule-picker">
        <input
          type="date"
          value={scheduleDate}
          onChange={e => setScheduleDate(e.target.value)}
          disabled={isLoading}
          aria-label="Schedule date"
        />
        <input
          type="time"
          value={scheduleTime}
          onChange={e => setScheduleTime(e.target.value)}
          disabled={isLoading}
          aria-label="Schedule time"
        />
      </div>
      <p className="schedule-hint">Leave blank to publish immediately.</p>

      {error && <div className="error-box" style={{ marginTop: 16 }}>⚠️ {error}</div>}

      {/* Action buttons */}
      <div className="btn-row" style={{ marginTop: 24 }}>
        <button
          className="btn btn-secondary"
          onClick={onBack}
          disabled={isLoading}
          type="button"
        >
          ← Back to Review
        </button>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={handlePublish}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <><span className="spinner" /> Publishing…</>
          ) : (
            '🚀 Publish Now'
          )}
        </button>
      </div>
    </div>
  );
}

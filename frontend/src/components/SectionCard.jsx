import { useState } from 'react';

/**
 * Per-section configuration: accent colour class, icon, label.
 */
const SECTION_CONFIG = {
  what_is_happening:     { accent: 'blue',   icon: '', label: ' What Is Happening'     },
  what_it_means_for_you: { accent: 'purple', icon: '👤', label: '👤 What It Means for You' },
  what_you_need_to_do:   { accent: 'green',  icon: '', label: ' What You Need to Do'    },
  help:                  { accent: 'orange', icon: '', label: ' Need Help?'             }
};

/**
 * SectionCard — Rich semantic AI message card
 *
 * Props:
 *   sectionKey  {string}   - One of the 4 section keys (used to pick accent + icon)
 *   label       {string}   - Fallback label if sectionKey not found
 *   value       {string}   - Current text content
 *   editMode    {boolean}  - Whether the card is in edit mode
 *   onChange    {function} - Called with new string value when textarea changes
 */
export default function SectionCard({ sectionKey, label, value, editMode, onChange }) {
  const [copied, setCopied] = useState(false);

  const cfg    = SECTION_CONFIG[sectionKey] || { accent: 'blue', icon: '', label };
  const words  = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const warnAt = 60;

  function handleCopy() {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <article className={`section-card section-card--${cfg.accent}`}>
      {/* Header */}
      <div className="section-card-header">
        <div className="section-card-icon" aria-hidden="true">
          {cfg.icon}
        </div>
        <span className="section-card-label">{cfg.label || label}</span>
        <div className="section-card-actions">
          <button
            className={`section-copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy section text"
            type="button"
          >
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="section-card-body">
        {editMode ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={4}
            aria-label={cfg.label || label}
            placeholder={`Enter ${cfg.label || label} content…`}
          />
        ) : (
          <p>{value}</p>
        )}
      </div>

      {/* Footer — word count */}
      <div className="section-card-footer">
        <span className={`word-count ${words > warnAt ? 'warn' : ''}`}>
          {words} {words === 1 ? 'word' : 'words'}
          {words > warnAt && ' · consider shortening'}
        </span>
      </div>
    </article>
  );
}

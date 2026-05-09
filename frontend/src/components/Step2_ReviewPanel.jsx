import { useState } from 'react';
import SectionCard from './SectionCard';

const SECTIONS = [
  { key: 'what_is_happening'     },
  { key: 'what_it_means_for_you' },
  { key: 'what_you_need_to_do'   },
  { key: 'help'                  }
];

const AUDIENCE_LABELS = {
  frontline: 'Frontline Workers',
  office:    'Office Employees',
  it:        'IT Staff'
};

/**
 * Step2_ReviewPanel
 * Displays the AI-generated 4-section message using rich SectionCards.
 * The user can edit, regenerate, or approve.
 */
export default function Step2_ReviewPanel({
  transformedMessage,
  audience,
  isLoading,
  error,
  onMessageChange,
  onRegenerate,
  onApprove
}) {
  const [editMode, setEditMode] = useState(false);

  function handleSectionChange(key, value) {
    onMessageChange({ ...transformedMessage, [key]: value });
  }

  const audienceLabel = AUDIENCE_LABELS[audience] || audience;

  return (
    <div className="card-body">
      <div className="review-banner">
         Message transformed for: <strong style={{ marginLeft: 4 }}>{audienceLabel}</strong>
      </div>

      {error && <div className="error-box"> {error}</div>}

      {SECTIONS.map(({ key }) => (
        <SectionCard
          key={key}
          sectionKey={key}
          value={transformedMessage[key] || ''}
          editMode={editMode}
          onChange={value => handleSectionChange(key, value)}
        />
      ))}

      <div className="btn-row">
        <button
          className="btn btn-secondary"
          onClick={() => setEditMode(prev => !prev)}
          type="button"
        >
          {editMode ? '💾 Save Edits' : ' Edit'}
        </button>

        <button
          className="btn btn-outline"
          onClick={onRegenerate}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <><span className="spinner spinner--dark" /> Regenerating…</>
          ) : (
            '🔄 Regenerate'
          )}
        </button>

        <button
          className="btn btn-success"
          style={{ marginLeft: 'auto' }}
          onClick={onApprove}
          disabled={isLoading}
          type="button"
        >
           Approve &amp; Continue →
        </button>
      </div>
    </div>
  );
}

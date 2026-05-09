import { useState } from 'react';

/* ── Seed data ────────────────────────────────────────────────────── */
const INITIAL_TEMPLATES = [
  {
    id: 1,
    category: 'Incident Reports',
    name: 'Critical System Outage',
    audience: 'All Employees',
    channels: ['Viva Engage', 'Microsoft Teams', 'Slack'],
    usage: 47,
    updated: '2026-04-28',
    archived: false,
    ai_suggested: true,
    content:
      'A critical system outage has been identified affecting [SYSTEM_NAME]. Our engineers are actively working to restore service. Expected resolution time: [ETA]. Updates will be provided every [INTERVAL].',
    variables: ['SYSTEM_NAME', 'ETA', 'INTERVAL'],
  },
  {
    id: 2,
    category: 'Incident Reports',
    name: 'Partial Service Degradation',
    audience: 'IT Staff',
    channels: ['Microsoft Teams', 'Slack'],
    usage: 31,
    updated: '2026-05-01',
    archived: false,
    ai_suggested: false,
    content:
      'We are experiencing partial degradation on [SERVICE]. Performance may be impacted for [AFFECTED_USERS]. The on-call team has been notified. Reference ticket: [TICKET_ID].',
    variables: ['SERVICE', 'AFFECTED_USERS', 'TICKET_ID'],
  },
  {
    id: 3,
    category: 'Maintenance Notices',
    name: 'Planned Maintenance Window',
    audience: 'Office Employees',
    channels: ['Viva Engage', 'Email'],
    usage: 62,
    updated: '2026-04-15',
    archived: false,
    ai_suggested: true,
    content:
      'Scheduled maintenance for [SYSTEM] will occur on [DATE] from [START_TIME] to [END_TIME] [TIMEZONE]. During this window, [AFFECTED_SERVICES] will be unavailable.',
    variables: ['SYSTEM', 'DATE', 'START_TIME', 'END_TIME', 'TIMEZONE', 'AFFECTED_SERVICES'],
  },
  {
    id: 4,
    category: 'Security Alerts',
    name: 'Phishing Campaign Warning',
    audience: 'All Employees',
    channels: ['Viva Engage', 'Email'],
    usage: 19,
    updated: '2026-05-03',
    archived: false,
    ai_suggested: true,
    content:
      'Security Alert: We have detected a phishing campaign targeting Electrolux employees. Do not click links in emails from [SENDER_DOMAIN]. Report suspicious emails to [SECURITY_EMAIL].',
    variables: ['SENDER_DOMAIN', 'SECURITY_EMAIL'],
  },
  {
    id: 5,
    category: 'Security Alerts',
    name: 'Mandatory Password Reset',
    audience: 'All Employees',
    channels: ['Viva Engage', 'Microsoft Teams', 'Email'],
    usage: 38,
    updated: '2026-04-22',
    archived: false,
    ai_suggested: false,
    content:
      'Action Required: All employees must reset their corporate password by [DEADLINE]. Please visit [RESET_URL] to complete this action. Contact [HELPDESK] for assistance.',
    variables: ['DEADLINE', 'RESET_URL', 'HELPDESK'],
  },
  {
    id: 6,
    category: 'Service Restorations',
    name: 'Service Restored Notification',
    audience: 'All Employees',
    channels: ['Viva Engage', 'Microsoft Teams', 'Slack'],
    usage: 44,
    updated: '2026-05-05',
    archived: false,
    ai_suggested: false,
    content:
      '[SERVICE] has been fully restored as of [RESTORATION_TIME]. Thank you for your patience. Root cause analysis will be shared within [RCA_TIMEFRAME]. Incident reference: [INCIDENT_ID].',
    variables: ['SERVICE', 'RESTORATION_TIME', 'RCA_TIMEFRAME', 'INCIDENT_ID'],
  },
  {
    id: 7,
    category: 'Executive Updates',
    name: 'Quarterly Business Update',
    audience: 'Executives',
    channels: ['Viva Engage', 'Email'],
    usage: 12,
    updated: '2026-03-31',
    archived: false,
    ai_suggested: true,
    content:
      'Q[QUARTER] Business Update: [KEY_HIGHLIGHT]. This quarter we achieved [METRIC_1] and [METRIC_2]. Looking ahead to Q[NEXT_QUARTER], our focus areas include [PRIORITIES].',
    variables: ['QUARTER', 'KEY_HIGHLIGHT', 'METRIC_1', 'METRIC_2', 'NEXT_QUARTER', 'PRIORITIES'],
  },
  {
    id: 8,
    category: 'Executive Updates',
    name: 'Leadership Announcement',
    audience: 'All Employees',
    channels: ['Viva Engage', 'Email'],
    usage: 8,
    updated: '2026-04-10',
    archived: false,
    ai_suggested: false,
    content:
      'We are pleased to announce that [PERSON_NAME] has been appointed as [ROLE] effective [START_DATE]. [PERSON_NAME] brings [EXPERIENCE] to this role and will be leading [TEAM/AREA].',
    variables: ['PERSON_NAME', 'ROLE', 'START_DATE', 'EXPERIENCE', 'TEAM/AREA'],
  },
];

const CATEGORIES = [
  'All',
  'Incident Reports',
  'Maintenance Notices',
  'Security Alerts',
  'Service Restorations',
  'Executive Updates',
];

const CATEGORY_ICONS = {
  'All':                   '',
  'Incident Reports':      '🚨',
  'Maintenance Notices':   '',
  'Security Alerts':       '',
  'Service Restorations':  '',
  'Executive Updates':     '',
};

/* ── TemplateEditorDrawer ─────────────────────────────────────────── */
function TemplateEditorDrawer({ template, onClose, onSave }) {
  const [name,     setName]     = useState(template?.name     || '');
  const [audience, setAudience] = useState(template?.audience || 'All Employees');
  const [category, setCategory] = useState(template?.category || 'Incident Reports');
  const [content,  setContent]  = useState(template?.content  || '');

  function handleSave() {
    if (!name.trim() || !content.trim()) return;
    onSave({ name: name.trim(), audience, category, content: content.trim() });
  }

  // Detect [VARIABLE] placeholders in content
  const detectedVars = [...new Set((content.match(/\[([A-Z_/]+)\]/g) || []))];

  return (
    <div className="template-drawer-overlay" onClick={onClose}>
      <div className="template-drawer" onClick={e => e.stopPropagation()}>
        <div className="template-drawer-header">
          <h3 className="template-drawer-title">
            {template?.id ? 'Edit Template' : 'New Template'}
          </h3>
          <button className="template-drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="template-drawer-body">
          <div className="tpl-field">
            <label className="tpl-label">Template Name</label>
            <input
              className="tpl-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Critical System Outage"
            />
          </div>

          <div className="tpl-row">
            <div className="tpl-field">
              <label className="tpl-label">Category</label>
              <select className="tpl-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="tpl-field">
              <label className="tpl-label">Target Audience</label>
              <select className="tpl-select" value={audience} onChange={e => setAudience(e.target.value)}>
                {['All Employees', 'Frontline Workers', 'Office Employees', 'IT Staff', 'Executives', 'External Partners'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tpl-field">
            <label className="tpl-label">
              Template Content
              <span className="tpl-label-hint"> — use [VARIABLE_NAME] for dynamic placeholders</span>
            </label>
            <textarea
              className="tpl-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              placeholder="Write your template here. Use [PLACEHOLDER] for dynamic fields."
            />
          </div>

          {detectedVars.length > 0 && (
            <div className="tpl-variables-preview">
              <span className="tpl-variables-label">Detected Variables:</span>
              {detectedVars.map(v => (
                <span key={v} className="tpl-variable-chip">{v}</span>
              ))}
            </div>
          )}
        </div>

        <div className="template-drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
          >
            {template?.id ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── UseTemplateModal ─────────────────────────────────────────────── */
function UseTemplateModal({ template, onClose, onUse }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries((template.variables || []).map(v => [v, '']))
  );

  function buildFilled() {
    let text = template.content;
    Object.entries(values).forEach(([k, v]) => {
      text = text.replaceAll(`[${k}]`, v || `[${k}]`);
    });
    return text;
  }

  return (
    <div className="template-drawer-overlay" onClick={onClose}>
      <div className="template-drawer template-drawer--use" onClick={e => e.stopPropagation()}>
        <div className="template-drawer-header">
          <h3 className="template-drawer-title">Use Template — {template.name}</h3>
          <button className="template-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="template-drawer-body">
          {template.variables?.length > 0 ? (
            <>
              <p className="tpl-use-hint">Fill in the variables to personalise this template:</p>
              {template.variables.map(v => (
                <div key={v} className="tpl-field">
                  <label className="tpl-label">{v.replace(/_/g, ' ')}</label>
                  <input
                    className="tpl-input"
                    placeholder={`Enter ${v}`}
                    value={values[v] || ''}
                    onChange={e => setValues(prev => ({ ...prev, [v]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="tpl-field" style={{ marginTop: 16 }}>
                <label className="tpl-label">Preview</label>
                <div className="tpl-filled-preview">{buildFilled()}</div>
              </div>
            </>
          ) : (
            <div className="tpl-filled-preview">{template.content}</div>
          )}
        </div>

        <div className="template-drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onUse(buildFilled())}>
             Send to AI Agent
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── TemplateCard ─────────────────────────────────────────────────── */
function TemplateCard({ template, onUse, onEdit, onDuplicate, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`tpl-card ${template.archived ? 'tpl-card--archived' : ''}`}>
      {template.ai_suggested && (
        <div className="tpl-ai-badge">AI Suggested</div>
      )}

      <div className="tpl-card-header">
        <div>
          <span className="tpl-card-category">
            {CATEGORY_ICONS[template.category]} {template.category}
          </span>
          <h3 className="tpl-card-name">{template.name}</h3>
        </div>
        <div className="tpl-card-actions-wrap">
          <button
            className="btn btn-primary tpl-use-btn"
            onClick={() => onUse(template)}
            disabled={template.archived}
          >
            Use Template
          </button>
          <div className="tpl-more-wrap">
            <button
              className="tpl-more-btn"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="More actions"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="tpl-more-menu" onBlur={() => setMenuOpen(false)}>
                <button className="tpl-more-item" onClick={() => { onEdit(template); setMenuOpen(false); }}>
                   Edit Template
                </button>
                <button className="tpl-more-item" onClick={() => { onDuplicate(template); setMenuOpen(false); }}>
                  ⎘ Duplicate
                </button>
                <button
                  className="tpl-more-item tpl-more-item--danger"
                  onClick={() => { onArchive(template.id); setMenuOpen(false); }}
                >
                  {template.archived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="tpl-card-content">{template.content}</p>

      {template.variables?.length > 0 && (
        <div className="tpl-card-vars">
          {template.variables.map(v => (
            <span key={v} className="tpl-variable-chip tpl-variable-chip--sm">{v}</span>
          ))}
        </div>
      )}

      <div className="tpl-card-footer">
        <div className="tpl-card-meta">
          <span className="tpl-meta-item">👥 {template.audience}</span>
          <span className="tpl-meta-sep">·</span>
          <span className="tpl-meta-item">📡 {template.channels.join(', ')}</span>
        </div>
        <div className="tpl-card-stats">
          <span className="tpl-stat">🔁 Used {template.usage}×</span>
          <span className="tpl-meta-sep">·</span>
          <span className="tpl-stat">🕐 {template.updated}</span>
        </div>
      </div>
    </div>
  );
}

/* ── TemplatesPage ────────────────────────────────────────────────── */
export default function TemplatesPage({ onUseTemplate }) {
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [templates,       setTemplates]        = useState(INITIAL_TEMPLATES);
  const [search,          setSearch]           = useState('');
  const [showArchived,    setShowArchived]      = useState(false);
  const [editorOpen,      setEditorOpen]        = useState(false);
  const [editTarget,      setEditTarget]        = useState(null);
  const [useTarget,       setUseTarget]         = useState(null);
  const [successMsg,      setSuccessMsg]        = useState('');

  /* ── Filtering ── */
  const filtered = templates.filter(t => {
    if (!showArchived && t.archived) return false;
    if (activeCategory !== 'All' && t.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.audience.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ── Category counts ── */
  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All'
      ? templates.filter(t => !t.archived || showArchived).length
      : templates.filter(t => t.category === cat && (!t.archived || showArchived)).length;
    return acc;
  }, {});

  /* ── Handlers ── */
  function handleEdit(template) {
    setEditTarget(template);
    setEditorOpen(true);
  }

  function handleNew() {
    setEditTarget(null);
    setEditorOpen(true);
  }

  function handleSaveTemplate(data) {
    if (editTarget?.id) {
      setTemplates(prev => prev.map(t => t.id === editTarget.id ? { ...t, ...data, updated: new Date().toISOString().split('T')[0] } : t));
      flash('Template updated.');
    } else {
      const newId = Math.max(0, ...templates.map(t => t.id)) + 1;
      setTemplates(prev => [
        {
          id: newId,
          ...data,
          channels: ['Viva Engage'],
          usage: 0,
          updated: new Date().toISOString().split('T')[0],
          archived: false,
          ai_suggested: false,
          variables: [...new Set((data.content.match(/\[([A-Z_/]+)\]/g) || []))]
            .map(v => v.slice(1, -1)),
        },
        ...prev,
      ]);
      flash('Template created.');
    }
    setEditorOpen(false);
    setEditTarget(null);
  }

  function handleDuplicate(template) {
    const newId = Math.max(0, ...templates.map(t => t.id)) + 1;
    setTemplates(prev => [
      {
        ...template,
        id: newId,
        name: `${template.name} (Copy)`,
        usage: 0,
        updated: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
    flash('Template duplicated.');
  }

  function handleArchive(id) {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, archived: !t.archived } : t));
  }

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function handleUseTemplate(filledText) {
    setUseTarget(null);
    if (onUseTemplate) onUseTemplate(filledText);
    flash('Template loaded into AI Agent!');
  }

  /* ── AI suggestion highlight ── */
  const aiSuggested = templates.filter(t => t.ai_suggested && !t.archived);

  return (
    <div className="tpl-page">

      {/* ── Header ── */}
      <div className="tpl-page-header">
        <div>
          <h1 className="tpl-page-title">Message Templates</h1>
          <p className="tpl-page-subtitle">
            Save, share, and reuse approved message blueprints across your team.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          + New Template
        </button>
      </div>

      {/* ── Success flash ── */}
      {successMsg && (
        <div className="tpl-success-flash">✓ {successMsg}</div>
      )}

      {/* ── AI Suggested Banner ── */}
      {aiSuggested.length > 0 && activeCategory === 'All' && !search && (
        <div className="tpl-ai-banner">
          <span className="tpl-ai-banner-icon"></span>
          <div>
            <strong>AI Suggestions:</strong> Based on recent incident patterns, the AI recommends{' '}
            {aiSuggested.slice(0, 2).map(t => t.name).join(' and ')} templates for your next communication.
          </div>
        </div>
      )}

      {/* ── Search ── */}
      <div className="tpl-search-row">
        <div className="tpl-search-wrap">
          <span className="tpl-search-icon"></span>
          <input
            className="tpl-search-input"
            type="search"
            placeholder="Search templates by name, content or audience…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <label className="tpl-archived-toggle">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>

      {/* ── Category tabs ── */}
      <div className="tpl-tabs" role="tablist">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`tpl-tab ${activeCategory === cat ? 'tpl-tab--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_ICONS[cat]} {cat}
            {counts[cat] > 0 && (
              <span className="tpl-tab-count">{counts[cat]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Template Grid ── */}
      {filtered.length === 0 ? (
        <div className="tpl-empty">
          
          <p className="tpl-empty-text">No templates found.</p>
          <button className="btn btn-primary" onClick={handleNew}>Create your first template</button>
        </div>
      ) : (
        <div className="tpl-grid">
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={tpl => setUseTarget(tpl)}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* ── Editor Drawer ── */}
      {editorOpen && (
        <TemplateEditorDrawer
          template={editTarget}
          onClose={() => { setEditorOpen(false); setEditTarget(null); }}
          onSave={handleSaveTemplate}
        />
      )}

      {/* ── Use Template Modal ── */}
      {useTarget && (
        <UseTemplateModal
          template={useTarget}
          onClose={() => setUseTarget(null)}
          onUse={handleUseTemplate}
        />
      )}
    </div>
  );
}

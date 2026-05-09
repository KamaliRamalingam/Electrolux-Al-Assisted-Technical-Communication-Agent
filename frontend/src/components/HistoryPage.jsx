/**
 * HistoryPage — Screen 6
 * Enterprise communication archive with:
 *   • SearchToolbar     — full-text search + clear
 *   • FilterPanel       — audience / channel / status / date-range dropdowns
 *   • CommunicationsTable — sortable, paginated, 6-action row menu
 *   • VersionDrawer     — slide-in panel showing version history + diff + restore
 *   • ExportActions     — CSV export of the current filtered set
 *
 * Props:
 *   communications  {Array}    — from App.jsx (single source of truth)
 *   onEdit          {fn(comm)} — pre-fill wizard step 1 with this comm
 *   onDuplicate     {fn(comm)} — append a copy to communications[]
 *   onRepublish     {fn(comm)} — jump to wizard step 3 with this comm
 *   onDelete        {fn(id)}   — remove by id
 *   onNewCommunication {fn}    — start fresh wizard
 */

import { useState, useMemo, useRef } from 'react';

/* ─── constants ──────────────────────────────────────────────── */
const PAGE_SIZE = 10;

const ALL_AUDIENCES = [
  'Frontline Workers',
  'Office Employees',
  'IT Staff',
  'Executives',
  'External Partners',
];

const ALL_CHANNELS = [
  'Viva Engage',
  'Microsoft Teams',
  'Slack',
  'Email',
  'SMS',
];

const ALL_STATUSES = ['Draft', 'Published', 'Scheduled'];

const CHANNEL_ICON = {
  'Viva Engage':     '💜',
  'Microsoft Teams': '🟦',
  'Slack':           '🟥',
  'Email':           '📧',
  'SMS':             '💬',
};

const CHANNEL_CLASS = {
  'Viva Engage':     'channel-viva',
  'Microsoft Teams': 'channel-teams',
  'Slack':           'channel-slack',
  'Email':           'channel-email',
  'SMS':             'channel-sms',
};

/* ─── helpers ────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-SE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function confidenceClass(score) {
  if (score >= 90) return 'confidence-badge--high';
  if (score >= 80) return 'confidence-badge--medium';
  return 'confidence-badge--low';
}

function csvEscape(val) {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

/* ─── SearchToolbar ──────────────────────────────────────────── */
function SearchToolbar({ value, onChange }) {
  return (
    <div className="history-search-wrap">
      <span className="history-search-icon">🔍</span>
      <input
        className="history-search-input"
        type="text"
        placeholder="Search by title, audience, channel…"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Search communications"
      />
      {value && (
        <button
          className="history-search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >×</button>
      )}
    </div>
  );
}

/* ─── FilterPanel ────────────────────────────────────────────── */
function FilterPanel({ filters, onChange }) {
  function set(key, val) { onChange({ ...filters, [key]: val }); }

  const hasActiveFilter =
    filters.audience || filters.channel || filters.status ||
    filters.dateFrom || filters.dateTo;

  return (
    <div className="history-filter-panel">

      {/* Audience */}
      <div className="filter-group">
        <span className="filter-group-label">Audience</span>
        <select
          className="history-filter-select"
          value={filters.audience}
          onChange={e => set('audience', e.target.value)}
          aria-label="Filter by audience"
        >
          <option value="">All</option>
          {ALL_AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Channel */}
      <div className="filter-group">
        <span className="filter-group-label">Channel</span>
        <select
          className="history-filter-select"
          value={filters.channel}
          onChange={e => set('channel', e.target.value)}
          aria-label="Filter by channel"
        >
          <option value="">All</option>
          {ALL_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Status */}
      <div className="filter-group">
        <span className="filter-group-label">Status</span>
        <select
          className="history-filter-select"
          value={filters.status}
          onChange={e => set('status', e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Date Range */}
      <div className="filter-group">
        <span className="filter-group-label">Date Range</span>
        <div className="history-date-range">
          <input
            id="hist-from"
            type="date"
            className="history-date-input"
            value={filters.dateFrom}
            onChange={e => set('dateFrom', e.target.value)}
            aria-label="From date"
            title="From date"
          />
          <span className="history-date-sep">→</span>
          <input
            id="hist-to"
            type="date"
            className="history-date-input"
            value={filters.dateTo}
            onChange={e => set('dateTo', e.target.value)}
            aria-label="To date"
            title="To date"
          />
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilter && (
        <div className="filter-group filter-group--reset">
          <span className="filter-group-label">&nbsp;</span>
          <button
            className="history-clear-filters"
            onClick={() => onChange({ audience: '', channel: '', status: '', dateFrom: '', dateTo: '' })}
          >
            ✕ Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Action Menu (per row) ─────────────────────────────────── */
function ActionMenu({ comm, onView, onEdit, onDuplicate, onRepublish, onExportPDF, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  function handleBlur(e) {
    if (ref.current && !ref.current.contains(e.relatedTarget)) setOpen(false);
  }

  const actions = [
    { label: '👁️  View',       fn: () => { onView(comm);       setOpen(false); } },
    { label: '✏️  Edit',       fn: () => { onEdit(comm);       setOpen(false); } },
    { label: '📋  Duplicate',  fn: () => { onDuplicate(comm);  setOpen(false); } },
    { label: '🚀  Republish',  fn: () => { onRepublish(comm);  setOpen(false); } },
    { label: '📄  Export PDF', fn: () => { onExportPDF(comm);  setOpen(false); } },
    { label: '🗑️  Delete',     fn: () => { onDelete(comm.id);  setOpen(false); }, danger: true },
  ];

  return (
    <div className="action-menu-wrap" ref={ref} onBlur={handleBlur} tabIndex={-1}>
      <button
        className="action-trigger-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Row actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        ⋯
      </button>
      {open && (
        <div className="action-dropdown" role="menu">
          {actions.map(a => (
            <button
              key={a.label}
              className={`action-dropdown-item${a.danger ? ' action-dropdown-item--danger' : ''}`}
              onClick={a.fn}
              role="menuitem"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Version Drawer ─────────────────────────────────────────── */
function VersionDrawer({ comm, onRestore, onClose }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  if (!comm) return null;

  const versions = comm.versions || [
    {
      version: comm.version || 1,
      updatedAt: comm.updated,
      transformedMessage: comm.transformedMessage,
      aiSummary: comm.aiSummary,
    }
  ];

  const active = selectedVersion !== null
    ? versions.find(v => v.version === selectedVersion)
    : versions[versions.length - 1];

  const current = versions[versions.length - 1];

  function sectionText(tm, key) {
    return tm?.[key] || '—';
  }

  const SECTIONS = [
    { key: 'what_is_happening',   label: 'What is happening' },
    { key: 'what_you_need_to_do', label: 'What you need to do' },
    { key: 'why_it_matters',      label: 'Why it matters' },
    { key: 'reassurance_closing', label: 'Reassurance / Closing' },
  ];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="version-drawer" role="complementary" aria-label="Version history">
        <div className="drawer-header">
          <div className="drawer-header-left">
            <span className="drawer-icon">🕐</span>
            <div>
              <p className="drawer-title">Version History</p>
              <p className="drawer-subtitle">{comm.title}</p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">✕</button>
        </div>

        <div className="drawer-body">
          {/* Version timeline */}
          <div className="version-timeline-section">
            <p className="drawer-section-heading">Versions ({versions.length})</p>
            <div className="version-timeline">
              {[...versions].reverse().map(v => (
                <div
                  key={v.version}
                  className={`version-timeline-item${selectedVersion === v.version || (!selectedVersion && v.version === current.version) ? ' version-timeline-item--active' : ''}`}
                  onClick={() => setSelectedVersion(v.version)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedVersion(v.version)}
                >
                  <div className="version-badge">v{v.version}</div>
                  <div className="version-meta">
                    <span className="version-date">{fmtDate(v.updatedAt)}</span>
                    {v.version === current.version && (
                      <span className="version-current-tag">Current</span>
                    )}
                  </div>
                  {v.version !== current.version && (
                    <button
                      className="version-restore-btn"
                      onClick={e => { e.stopPropagation(); onRestore(comm.id, v); }}
                      title="Restore this version"
                    >
                      ↩ Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diff / content view */}
          {active && (
            <div className="version-diff-section">
              <p className="drawer-section-heading">
                Content — v{active.version}
                {active.version === current.version ? ' (current)' : ''}
              </p>
              {SECTIONS.map(s => {
                const activeText   = sectionText(active.transformedMessage, s.key);
                const currentText  = sectionText(current.transformedMessage, s.key);
                const isDiff = active.version !== current.version && activeText !== currentText;
                return (
                  <div key={s.key} className="diff-block">
                    <p className="diff-block-label">{s.label}</p>
                    {isDiff ? (
                      <>
                        <div className="diff-removed">{currentText}</div>
                        <div className="diff-arrow">↑ current  ↓ this version</div>
                        <div className="diff-added">{activeText}</div>
                      </>
                    ) : (
                      <div className="diff-same">{activeText}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ─── ExportActions ──────────────────────────────────────────── */
function exportCSV(rows) {
  const headers = ['Title', 'Audience', 'Channel', 'Status', 'AI Confidence', 'Tone', 'Version', 'Updated'];
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map(r => [
      r.title, r.audience, r.channel, r.status,
      r.confidence ? `${r.confidence}%` : '—',
      r.tone || '—',
      r.version || 1,
      fmtDate(r.updated),
    ].map(csvEscape).join(','))
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `communications-history-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── HistoryPage ────────────────────────────────────────────── */
export default function HistoryPage({
  communications = [],
  onEdit,
  onDuplicate,
  onRepublish,
  onDelete,
  onNewCommunication,
  onRestore,
}) {
  /* ── search / filter ── */
  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState({
    audience: '', channel: '', status: '', dateFrom: '', dateTo: '',
  });

  /* ── sort ── */
  const [sortKey, setSortKey] = useState('updated');
  const [sortDir, setSortDir] = useState('desc');

  /* ── pagination ── */
  const [page, setPage] = useState(1);

  /* ── drawer ── */
  const [drawerComm, setDrawerComm] = useState(null);

  /* ── delete confirm ── */
  const [pendingDelete, setPendingDelete] = useState(null);

  /* ── filtered + sorted data ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return communications.filter(c => {
      if (q && !c.title?.toLowerCase().includes(q) &&
               !c.audience?.toLowerCase().includes(q) &&
               !c.channel?.toLowerCase().includes(q)) return false;
      if (filters.audience && c.audience !== filters.audience) return false;
      if (filters.channel  && c.channel  !== filters.channel)  return false;
      if (filters.status   && c.status   !== filters.status)   return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        const updated = new Date(c.updated).getTime();
        if (updated < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime() + 86400000; // inclusive
        const updated = new Date(c.updated).getTime();
        if (updated > to) return false;
      }
      return true;
    });
  }, [communications, search, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey] ?? '';
      let bv = b[sortKey] ?? '';
      if (sortKey === 'updated' || sortKey === 'publishedAt') {
        av = new Date(av).getTime() || 0;
        bv = new Date(bv).getTime() || 0;
      } else if (sortKey === 'confidence') {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 :  1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function sortIcon(key) {
    if (sortKey !== key) return <span className="sort-icon sort-icon--inactive">⇅</span>;
    return <span className="sort-icon sort-icon--active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  /* PDF export for a single comm */
  function handleExportPDF(comm) {
    const w = window.open('', '_blank');
    if (!w) return;
    const tm = comm.transformedMessage || {};
    w.document.write(`
      <html><head><title>${comm.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
        h2 { font-size: 15px; color: #0f3460; margin: 20px 0 6px; }
        p  { line-height: 1.7; color: #333; font-size: 14px; }
        hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
      </style></head><body>
      <h1>${comm.title}</h1>
      <p class="meta">Audience: ${comm.audience} · Channel: ${comm.channel} · Status: ${comm.status} · Updated: ${fmtDate(comm.updated)}</p>
      <hr/>
      ${Object.entries({
        'What is Happening':    tm.what_is_happening,
        'What You Need To Do':  tm.what_you_need_to_do,
        'Why It Matters':       tm.why_it_matters,
        'Reassurance / Closing':tm.reassurance_closing,
      }).filter(([,v]) => v).map(([k, v]) => `<h2>${k}</h2><p>${v}</p>`).join('')}
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  /* confirm/execute delete */
  function requestDelete(id) { setPendingDelete(id); }
  function confirmDelete() {
    if (pendingDelete !== null) onDelete?.(pendingDelete);
    setPendingDelete(null);
  }

  /* ── view handler ── */
  function handleView(comm) { setDrawerComm(comm); }

  /* ── render ── */
  return (
    <div className="history-page">

      {/* Page header */}
      <div className="history-header">
        <div className="history-header-left">
          <h1 className="history-title">Communication History</h1>
          <p className="history-subtitle">
            Archive of all AI-assisted communications — search, filter, version, and re-publish.
          </p>
        </div>
        <div className="history-header-right">
          <button
            className="btn btn-secondary"
            onClick={() => exportCSV(filtered)}
            title="Export current filtered list as CSV"
          >
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={onNewCommunication}>
            ✨ New Communication
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="history-toolbar">
        <SearchToolbar value={search} onChange={v => { setSearch(v); setPage(1); }} />
        <FilterPanel filters={filters} onChange={v => { setFilters(v); setPage(1); }} />
      </div>

      {/* Stats row */}
      <div className="history-stats-row">
        <span className="history-stats-item">
          <strong>{filtered.length}</strong> communication{filtered.length !== 1 ? 's' : ''} found
        </span>
        {filtered.length !== communications.length && (
          <span className="history-stats-item history-stats-filtered">
            (filtered from {communications.length} total)
          </span>
        )}
      </div>

      {/* Empty state */}
      {communications.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">📋</span>
          <h2 className="history-empty-title">No history yet</h2>
          <p className="history-empty-text">
            Once you create and publish communications they'll appear here for review, re-use, and export.
          </p>
          <button className="btn btn-primary" onClick={onNewCommunication}>
            ✨ Create Your First Communication
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">🔍</span>
          <h2 className="history-empty-title">No results match your filters</h2>
          <p className="history-empty-text">Try adjusting your search or clearing the filters.</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilters({ audience: '', channel: '', status: '', dateFrom: '', dateTo: '' }); }}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="history-card">
          {/* Table */}
          <div className="history-table-wrap">
            <table className="history-table" aria-label="Communications history">
              <thead>
                <tr>
                  <th className="sortable-col" onClick={() => toggleSort('title')}>
                    Title {sortIcon('title')}
                  </th>
                  <th className="sortable-col" onClick={() => toggleSort('audience')}>
                    Audience {sortIcon('audience')}
                  </th>
                  <th className="sortable-col" onClick={() => toggleSort('channel')}>
                    Channel {sortIcon('channel')}
                  </th>
                  <th className="sortable-col" onClick={() => toggleSort('status')}>
                    Status {sortIcon('status')}
                  </th>
                  <th className="sortable-col" onClick={() => toggleSort('confidence')}>
                    AI Confidence {sortIcon('confidence')}
                  </th>
                  <th className="sortable-col" onClick={() => toggleSort('version')}>
                    Version {sortIcon('version')}
                  </th>
                  <th className="sortable-col" onClick={() => toggleSort('updated')}>
                    Updated {sortIcon('updated')}
                  </th>
                  <th style={{ width: 48 }}></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(comm => (
                  <tr key={comm.id} className="history-table-row">
                    <td>
                      <button
                        className="history-title-link"
                        onClick={() => handleView(comm)}
                        title="View this communication"
                      >
                        {comm.title || '(Untitled)'}
                      </button>
                    </td>
                    <td>
                      <span className="audience-pill">{comm.audience}</span>
                    </td>
                    <td>
                      <span className={`channel-badge ${CHANNEL_CLASS[comm.channel] || ''}`}>
                        <span className="channel-badge-icon">{CHANNEL_ICON[comm.channel] || '📡'}</span>
                        {comm.channel}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        comm.status === 'Published' ? 'badge-published' :
                        comm.status === 'Scheduled' ? 'badge-scheduled' :
                        'badge-draft'
                      }`}>
                        {comm.status}
                      </span>
                    </td>
                    <td>
                      {comm.confidence ? (
                        <span className={`confidence-badge ${confidenceClass(comm.confidence)}`}>
                          🤖 {comm.confidence}%
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className="version-tag">v{comm.version || 1}</span>
                    </td>
                    <td>
                      <span className="updated-date">{fmtDate(comm.updated)}</span>
                    </td>
                    <td>
                      <ActionMenu
                        comm={comm}
                        onView={handleView}
                        onEdit={comm => onEdit?.(comm)}
                        onDuplicate={comm => onDuplicate?.(comm)}
                        onRepublish={comm => onRepublish?.(comm)}
                        onExportPDF={handleExportPDF}
                        onDelete={requestDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination">
            <span className="pagination-info">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                aria-label="First page"
              >«</button>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // window of 5 pages centered on current
                const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
                const pg = start + i;
                if (pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    className={`pagination-btn${safePage === pg ? ' pagination-btn--active' : ''}`}
                    onClick={() => setPage(pg)}
                  >{pg}</button>
                );
              })}
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
              >›</button>
              <button
                className="pagination-btn"
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                aria-label="Last page"
              >»</button>
            </div>
          </div>
        </div>
      )}

      {/* Version Drawer */}
      {drawerComm && (
        <VersionDrawer
          comm={drawerComm}
          onRestore={(id, v) => {
            onRestore?.(id, v);
            setDrawerComm(null);
          }}
          onClose={() => setDrawerComm(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {pendingDelete !== null && (
        <>
          <div className="drawer-overlay" onClick={() => setPendingDelete(null)} aria-hidden="true" />
          <div className="delete-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm delete">
            <span className="delete-modal-icon">🗑️</span>
            <h3 className="delete-modal-title">Delete Communication?</h3>
            <p className="delete-modal-text">
              This action cannot be undone. The communication and all its versions will be permanently removed.
            </p>
            <div className="delete-modal-actions">
              <button className="btn btn-secondary" onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className="btn" style={{ background: '#dc2626', color: '#fff' }} onClick={confirmDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

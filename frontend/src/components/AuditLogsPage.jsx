import { useState, useMemo } from 'react';

/* ── Seed data ────────────────────────────────────────────────────── */
const SEED_LOGS = [
  { id: 'ALG-001', user: 'k.ramalingam@electrolux.com', action: 'Message Generated',    timestamp: '2026-05-09T10:14:22Z', aiModel: 'gemini-1.5-pro', channel: 'Viva Engage',     compliance: 'Pass',    details: 'Frontline outage alert generated for SAP downtime incident.' },
  { id: 'ALG-002', user: 'k.ramalingam@electrolux.com', action: 'Message Published',     timestamp: '2026-05-09T10:22:05Z', aiModel: 'gemini-1.5-pro', channel: 'Viva Engage',     compliance: 'Pass',    details: 'Published to Viva Engage Company Feed.' },
  { id: 'ALG-003', user: 'j.lindqvist@electrolux.com',  action: 'Message Generated',    timestamp: '2026-05-09T09:45:11Z', aiModel: 'gemini-1.5-pro', channel: 'Microsoft Teams', compliance: 'Pass',    details: 'Security phishing alert for finance team.' },
  { id: 'ALG-004', user: 'j.lindqvist@electrolux.com',  action: 'Approval Requested',   timestamp: '2026-05-09T09:47:00Z', aiModel: 'gemini-1.5-pro', channel: 'Microsoft Teams', compliance: 'Pending', details: 'Approval requested from compliance team.' },
  { id: 'ALG-005', user: 'm.eriksson@electrolux.com',   action: 'Message Approved',      timestamp: '2026-05-09T09:55:30Z', aiModel: 'gemini-1.5-pro', channel: 'Microsoft Teams', compliance: 'Pass',    details: 'Compliance officer approved. Cleared for publish.' },
  { id: 'ALG-006', user: 'j.lindqvist@electrolux.com',  action: 'Message Published',     timestamp: '2026-05-09T10:02:14Z', aiModel: 'gemini-1.5-pro', channel: 'Microsoft Teams', compliance: 'Pass',    details: 'Posted to Teams General channel.' },
  { id: 'ALG-007', user: 'a.berglund@electrolux.com',   action: 'Message Generated',    timestamp: '2026-05-08T15:30:00Z', aiModel: 'gemini-1.5-flash', channel: 'Slack',          compliance: 'Fail',    details: 'Maintenance notice — PII detected: internal IP 10.0.2.15.' },
  { id: 'ALG-008', user: 'a.berglund@electrolux.com',   action: 'Section Regenerated',  timestamp: '2026-05-08T15:33:10Z', aiModel: 'gemini-1.5-flash', channel: 'Slack',          compliance: 'Pass',    details: 'Section "What You Need to Do" regenerated and PII removed.' },
  { id: 'ALG-009', user: 'a.berglund@electrolux.com',   action: 'Message Published',     timestamp: '2026-05-08T15:45:00Z', aiModel: 'gemini-1.5-flash', channel: 'Slack',          compliance: 'Pass',    details: 'Slack #general post confirmed.' },
  { id: 'ALG-010', user: 'k.ramalingam@electrolux.com', action: 'Draft Saved',           timestamp: '2026-05-08T14:10:00Z', aiModel: 'gemini-1.5-pro', channel: 'Email',           compliance: 'Pass',    details: 'Executive Q2 update draft saved.' },
  { id: 'ALG-011', user: 'k.ramalingam@electrolux.com', action: 'Message Duplicated',    timestamp: '2026-05-08T14:12:00Z', aiModel: '—',              channel: 'Email',           compliance: 'Pass',    details: 'Duplicated "Q1 Executive Update" to Q2.' },
  { id: 'ALG-012', user: 's.nguyen@electrolux.com',     action: 'Version Restored',      timestamp: '2026-05-07T11:20:00Z', aiModel: 'gemini-1.5-pro', channel: 'Viva Engage',     compliance: 'Pass',    details: 'Reverted to v2 of frontline safety notice.' },
  { id: 'ALG-013', user: 's.nguyen@electrolux.com',     action: 'Approval Rejected',     timestamp: '2026-05-07T11:25:00Z', aiModel: 'gemini-1.5-pro', channel: 'Viva Engage',     compliance: 'Fail',    details: 'Compliance rejected v3: jargon density too high for frontline.' },
  { id: 'ALG-014', user: 'system',                      action: 'Scheduled Publish',     timestamp: '2026-05-07T09:00:00Z', aiModel: 'gemini-1.5-pro', channel: 'Email',           compliance: 'Pass',    details: 'Automated scheduled publish executed successfully.' },
  { id: 'ALG-015', user: 'system',                      action: 'Compliance Scan',       timestamp: '2026-05-06T08:00:00Z', aiModel: 'gemini-1.5-pro', channel: '—',               compliance: 'Pass',    details: 'Daily compliance scan: all 12 published messages passed.' },
];

const ALL_ACTIONS   = [...new Set(SEED_LOGS.map(l => l.action))];
const ALL_CHANNELS  = [...new Set(SEED_LOGS.map(l => l.channel).filter(c => c !== '—'))];
const ALL_USERS     = [...new Set(SEED_LOGS.map(l => l.user))];

const COMPLIANCE_COLORS = {
  Pass:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  Fail:    { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  Pending: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
};

const ACTION_ICONS = {
  'Message Generated':   '',
  'Message Published':   '',
  'Message Approved':    '',
  'Approval Requested':  '',
  'Approval Rejected':   '',
  'Section Regenerated': '♻️',
  'Draft Saved':         '💾',
  'Message Duplicated':  '⎘',
  'Version Restored':    '↩️',
  'Scheduled Publish':   '⏰',
  'Compliance Scan':     '',
};

/* ── Helpers ────────────────────────────────────────────────────────── */
function formatTs(iso) {
  const d = new Date(iso);
  return d.toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });
}

function downloadCSV(logs) {
  const headers = ['ID','User','Action','Timestamp','AI Model','Channel','Compliance','Details'];
  const rows = logs.map(l => [
    l.id, `"${l.user}"`, `"${l.action}"`, l.timestamp,
    l.aiModel, l.channel, l.compliance, `"${l.details}"`,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.csv'; a.click();
  URL.revokeObjectURL(url);
}

/* ── AuditLogsPage ──────────────────────────────────────────────────── */
export default function AuditLogsPage({ communications = [] }) {
  const [search,      setSearch]      = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterUser,  setFilterUser]  = useState('');
  const [filterCompliance, setFilterCompliance] = useState('');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [expandedId,  setExpandedId]  = useState(null);
  const [page,        setPage]        = useState(1);
  const PAGE_SIZE = 10;

  // Build live logs from communications prop and merge with seed
  const liveLogs = useMemo(() => {
    return communications.flatMap(c => {
      const entries = [];
      if (c.status !== 'Draft') {
        entries.push({
          id:         `LIVE-${c.id}-PUB`,
          user:       'current.user@electrolux.com',
          action:     c.status === 'Published' ? 'Message Published' : 'Draft Saved',
          timestamp:  c.updated || new Date().toISOString(),
          aiModel:    'gemini-1.5-pro',
          channel:    c.channel || 'Viva Engage',
          compliance: 'Pass',
          details:    `"${c.title}" — ${c.audience}`,
        });
      }
      entries.push({
        id:         `LIVE-${c.id}-GEN`,
        user:       'current.user@electrolux.com',
        action:     'Message Generated',
        timestamp:  c.updated || new Date().toISOString(),
        aiModel:    'gemini-1.5-pro',
        channel:    c.channel || 'Viva Engage',
        compliance: 'Pass',
        details:    `AI-generated: "${c.title}" for ${c.audience}`,
      });
      return entries;
    });
  }, [communications]);

  const allLogs = useMemo(() => {
    return [...liveLogs, ...SEED_LOGS].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [liveLogs]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    return allLogs.filter(l => {
      if (filterAction    && l.action    !== filterAction)    return false;
      if (filterChannel   && l.channel   !== filterChannel)  return false;
      if (filterUser      && l.user      !== filterUser)      return false;
      if (filterCompliance && l.compliance !== filterCompliance) return false;
      if (dateFrom && new Date(l.timestamp) < new Date(dateFrom)) return false;
      if (dateTo   && new Date(l.timestamp) > new Date(dateTo + 'T23:59:59Z')) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.user.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allLogs, filterAction, filterChannel, filterUser, filterCompliance, dateFrom, dateTo, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = filterAction || filterChannel || filterUser || filterCompliance || dateFrom || dateTo;

  function clearFilters() {
    setFilterAction(''); setFilterChannel(''); setFilterUser('');
    setFilterCompliance(''); setDateFrom(''); setDateTo('');
    setSearch(''); setPage(1);
  }

  /* ── Compliance summary ── */
  const passCount    = filtered.filter(l => l.compliance === 'Pass').length;
  const failCount    = filtered.filter(l => l.compliance === 'Fail').length;
  const pendingCount = filtered.filter(l => l.compliance === 'Pending').length;

  return (
    <div className="auditlogs-page">

      {/* ── Header ── */}
      <div className="auditlogs-header">
        <div>
          <h1 className="auditlogs-title">Audit Logs</h1>
          <p className="auditlogs-subtitle">
            Immutable governance trail — every AI action, approval, and publish event.
          </p>
        </div>
        <div className="auditlogs-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => downloadCSV(filtered)}
            title="Export visible logs as CSV"
          >
             Export CSV
          </button>
        </div>
      </div>

      {/* ── Compliance summary strip ── */}
      <div className="auditlogs-summary-strip">
        <div className="auditlogs-summary-item auditlogs-summary--pass">
          <span className="auditlogs-summary-count">{passCount}</span>
          <span className="auditlogs-summary-label">Pass</span>
        </div>
        <div className="auditlogs-summary-item auditlogs-summary--fail">
          <span className="auditlogs-summary-count">{failCount}</span>
          <span className="auditlogs-summary-label">Fail</span>
        </div>
        <div className="auditlogs-summary-item auditlogs-summary--pending">
          <span className="auditlogs-summary-count">{pendingCount}</span>
          <span className="auditlogs-summary-label">Pending</span>
        </div>
        <div className="auditlogs-summary-item auditlogs-summary--total">
          <span className="auditlogs-summary-count">{filtered.length}</span>
          <span className="auditlogs-summary-label">Total events</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="auditlogs-search-row">
        <div className="auditlogs-search-wrap">
          <span className="auditlogs-search-icon"></span>
          <input
            className="auditlogs-search-input"
            type="search"
            placeholder="Search by user, action, event ID or details…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="auditlogs-filters">
        <div className="filter-group">
          <span className="filter-group-label">Action</span>
          <select
            className="history-filter-select"
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          >
            <option value="">All</option>
            {ALL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-group-label">Channel</span>
          <select
            className="history-filter-select"
            value={filterChannel}
            onChange={e => { setFilterChannel(e.target.value); setPage(1); }}
          >
            <option value="">All</option>
            {ALL_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-group-label">Compliance</span>
          <select
            className="history-filter-select"
            value={filterCompliance}
            onChange={e => { setFilterCompliance(e.target.value); setPage(1); }}
          >
            <option value="">All</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-group-label">User</span>
          <select
            className="history-filter-select"
            value={filterUser}
            onChange={e => { setFilterUser(e.target.value); setPage(1); }}
          >
            <option value="">All</option>
            {ALL_USERS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-group-label">Date Range</span>
          <div className="history-date-range">
            <input type="date" className="history-filter-select" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
            <span className="history-date-sep">→</span>
            <input type="date" className="history-filter-select" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          </div>
        </div>
        {hasFilters && (
          <div className="filter-group filter-group--reset">
            <span className="filter-group-label">&nbsp;</span>
            <button className="history-clear-filters" onClick={clearFilters}>✕ Reset Filters</button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="auditlogs-empty">
          <div className="auditlogs-empty-icon"></div>
          <p className="auditlogs-empty-text">No audit events match the current filters.</p>
          {hasFilters && <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>}
        </div>
      ) : (
        <>
          <div className="auditlogs-table-wrap">
            <table className="auditlogs-table" aria-label="Audit log events">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>AI Model</th>
                  <th>Channel</th>
                  <th>Compliance</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(log => {
                  const cc = COMPLIANCE_COLORS[log.compliance] || COMPLIANCE_COLORS['Pending'];
                  const isExpanded = expandedId === log.id;
                  return (
                    <>
                      <tr
                        key={log.id}
                        className={`auditlogs-row ${isExpanded ? 'auditlogs-row--expanded' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        role="button"
                        aria-expanded={isExpanded}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setExpandedId(isExpanded ? null : log.id)}
                      >
                        <td className="auditlogs-td auditlogs-td--id">{log.id}</td>
                        <td className="auditlogs-td auditlogs-td--user">
                          <span className="auditlogs-user-avatar">
                            {log.user === 'system' ? '' : log.user.charAt(0).toUpperCase()}
                          </span>
                          <span className="auditlogs-user-text">{log.user}</span>
                        </td>
                        <td className="auditlogs-td auditlogs-td--action">
                          <span className="auditlogs-action-icon">{ACTION_ICONS[log.action] || '•'}</span>
                          {log.action}
                        </td>
                        <td className="auditlogs-td auditlogs-td--ts">{formatTs(log.timestamp)}</td>
                        <td className="auditlogs-td auditlogs-td--model">{log.aiModel}</td>
                        <td className="auditlogs-td auditlogs-td--channel">{log.channel}</td>
                        <td className="auditlogs-td">
                          <span
                            className="auditlogs-compliance-badge"
                            style={{ background: cc.bg, border: `1px solid ${cc.border}`, color: cc.text }}
                          >
                            {log.compliance === 'Pass' ? '✓' : log.compliance === 'Fail' ? '✕' : '⏳'} {log.compliance}
                          </span>
                        </td>
                        <td className="auditlogs-td auditlogs-td--details">
                          <span className="auditlogs-details-preview">{log.details}</span>
                          <span className="auditlogs-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${log.id}-detail`} className="auditlogs-detail-row">
                          <td colSpan={8}>
                            <div className="auditlogs-detail-panel">
                              <div className="auditlogs-detail-grid">
                                <div className="auditlogs-detail-item">
                                  <span className="auditlogs-detail-key">Event ID</span>
                                  <span className="auditlogs-detail-val auditlogs-detail-val--mono">{log.id}</span>
                                </div>
                                <div className="auditlogs-detail-item">
                                  <span className="auditlogs-detail-key">Full Timestamp</span>
                                  <span className="auditlogs-detail-val auditlogs-detail-val--mono">{log.timestamp}</span>
                                </div>
                                <div className="auditlogs-detail-item">
                                  <span className="auditlogs-detail-key">Details</span>
                                  <span className="auditlogs-detail-val">{log.details}</span>
                                </div>
                                <div className="auditlogs-detail-item">
                                  <span className="auditlogs-detail-key">AI Model</span>
                                  <span className="auditlogs-detail-val">{log.aiModel}</span>
                                </div>
                              </div>
                              <div className="auditlogs-immutable-note">
                                 This log entry is immutable and cannot be altered or deleted.
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="auditlogs-pagination">
              <button
                className="auditlogs-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Prev
              </button>
              <span className="auditlogs-page-info">
                Page {page} of {totalPages} · {filtered.length} events
              </span>
              <button
                className="auditlogs-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

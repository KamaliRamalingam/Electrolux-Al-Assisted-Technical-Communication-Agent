/**
 * DashboardPage — Screen 1
 * Fully dynamic: all data derived from the `communications` prop.
 * No mock/hardcoded data.
 *
 * Props:
 *   communications      {Array}    - Live list from App.jsx state
 *   onNewCommunication  {function} - Navigate to New Communication wizard
 *
 * Each communication entry shape:
 *   { id, title, audience, channel, status, updated, confidence, aiSummary, publishedAt }
 */

import { useState, useMemo } from 'react';

/* ─────────────────────────────────────────────
   Helper utilities
───────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function confidenceLevel(score) {
  if (score >= 90) return 'high';
  if (score >= 75) return 'medium';
  return 'low';
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** KPI metric card */
function MetricCard({ icon, label, value, color, subtitle }) {
  return (
    <div className={`metric-card metric-card--${color}`}>
      <div className="metric-card-top">
        <div className={`metric-icon metric-icon--${color}`}>{icon}</div>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );
}

/** Status badge pill */
function StatusBadge({ status }) {
  const map = {
    Published: 'badge-published',
    Scheduled: 'badge-scheduled',
    Draft:     'badge-draft',
  };
  return <span className={`status-badge ${map[status] || ''}`}>{status}</span>;
}

/** Channel badge pill */
function ChannelBadge({ channel }) {
  const map = {
    'Microsoft Teams': 'channel-teams',
    'Viva Engage':     'channel-viva',
    'Slack':           'channel-slack',
    'Email':           'channel-email',
    'SMS':             'channel-sms',
  };
  const icons = {
    'Microsoft Teams': '',
    'Viva Engage':     '',
    'Slack':           '#',
    'Email':           '✉️',
    'SMS':             '📱',
  };
  return (
    <span className={`channel-badge ${map[channel] || ''}`}>
      <span className="channel-badge-icon">{icons[channel] || '📡'}</span>
      {channel}
    </span>
  );
}

/** AI confidence badge */
function ConfidenceBadge({ score }) {
  const level = confidenceLevel(score);
  const emoji = level === 'high' ? '🟢' : level === 'medium' ? '🟡' : '🔴';
  return (
    <span className={`confidence-badge confidence-badge--${level}`}>
      {emoji} {score}%
    </span>
  );
}

/* ─────────────────────────────────────────────
   Empty state
───────────────────────────────────────────── */
function EmptyDashboard({ onNewCommunication }) {
  return (
    <div className="dashboard-empty">
      <div className="dashboard-empty-icon"></div>
      <h2 className="dashboard-empty-title">No communications yet</h2>
      <p className="dashboard-empty-text">
        Create your first AI-assisted communication to see live metrics,
        activity feed, and publishing history appear here.
      </p>
      <button className="btn btn-primary" onClick={onNewCommunication}>
         Create First Communication
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main DashboardPage
───────────────────────────────────────────── */
export default function DashboardPage({ communications = [], onNewCommunication }) {

  // ── Compute KPI metrics from real data ──
  const metrics = useMemo(() => {
    const total     = communications.length;
    const published = communications.filter(c => c.status === 'Published').length;
    const scheduled = communications.filter(c => c.status === 'Scheduled').length;
    const drafts    = communications.filter(c => c.status === 'Draft').length;
    const avgConf   = total > 0
      ? Math.round(communications.reduce((s, c) => s + (c.confidence || 0), 0) / total)
      : 0;
    return { total, published, scheduled, drafts, avgConf };
  }, [communications]);

  // ── Channel distribution (for performance panel) ──
  const channelDist = useMemo(() => {
    if (communications.length === 0) return [];
    const counts = {};
    communications.forEach(c => {
      counts[c.channel] = (counts[c.channel] || 0) + 1;
    });
    const total = communications.length;
    return Object.entries(counts)
      .map(([label, count]) => ({ label, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [communications]);

  const CHANNEL_COLORS = {
    'Microsoft Teams': '#5059C9',
    'Viva Engage':     '#9c27b0',
    'Slack':           '#E01E5A',
    'Email':           '#d97706',
    'SMS':             '#6b7280',
  };

  // ── Table state ──
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField,    setSortField]    = useState('updated');
  const [sortDir,      setSortDir]      = useState('desc');
  const [currentPage,  setCurrentPage]  = useState(1);
  const PAGE_SIZE = 5;

  const filteredData = useMemo(() => {
    let data = [...communications];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(r =>
        (r.title   || '').toLowerCase().includes(q) ||
        (r.audience|| '').toLowerCase().includes(q) ||
        (r.channel || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      data = data.filter(r => r.status === statusFilter);
    }
    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'updated' || sortField === 'publishedAt') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return data;
  }, [communications, searchQuery, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pagedData  = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="sort-icon sort-icon--inactive">⇅</span>;
    return <span className="sort-icon sort-icon--active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  // ── Empty dashboard ──
  if (communications.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Monitor communication operations and AI-assisted publishing.
            </p>
          </div>
          <div className="dashboard-header-right">
            <button className="btn-icon-ghost" title="Notifications" aria-label="Notifications"></button>
            <div className="user-avatar" title="User profile">KR</div>
            <button className="btn btn-primary" onClick={onNewCommunication}>
               New Communication
            </button>
          </div>
        </div>
        <EmptyDashboard onNewCommunication={onNewCommunication} />
      </div>
    );
  }

  // ── Full dashboard ──
  return (
    <div className="dashboard-page">

      {/* ── Top Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor communication operations and AI-assisted publishing.
          </p>
        </div>
        <div className="dashboard-header-right">
          <button className="btn-icon-ghost" title="Notifications" aria-label="Notifications"></button>
          <div className="user-avatar" title="User profile" aria-label="User profile">KR</div>
          <button className="btn btn-primary" onClick={onNewCommunication}>
             New Communication
          </button>
        </div>
      </div>

      {/* ── Section 1: KPI Metrics ── */}
      <div className="metrics-grid">
        <MetricCard
          icon=""
          label="Total Messages"
          value={metrics.total}
          color="blue"
          subtitle="All time"
        />
        <MetricCard
          icon=""
          label="Published"
          value={metrics.published}
          color="green"
          subtitle={metrics.total > 0 ? `${Math.round((metrics.published / metrics.total) * 100)}% of total` : '—'}
        />
        <MetricCard
          icon="🕐"
          label="Scheduled"
          value={metrics.scheduled}
          color="purple"
          subtitle="Pending publish"
        />
        <MetricCard
          icon=""
          label="Drafts"
          value={metrics.drafts}
          color="orange"
          subtitle="In progress"
        />
      </div>

      {/* ── Section 2: Recent Communications Table ── */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-header-left">
            <h2 className="dashboard-card-title">Recent Communications</h2>
            <span className="dashboard-card-count">{filteredData.length} records</span>
          </div>
          <div className="dashboard-table-toolbar">
            <div className="table-search-wrap">
              <span className="table-search-icon"></span>
              <input
                type="text"
                className="table-search-input"
                placeholder="Search by title, audience or channel…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
              {searchQuery && (
                <button
                  className="table-search-clear"
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  aria-label="Clear search"
                >×</button>
              )}
            </div>
            <select
              className="table-filter-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="comms-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} className="sortable-col">
                  Title <SortIcon field="title" />
                </th>
                <th onClick={() => handleSort('audience')} className="sortable-col">
                  Audience <SortIcon field="audience" />
                </th>
                <th onClick={() => handleSort('channel')} className="sortable-col">
                  Channel <SortIcon field="channel" />
                </th>
                <th onClick={() => handleSort('status')} className="sortable-col">
                  Status <SortIcon field="status" />
                </th>
                <th onClick={() => handleSort('updated')} className="sortable-col">
                  Updated <SortIcon field="updated" />
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    <span className="table-empty-icon"></span>
                    <span>No communications match your filters.</span>
                  </td>
                </tr>
              ) : (
                pagedData.map(row => (
                  <tr key={row.id} className="comms-table-row">
                    <td className="col-title">
                      <span className="comms-title" title={row.title}>{row.title}</span>
                    </td>
                    <td className="col-audience">
                      <span className="audience-pill">{row.audience}</span>
                    </td>
                    <td className="col-channel">
                      <ChannelBadge channel={row.channel} />
                    </td>
                    <td className="col-status">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="col-updated">
                      <span className="updated-date" title={new Date(row.updated).toLocaleString()}>
                        {formatDate(row.updated)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="table-pagination">
          <span className="pagination-info">
            {filteredData.length === 0
              ? 'No results'
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredData.length)} of ${filteredData.length}`
            }
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-btn ${page === currentPage ? 'pagination-btn--active' : ''}`}
                onClick={() => setCurrentPage(page)}
                aria-label={`Page ${page}`}
              >{page}</button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >›</button>
          </div>
        </div>
      </div>

      {/* ── Section 3 & 4: Bottom two columns ── */}
      <div className="dashboard-bottom-grid">

        {/* AI Activity Feed — live entries from real transformations */}
        <div className="dashboard-card activity-feed-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-header-left">
              <h2 className="dashboard-card-title">AI Activity Feed</h2>
              <span className="dashboard-card-count live-badge">● Live</span>
            </div>
            <span className="dashboard-card-subtitle">{communications.length} transformation{communications.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="activity-feed">
            {communications.map((item, idx) => (
              <div key={item.id} className="feed-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="feed-item-top">
                  <span className="feed-item-title">{item.title}</span>
                  <ConfidenceBadge score={item.confidence} />
                </div>
                <div className="feed-item-meta">
                  <span className="feed-audience-tag">{item.audience}</span>
                  <StatusBadge status={item.status} />
                  <span className="feed-time">{timeAgo(item.updated)}</span>
                </div>
                {item.aiSummary && (
                  <p className="feed-item-summary">{item.aiSummary}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Communication Performance — computed from real data */}
        <div className="dashboard-card performance-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-header-left">
              <h2 className="dashboard-card-title">Communication Performance</h2>
              <span className="dashboard-card-subtitle">{metrics.total} total</span>
            </div>
          </div>

          {/* Status breakdown bars */}
          <div className="perf-kpi-row">
            {[
              { label: 'Published', value: metrics.published, total: metrics.total, color: 'var(--accent-green)' },
              { label: 'Scheduled', value: metrics.scheduled, total: metrics.total, color: 'var(--accent-blue)'  },
              { label: 'Drafts',    value: metrics.drafts,    total: metrics.total, color: 'var(--gray-400)'     },
            ].map(item => (
              <div key={item.label} className="perf-kpi">
                <div className="perf-kpi-value">{item.value}</div>
                <div className="perf-kpi-label">{item.label}</div>
                <div className="perf-kpi-bar">
                  <div
                    className="perf-kpi-fill"
                    style={{
                      width: item.total > 0 ? `${Math.round((item.value / item.total) * 100)}%` : '0%',
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Avg confidence */}
          <div className="perf-kpi-row" style={{ borderTop: '1px solid var(--gray-100)' }}>
            <div className="perf-kpi" style={{ flex: 'none', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="perf-kpi-value">{metrics.avgConf}%</div>
                  <div className="perf-kpi-label">Avg AI Confidence</div>
                </div>
                <ConfidenceBadge score={metrics.avgConf} />
              </div>
              <div className="perf-kpi-bar" style={{ marginTop: 8 }}>
                <div
                  className="perf-kpi-fill"
                  style={{ width: `${metrics.avgConf}%`, background: 'var(--brand-500)' }}
                />
              </div>
            </div>
          </div>

          {/* Channel distribution — computed dynamically */}
          {channelDist.length > 0 && (
            <div className="channel-dist">
              <div className="channel-dist-title">Channel Usage</div>
              {channelDist.map(ch => (
                <div key={ch.label} className="channel-dist-row">
                  <span className="channel-dist-label">{ch.label}</span>
                  <div className="channel-dist-bar-wrap">
                    <div
                      className="channel-dist-bar-fill"
                      style={{ width: `${ch.pct}%`, background: CHANNEL_COLORS[ch.label] || '#6b7280' }}
                    />
                  </div>
                  <span className="channel-dist-pct">{ch.pct}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Session summary callout */}
          <div className="ai-impact-callout">
            <span className="ai-impact-icon"></span>
            <div>
              <div className="ai-impact-headline">Session summary</div>
              <div className="ai-impact-stat">
                <strong>{metrics.total}</strong> message{metrics.total !== 1 ? 's' : ''} transformed · {' '}
                <strong>{metrics.published}</strong> published · Avg confidence{' '}
                <strong>{metrics.avgConf}%</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

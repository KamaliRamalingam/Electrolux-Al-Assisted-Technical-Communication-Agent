import { useState } from 'react';

/* ── Mock data ───────────────────────────────────────────────────── */
const ENGAGEMENT_DATA = [
  { month: 'Dec', views: 1240, engagement: 62 },
  { month: 'Jan', views: 1890, engagement: 71 },
  { month: 'Feb', views: 2100, engagement: 68 },
  { month: 'Mar', views: 2850, engagement: 74 },
  { month: 'Apr', views: 3200, engagement: 79 },
  { month: 'May', views: 3740, engagement: 83 },
];

const CHANNEL_DATA = [
  { channel: 'Viva Engage',     pct: 38, color: '#7c3aed', count: 142 },
  { channel: 'Microsoft Teams', pct: 31, color: '#5059C9', count: 116 },
  { channel: 'Slack',           pct: 19, color: '#E01E5A', count:  71 },
  { channel: 'Email',           pct: 12, color: '#0078d4', count:  45 },
];

const AUDIENCE_DATA = [
  { audience: 'Frontline Workers', value: 87, color: '#10b981' },
  { audience: 'Office Employees',  value: 74, color: '#3b82f6' },
  { audience: 'IT Staff',          value: 91, color: '#8b5cf6' },
  { audience: 'Executives',        value: 68, color: '#f59e0b' },
  { audience: 'External Partners', value: 55, color: '#ef4444' },
];

const SENTIMENT_ROWS = ['Mon','Tue','Wed','Thu','Fri'];
const SENTIMENT_COLS = ['Viva Engage','Teams','Slack','Email'];
const SENTIMENT_GRID = [
  [82, 78, 71, 90],
  [75, 85, 68, 82],
  [88, 79, 74, 77],
  [91, 83, 80, 88],
  [84, 76, 85, 94],
];

const AI_IMPACT = [
  { icon: '🎫', label: 'Helpdesk Ticket Reduction',    value: '−28%',  detail: 'vs. pre-AI baseline (Q1 2026)' },
  { icon: '⏱️', label: 'Avg. Time to Publish',         value: '4.2 min', detail: 'down from 38 min manually' },
  { icon: '', label: 'Technical Terms Simplified',   value: '1,847', detail: 'auto-simplified this month' },
  { icon: '', label: 'Compliance Pass Rate',          value: '97.3%', detail: 'across all published messages' },
  { icon: '🔁', label: 'Avg. Regeneration Rounds',     value: '1.4×',  detail: 'per message before approval' },
  { icon: '🌍', label: 'Languages Supported',           value: '9',     detail: 'auto-translated messages' },
];

const KPI_CARDS = [
  { icon: '👁️',  label: 'Total Views',             value: '46,230', delta: '+12%',  up: true  },
  { icon: '',  label: 'Engagement Rate',          value: '76.4%',  delta: '+4.2%', up: true  },
  { icon: '🖱️',  label: 'Click-through Rate',       value: '22.1%',  delta: '+1.8%', up: true  },
  { icon: '📖',  label: 'Read Completion',          value: '68.3%',  delta: '+8.5%', up: true  },
  { icon: '😊',  label: 'Average Sentiment',        value: '4.3 / 5', delta: '+0.2', up: true  },
  { icon: '🎫',  label: 'Helpdesk Ticket Reduction', value: '−28%',  delta: 'vs baseline', up: true  },
];

/* ── Helpers ─────────────────────────────────────────────────────── */
function sentimentColor(val) {
  if (val >= 85) return '#10b981';
  if (val >= 75) return '#3b82f6';
  if (val >= 65) return '#f59e0b';
  return '#ef4444';
}

/* ── Sub-components ───────────────────────────────────────────────── */

/** KPI metric card */
function KpiCard({ icon, label, value, delta, up }) {
  return (
    <div className="analytics-kpi-card">
      <div className="analytics-kpi-icon">{icon}</div>
      <div className="analytics-kpi-body">
        <div className="analytics-kpi-value">{value}</div>
        <div className="analytics-kpi-label">{label}</div>
      </div>
      <div className={`analytics-kpi-delta ${up ? 'analytics-kpi-delta--up' : 'analytics-kpi-delta--down'}`}>
        {up ? '▲' : '▼'} {delta}
      </div>
    </div>
  );
}

/** CSS-based line/bar sparkline for Engagement Over Time */
function EngagementChart({ data }) {
  const maxViews = Math.max(...data.map(d => d.views));
  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h3 className="analytics-chart-title">Engagement Over Time</h3>
        <span className="analytics-chart-period">Last 6 months</span>
      </div>
      <div className="analytics-bar-chart">
        {data.map((d, i) => (
          <div key={i} className="analytics-bar-group">
            <div className="analytics-bar-col">
              <div
                className="analytics-bar analytics-bar--views"
                style={{ height: `${Math.round((d.views / maxViews) * 120)}px` }}
                title={`${d.month}: ${d.views.toLocaleString()} views`}
              />
              <div
                className="analytics-bar analytics-bar--engagement"
                style={{ height: `${Math.round((d.engagement / 100) * 120)}px` }}
                title={`${d.month}: ${d.engagement}% engagement`}
              />
            </div>
            <span className="analytics-bar-label">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="analytics-chart-legend">
        <span className="analytics-legend-dot analytics-legend-dot--views" /> Views
        <span className="analytics-legend-dot analytics-legend-dot--engagement" /> Engagement %
      </div>
    </div>
  );
}

/** CSS-based donut/pie chart for Channel Distribution */
function ChannelPieChart({ data }) {
  // Build conic-gradient segments
  let cumulative = 0;
  const segments = data.map(d => {
    const start = cumulative;
    cumulative += d.pct;
    return { ...d, start, end: cumulative };
  });
  const gradient = segments
    .map(s => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ');

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h3 className="analytics-chart-title">📡 Channel Distribution</h3>
        <span className="analytics-chart-period">All time</span>
      </div>
      <div className="analytics-pie-wrap">
        <div
          className="analytics-donut"
          style={{ background: `conic-gradient(${gradient})` }}
          aria-label="Channel distribution pie chart"
        >
          <div className="analytics-donut-hole">
            {data.reduce((a, d) => a + d.count, 0).toLocaleString()}
            <small>total</small>
          </div>
        </div>
        <div className="analytics-pie-legend">
          {data.map(d => (
            <div key={d.channel} className="analytics-pie-legend-item">
              <span className="analytics-pie-dot" style={{ background: d.color }} />
              <span className="analytics-pie-channel">{d.channel}</span>
              <span className="analytics-pie-pct">{d.pct}%</span>
              <span className="analytics-pie-count">({d.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** CSS horizontal bar chart for Audience Engagement */
function AudienceBarChart({ data }) {
  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h3 className="analytics-chart-title">👥 Audience Engagement</h3>
        <span className="analytics-chart-period">Read completion rate</span>
      </div>
      <div className="analytics-hbar-chart">
        {data.map(d => (
          <div key={d.audience} className="analytics-hbar-row">
            <span className="analytics-hbar-label">{d.audience}</span>
            <div className="analytics-hbar-track">
              <div
                className="analytics-hbar-fill"
                style={{ width: `${d.value}%`, background: d.color }}
                aria-label={`${d.audience}: ${d.value}%`}
              />
            </div>
            <span className="analytics-hbar-val">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sentiment heatmap */
function SentimentHeatmap({ rows, cols, grid }) {
  return (
    <div className="analytics-chart-card analytics-chart-card--full">
      <div className="analytics-chart-header">
        <h3 className="analytics-chart-title">🌡️ Sentiment Analysis Heatmap</h3>
        <span className="analytics-chart-period">This week · by channel</span>
      </div>
      <div className="analytics-heatmap">
        {/* Header row */}
        <div className="analytics-heatmap-header">
          <div className="analytics-heatmap-corner" />
          {cols.map(c => (
            <div key={c} className="analytics-heatmap-col-label">{c}</div>
          ))}
        </div>
        {/* Data rows */}
        {rows.map((row, ri) => (
          <div key={row} className="analytics-heatmap-row">
            <div className="analytics-heatmap-row-label">{row}</div>
            {cols.map((col, ci) => {
              const val = grid[ri][ci];
              return (
                <div
                  key={col}
                  className="analytics-heatmap-cell"
                  style={{ background: sentimentColor(val) }}
                  title={`${row} · ${col}: ${val}% positive`}
                >
                  {val}%
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="analytics-heatmap-legend">
        <span>Sentiment scale:</span>
        {[['#ef4444','<65%'],['#f59e0b','65–75%'],['#3b82f6','75–85%'],['#10b981','85%+']].map(([c,l]) => (
          <span key={l} className="analytics-heatmap-legend-item">
            <span className="analytics-heatmap-legend-dot" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/** AI Impact Metrics section */
function AIImpactSection({ metrics }) {
  return (
    <div className="analytics-ai-impact">
      <div className="analytics-ai-impact-header">
        <h2 className="analytics-ai-impact-title">AI Impact Metrics</h2>
        <p className="analytics-ai-impact-subtitle">
          Measurable outcomes from AI-assisted communications at Electrolux.
        </p>
      </div>
      <div className="analytics-ai-impact-grid">
        {metrics.map(m => (
          <div key={m.label} className="analytics-ai-metric-card">
            <div className="analytics-ai-metric-icon">{m.icon}</div>
            <div className="analytics-ai-metric-value">{m.value}</div>
            <div className="analytics-ai-metric-label">{m.label}</div>
            <div className="analytics-ai-metric-detail">{m.detail}</div>
          </div>
        ))}
      </div>
      <div className="analytics-ai-highlight">
        🎫 AI-generated communications reduced support tickets by <strong>28%</strong> vs. pre-AI baseline.
      </div>
    </div>
  );
}

/* ── AnalyticsPage ────────────────────────────────────────────────── */
export default function AnalyticsPage({ communications = [] }) {
  const [period, setPeriod] = useState('month');

  // Override KPI card counts if we have live data
  const liveMsgs = communications.length;
  const livePublished = communications.filter(c => c.status === 'Published').length;

  return (
    <div className="analytics-page">

      {/* ── Header ── */}
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Analytics Dashboard</h1>
          <p className="analytics-subtitle">Measure the real-world impact of every AI-assisted communication.</p>
        </div>
        <div className="analytics-period-selector">
          {['week','month','quarter','year'].map(p => (
            <button
              key={p}
              className={`analytics-period-btn ${period === p ? 'analytics-period-btn--active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Live session metrics if comms exist */}
      {liveMsgs > 0 && (
        <div className="analytics-live-banner">
          🟢 Live session: <strong>{liveMsgs}</strong> messages generated, <strong>{livePublished}</strong> published.
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="analytics-kpi-grid">
        {KPI_CARDS.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ── Charts row ── */}
      <div className="analytics-charts-grid">
        <EngagementChart data={ENGAGEMENT_DATA} />
        <ChannelPieChart data={CHANNEL_DATA} />
      </div>

      {/* ── Audience & Sentiment row ── */}
      <div className="analytics-charts-grid analytics-charts-grid--asymmetric">
        <AudienceBarChart data={AUDIENCE_DATA} />
        <SentimentHeatmap rows={SENTIMENT_ROWS} cols={SENTIMENT_COLS} grid={SENTIMENT_GRID} />
      </div>

      {/* ── AI Impact ── */}
      <AIImpactSection metrics={AI_IMPACT} />
    </div>
  );
}

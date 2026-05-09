/**
 * Sidebar
 * Enterprise left-side navigation panel.
 *
 * Props:
 *   collapsed     {boolean}  - Whether the sidebar is in icon-only mode
 *   onToggle      {function} - Toggle collapsed/expanded
 *   activeItem    {string}   - Key of the currently active nav item
 *   onItemClick   {function(key)} - Called when a nav item is clicked
 */

/* ─────────────────────────────────────────────
   Channel brand logo SVGs (inline, no CDN)
───────────────────────────────────────────── */

/** Official Slack 4-colour pinwheel mark */
function SlackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 122.8 122.8" xmlns="http://www.w3.org/2000/svg" aria-label="Slack">
      <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9z" fill="#E01E5A"/>
      <path d="M32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#E01E5A"/>
      <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2z" fill="#36C5F0"/>
      <path d="M45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9H45.2z" fill="#36C5F0"/>
      <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2z" fill="#2EB67D"/>
      <path d="M90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2EB67D"/>
      <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9z" fill="#ECB22E"/>
      <path d="M77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ECB22E"/>
    </svg>
  );
}

/** Microsoft Teams purple-T mark */
function TeamsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-label="Microsoft Teams">
      {/* Backdrop person (small, left) */}
      <circle cx="5.5" cy="7.5" r="2.2" fill="#7B83EB"/>
      <path d="M2 16c0-1.93 1.57-3.5 3.5-3.5S9 14.07 9 16" fill="#7B83EB"/>
      {/* Main card */}
      <rect x="7.5" y="3" width="11" height="11" rx="2" fill="#5059C9"/>
      {/* White T */}
      <rect x="9.5" y="5.2" width="7" height="1.6" rx="0.6" fill="#fff"/>
      <rect x="12.25" y="6.8" width="1.6" height="4.8" rx="0.6" fill="#fff"/>
    </svg>
  );
}

/** Microsoft Viva Engage gradient-spark mark */
function VivaEngageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-label="Viva Engage">
      <defs>
        <linearGradient id="viva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#9c27b0"/>
          <stop offset="50%"  stopColor="#673ab7"/>
          <stop offset="100%" stopColor="#3f51b5"/>
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="20" height="20" rx="4" fill="url(#viva-grad)"/>
      {/* White "V" letterform */}
      <path
        d="M4.5 5.5 L10 15 L15.5 5.5"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Nav groups definition
───────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { key: 'dashboard', icon: '🏠', label: 'Dashboard',         badge: null },
      { key: 'new',       icon: '✨', label: 'New Communication', badge: null },
      { key: 'history',   icon: '📋', label: 'History',           badge: null },
      { key: 'templates', icon: '📄', label: 'Templates',         badge: '3'  },
    ]
  },
  {
    label: 'Channels',
    items: [
      { key: 'viva',  icon: <VivaEngageIcon />, label: 'Viva Engage',     badge: null },
      { key: 'teams', icon: <TeamsIcon />,      label: 'Microsoft Teams', badge: null },
      { key: 'slack', icon: <SlackIcon />,      label: 'Slack',           badge: null },
    ]
  },
  {
    label: 'Admin',
    items: [
      { key: 'settings',   icon: '⚙️', label: 'Settings',   badge: null },
      { key: 'analytics',  icon: '📊', label: 'Analytics',  badge: null },
      { key: 'audit-logs', icon: '🔒', label: 'Audit Logs', badge: null },
    ]
  }
];

/* ─────────────────────────────────────────────
   Sidebar component
───────────────────────────────────────────── */
export default function Sidebar({ collapsed, onToggle, activeItem = 'new', onItemClick }) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">🤖</span>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">AI Comms Agent</span>
            <span className="sidebar-brand-subtitle">Electrolux · Internal</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <div className="sidebar-nav-label">{group.label}</div>
            )}
            {group.items.map(item => (
              <div
                key={item.key}
                className={`sidebar-item ${activeItem === item.key ? 'active' : ''}`}
                onClick={() => onItemClick?.(item.key)}
                title={collapsed ? item.label : undefined}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onItemClick?.(item.key)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="sidebar-item-label">{item.label}</span>
                    {item.badge && (
                      <span className="sidebar-item-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer toggle */}
      <div className="sidebar-footer">
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </nav>
  );
}

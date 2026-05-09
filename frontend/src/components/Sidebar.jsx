import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  BarChart2, 
  ClipboardList, 
  Settings 
} from 'lucide-react';

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
      { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard',         badge: null },
      { key: 'new',       icon: <FilePlus size={18} />,        label: 'New Communication', badge: null },
      { key: 'history',   icon: <ClipboardList size={18} />,   label: 'History',           badge: null },
      { key: 'templates', icon: <FileText size={18} />,        label: 'Templates',         badge: '3'  },
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
      { key: 'settings',   icon: <Settings size={18} />,      label: 'Settings',   badge: null },
      { key: 'analytics',  icon: <BarChart2 size={18} />,     label: 'Analytics',  badge: null },
      { key: 'audit-logs', icon: <ClipboardList size={18} />, label: 'Audit Logs', badge: null },
    ]
  }
];

/* ─────────────────────────────────────────────
   Sidebar component
───────────────────────────────────────────── */
export default function Sidebar({ collapsed, onToggle, activeItem = 'new', onItemClick, userRole = 'admin' }) {
  const visibleGroups = NAV_GROUPS.filter(group => {
    if (group.label === 'Admin' && userRole !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-5) var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {/* Electrolux Logo */}
          <svg xmlns="http://www.w3.org/2000/svg" width={collapsed ? "28" : "120"} height="28" viewBox={collapsed ? "0 0 50 50" : "0 0 218.002 49.993"}>
            <path fill="#ffffff" d="M0,49.993h49.98V0H0V49.993z M32.035,3.818c8.834,2.896,15.218,11.273,15.242,21.169 c0.024,9.735-6.231,18.092-15.242,21.18V3.818z M24.982,2.685c1.596,0,3.296,0.213,4.712,0.495 c0,11.326-10.952,20.647-22.255,20.647L2.713,23.82C3.488,12.21,13.093,2.685,24.982,2.685z M7.443,26.185 c11.301,0,22.249,9.311,22.249,20.626c-1.414,0.289-3.199,0.504-4.71,0.504c-11.893-0.016-21.823-9.57-22.272-21.13H7.443z" />
            {!collapsed && (
              <path fill="#ffffff" d="M66.711,29.389v-3.151h10.4v-4.017H66.709v-5.849h11.065v-4.008H62.452v16.843c0,4.258,1.813,7.17,6.069,7.768 c0.085,0.021,0.169,0.037,0.247,0.039h0.077c0.436,0.049,0.881,0.081,1.348,0.081h7.876v-4.003h-7.841 C68.875,33.092,66.711,32.424,66.711,29.389z M81.094,37.101h4.259V12.358h-4.259V37.101z M97.856,18.644 c-5.383,0-9.412,3.709-9.412,9.484v0.143c0,5.634,3.886,9.271,9.519,9.271c2.709,0,5.24-0.748,7.557-3.21l-2.567-2.495 c-1.355,1.355-2.674,2.068-4.848,2.068c-3.173,0-5.276-1.854-5.419-4.707h13.974c0.071-0.713,0.071-1.497,0.071-1.497 C106.733,22.673,103.203,18.644,97.856,18.644z M92.794,26.203c0.178-2.176,2.389-3.923,5.062-3.923 c2.495,0,4.527,1.783,4.527,3.923H92.794z M118.7,22.459c1.925,0,3.352,0.714,4.563,1.961l2.638-2.746 c-2.068-2.211-4.527-3.102-7.201-3.102c-5.419,0-9.768,4.029-9.768,9.52c0,5.491,4.349,9.521,9.768,9.521 c2.674,0,5.134-0.891,7.201-3.102l-2.638-2.746c-1.211,1.248-2.638,1.961-4.563,1.961c-3.138,0-5.526-2.39-5.526-5.634 S115.562,22.459,118.7,22.459z M132.811,29.396h-0.005v-6.317h3.873v-3.87h-3.868v-6.85h-4.259v17.288l0.012-0.001 c0.122,4.02,1.948,6.758,6.057,7.335c0.085,0.021,0.169,0.037,0.247,0.038h0.077c0.436,0.049,0.881,0.082,1.348,0.082h0.451 l0.015-4.003h-0.431C134.975,33.098,132.811,32.431,132.811,29.396z M144.487,21.87v-2.66h-4.224v17.891h4.224v-9.408 c0-2.946,1.881-4.793,4.826-4.793c0.674,0,1.278,0.07,1.775,0.178v-4.117c-0.178-0.035-0.816-0.107-1.277-0.107 C147.255,18.855,145.339,20.027,144.487,21.87z M161.502,18.677c-5.431,0-9.762,4.116-9.762,9.478 c0,5.359,4.331,9.478,9.762,9.478c5.393,0,9.76-4.119,9.76-9.478C171.261,22.794,166.895,18.677,161.502,18.677z M161.502,33.764 c-3.159,0-5.536-2.451-5.536-5.609c0-3.16,2.377-5.609,5.536-5.609c3.124,0,5.536,2.449,5.536,5.609 C167.037,31.314,164.626,33.764,161.502,33.764z M173.88,37.101h4.261V12.358h-4.261V37.101z M193.502,29.61 c0,2.839-1.668,4.048-3.905,4.048c-2.236,0-3.903-1.209-3.903-4.01V19.21h-4.295v10.792c0,5.112,3.726,7.561,8.163,7.561 c4.472,0,8.233-2.485,8.233-7.668V19.21h-4.293V29.61z M213.91,31.38l-2.686-3.757l3.326-4.532l2.848-3.881h-4.649l-3.87,5.36 l-3.904-5.36h-4.613l2.645,3.619l3.53,4.829l-3.7,5.153l-3.079,4.29h4.578l4.542-6.319l4.544,6.319h4.579L213.91,31.38z"/>
            )}
          </svg>
        </div>
        {!collapsed && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', fontWeight: '500' }}>
            AI Technical<br/>Communication Agent
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {visibleGroups.map(group => (
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

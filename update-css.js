const fs = require('fs');

let appCss = fs.readFileSync('frontend/src/App.css', 'utf8');
let screensCss = fs.readFileSync('frontend/src/screens.css', 'utf8');

// 1. Replace :root variables
const newRoot = `:root {
  /* Enterprise Color Palette */
  --bg-main: #0f1117;
  --bg-sidebar: #161b27;
  --bg-card: #1e2433;
  --border-color: #2a3045;
  
  --accent-primary: #1d6fbf;
  --accent-hover: #1558a0;
  
  --text-primary: #e8eaf0;
  --text-secondary: #8b92a5;
  --text-muted: #5a6074;
  
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Map old variables to new for compatibility */
  --brand-900: var(--accent-hover);
  --brand-800: var(--accent-hover);
  --brand-700: var(--accent-primary);
  --brand-600: var(--accent-primary);
  --brand-500: var(--accent-primary);
  --brand-100: var(--bg-card);
  --brand-50:  var(--bg-sidebar);

  --gray-50:  var(--bg-main);
  --gray-100: var(--bg-sidebar);
  --gray-200: var(--border-color);
  --gray-300: var(--border-color);
  --gray-400: var(--text-muted);
  --gray-500: var(--text-muted);
  --gray-600: var(--text-secondary);
  --gray-700: var(--text-primary);
  --gray-800: var(--text-primary);
  --gray-900: var(--text-primary);

  --color-success-bg: rgba(34, 197, 94, 0.1);
  --color-success-border: var(--color-success);
  --color-error-bg: rgba(239, 68, 68, 0.1);
  --color-error-border: var(--color-error);

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --text-xs:   11px;
  --text-sm:   12px;
  --text-base: 14px;
  --text-lg:   16px;
  --text-xl:   18px;
  --text-2xl:  20px;
  --text-3xl:  24px;

  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     600; /* Headings 600 weight */
  --font-extrabold:600;

  --leading-tight:   1.2;
  --leading-snug:    1.4;
  --leading-normal:  1.6;
  --leading-relaxed: 1.6;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;

  /* Radii */
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 10px;
  --radius-full: 5px; /* Badges/status pills: small, 5px border-radius */

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.3);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.3);

  /* Sidebar */
  --sidebar-width: 220px;
  --sidebar-collapsed: 64px;

  /* Transitions */
  --transition-fast:   0.12s ease;
  --transition-normal: 0.2s ease;
  --transition-slow:   0.35s ease;
}`;

appCss = appCss.replace(/:root\s*{[^}]*}/s, newRoot);

// 2. Replace #fff with var(--bg-card) or var(--bg-main) depending on context
appCss = appCss.replace(/background:\s*#fff;/g, 'background: var(--bg-card);');
appCss = appCss.replace(/background-color:\s*#fff;/g, 'background-color: var(--bg-card);');
appCss = appCss.replace(/color:\s*#fff;/g, 'color: var(--text-primary);');

screensCss = screensCss.replace(/background:\s*#fff;/g, 'background: var(--bg-card);');
screensCss = screensCss.replace(/background-color:\s*#fff;/g, 'background-color: var(--bg-card);');
screensCss = screensCss.replace(/color:\s*#fff;/g, 'color: var(--text-primary);');

// 3. Layout Shell & Main Content
appCss = appCss.replace(/min-height:\s*100vh;/g, 'height: 100vh; overflow: hidden;');
appCss = appCss.replace(/\.main-body\s*{[^}]*}/s, `.main-body {
  flex: 1;
  padding: var(--space-6);
  width: 100%;
  overflow-y: auto;
}`);

// 4. Sidebar
appCss = appCss.replace(/\.sidebar\s*{[^}]*}/s, `.sidebar {
  background: var(--bg-sidebar);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow: hidden;
  transition: width var(--transition-slow);
  z-index: 100;
  border-right: 1px solid var(--border-color);
}`);

appCss = appCss.replace(/\.sidebar-item\s*{[^}]*}/s, `.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  cursor: pointer;
  border-radius: 0;
  transition: background var(--transition-fast);
  border-left: 3px solid transparent;
  height: 44px;
  user-select: none;
  text-decoration: none;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}`);

appCss = appCss.replace(/\.sidebar-item:hover\s*{[^}]*}/s, `.sidebar-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}`);

appCss = appCss.replace(/\.sidebar-item\.active\s*{[^}]*}/s, `.sidebar-item.active {
  background: rgba(29, 111, 191, 0.1);
  border-left-color: var(--accent-primary);
  color: var(--accent-primary);
}`);

appCss = appCss.replace(/\.sidebar-item-label\s*{[^}]*}/s, `.sidebar-item-label {
  font-size: 13px;
  font-weight: var(--font-medium);
  overflow: hidden;
  text-overflow: ellipsis;
}`);

appCss = appCss.replace(/\.sidebar-item-icon\s*{[^}]*}/s, `.sidebar-item-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}`);

// 5. Header Bar
appCss = appCss.replace(/\.main-topbar\s*{[^}]*}/s, `.main-topbar {
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-color);
  padding: 0 var(--space-6);
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}`);

// 6. Buttons
appCss = appCss.replace(/\.btn\s*{[^}]*}/s, `.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  height: 36px;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  font-family: var(--font-sans);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
  line-height: 1;
  letter-spacing: 0.01em;
}`);

// 7. Inputs
appCss = appCss.replace(/textarea,\s*select,\s*input\[type="date"\],\s*input\[type="time"\]\s*{[^}]*}/s, `textarea, select, input[type="date"], input[type="time"], input[type="text"], input[type="password"], input[type="email"] {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: var(--bg-main);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
  appearance: none;
  height: 36px;
}
textarea {
  height: auto;
  min-height: 130px;
  line-height: var(--leading-relaxed);
}`);

appCss = appCss.replace(/textarea:focus,\s*select:focus,\s*input\[type="date"\]:focus,\s*input\[type="time"\]:focus\s*{[^}]*}/s, `textarea:focus, select:focus, input[type="date"]:focus, input[type="time"]:focus, input[type="text"]:focus, input[type="password"]:focus, input[type="email"]:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(29, 111, 191, 0.2);
}`);

// 8. Cards
appCss = appCss.replace(/\.content-card\s*{[^}]*}/s, `.content-card {
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}`);

// 9. Labels
appCss = appCss.replace(/label\s*{[^}]*}/s, `label {
  display: block;
  font-size: 12px;
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}`);

// 10. Badges
appCss = appCss.replace(/\.step-badge\s*{[^}]*}/s, `.step-badge {
  font-size: 11px;
  font-weight: var(--font-semibold);
  background: var(--bg-card);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  white-space: nowrap;
}`);

// 11. Tables (in screens.css)
screensCss = screensCss.replace(/\.audit-table\s*{[^}]*}/s, `.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.audit-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  font-weight: var(--font-semibold);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.audit-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}
.audit-table tbody tr:nth-child(even) {
  background: rgba(255,255,255,0.02);
}
.audit-table tbody tr:hover {
  background: rgba(255,255,255,0.04);
}`);

// 12. Fullbleed page wrap
screensCss = screensCss.replace(/\.fullbleed-page-wrap\s*{[^}]*}/s, `.fullbleed-page-wrap {
  padding: var(--space-6);
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
}`);

fs.writeFileSync('frontend/src/App.css', appCss);
fs.writeFileSync('frontend/src/screens.css', screensCss);
console.log('CSS updated');

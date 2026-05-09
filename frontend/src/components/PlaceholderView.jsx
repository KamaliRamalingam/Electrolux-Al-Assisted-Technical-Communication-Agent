/**
 * PlaceholderView
 * Shown when a sidebar nav item doesn't have a full implementation yet.
 *
 * Props:
 *   icon    {string}  - Emoji icon
 *   title   {string}  - Page title
 *   teaser  {string}  - Short description / coming-soon message
 *   extras  {Array}   - Optional list of feature teasers [{ icon, text }]
 */
export default function PlaceholderView({ icon, title, teaser, extras = [] }) {
  return (
    <div className="placeholder-view">
      <div className="placeholder-icon">{icon}</div>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-teaser">{teaser}</p>

      {extras.length > 0 && (
        <ul className="placeholder-extras">
          {extras.map((item, i) => (
            <li key={i} className="placeholder-extra-item">
              <span className="placeholder-extra-icon">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="placeholder-badge">Coming soon</div>
    </div>
  );
}

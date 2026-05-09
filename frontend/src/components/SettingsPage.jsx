import { useState } from 'react';

/* ── Seed defaults ─────────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  general: {
    defaultAudience: 'frontline',
    defaultChannel:  'Viva Engage',
    timezone:        'Europe/Stockholm',
    language:        'en',
    dateFormat:      'YYYY-MM-DD',
  },
  ai: {
    preferredModel:        'gemini-1.5-pro',
    toneDefault:           'Reassuring',
    aiAggressiveness:      'medium',
    autoSimplification:    'moderate',
    confidenceThreshold:   80,
    enableExplainability:  true,
    enableCompliance:      true,
  },
  channels: {
    teamsWebhook:       '',
    slackWebhook:       '',
    vivaEngageToken:    '',
    emailSmtpHost:      '',
    emailSmtpPort:      '587',
    emailFromAddress:   '',
  },
  notifications: {
    emailAlerts:           true,
    approvalNotifications: true,
    publishConfirmations:  true,
    digestFrequency:       'daily',
    alertEmail:            '',
  },
  security: {
    apiKey:          'elx-••••••••••••••••',
    sessionTimeout:  '8h',
    rbacRole:        'editor',
    mfaEnabled:      false,
    ssoProvider:     'azure-ad',
  },
};

const TABS = [
  { key: 'general',       icon: '',  label: 'General'           },
  { key: 'ai',            icon: '',  label: 'AI Preferences'    },
  { key: 'channels',      icon: '📡',  label: 'Channels'          },
  { key: 'notifications', icon: '',  label: 'Notifications'     },
  { key: 'security',      icon: '',  label: 'Security'          },
];

/* ── Reusable field components ──────────────────────────────────────── */
function SettingRow({ label, hint, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-label">
        <span className="settings-row-title">{label}</span>
        {hint && <span className="settings-row-hint">{hint}</span>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">{title}</h3>
      <div className="settings-section-body">{children}</div>
    </div>
  );
}

/* ── Tab panels ─────────────────────────────────────────────────────── */
function GeneralTab({ data, onChange }) {
  return (
    <>
      <SettingSection title="Communication Defaults">
        <SettingRow label="Default Audience" hint="Pre-selected audience for new messages">
          <select className="settings-select" value={data.defaultAudience} onChange={e => onChange('defaultAudience', e.target.value)}>
            <option value="frontline">Frontline Workers</option>
            <option value="office">Office Employees</option>
            <option value="it">IT Staff</option>
            <option value="executives">Executives</option>
            <option value="partners">External Partners</option>
          </select>
        </SettingRow>
        <SettingRow label="Default Channel" hint="Default publish destination">
          <select className="settings-select" value={data.defaultChannel} onChange={e => onChange('defaultChannel', e.target.value)}>
            <option value="Viva Engage">Viva Engage</option>
            <option value="Microsoft Teams">Microsoft Teams</option>
            <option value="Slack">Slack</option>
            <option value="Email">Email</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Localisation">
        <SettingRow label="Timezone" hint="Used for scheduling and timestamps">
          <select className="settings-select" value={data.timezone} onChange={e => onChange('timezone', e.target.value)}>
            {['Europe/Stockholm','Europe/London','America/New_York','America/Chicago','America/Los_Angeles','Asia/Singapore'].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow label="Default Language" hint="Language for AI-generated content">
          <select className="settings-select" value={data.language} onChange={e => onChange('language', e.target.value)}>
            <option value="en">English</option>
            <option value="sv">Swedish</option>
            <option value="de">German</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="zh">Chinese (Simplified)</option>
          </select>
        </SettingRow>
        <SettingRow label="Date Format">
          <select className="settings-select" value={data.dateFormat} onChange={e => onChange('dateFormat', e.target.value)}>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
          </select>
        </SettingRow>
      </SettingSection>
    </>
  );
}

function AITab({ data, onChange }) {
  return (
    <>
      <SettingSection title="Model & Quality">
        <SettingRow label="Preferred AI Model" hint="Model used for all transformations">
          <select className="settings-select" value={data.preferredModel} onChange={e => onChange('preferredModel', e.target.value)}>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Faster)</option>
            <option value="gpt-4o">GPT-4o (OpenAI)</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet (Anthropic)</option>
          </select>
        </SettingRow>
        <SettingRow label="AI Confidence Threshold" hint={`Warn below ${data.confidenceThreshold}% confidence`}>
          <div className="settings-range-wrap">
            <input
              type="range" min={50} max={99}
              value={data.confidenceThreshold}
              onChange={e => onChange('confidenceThreshold', Number(e.target.value))}
              className="settings-range"
            />
            <span className="settings-range-val">{data.confidenceThreshold}%</span>
          </div>
        </SettingRow>
        <SettingRow label="AI Aggressiveness" hint="How boldly the AI simplifies content">
          <select className="settings-select" value={data.aiAggressiveness} onChange={e => onChange('aiAggressiveness', e.target.value)}>
            <option value="conservative">Conservative — minimal changes</option>
            <option value="medium">Medium — balanced</option>
            <option value="aggressive">Aggressive — full rewrite</option>
          </select>
        </SettingRow>
        <SettingRow label="Auto-Simplification Level" hint="Target reading level for frontline workers">
          <select className="settings-select" value={data.autoSimplification} onChange={e => onChange('autoSimplification', e.target.value)}>
            <option value="minimal">Minimal — technical tone preserved</option>
            <option value="moderate">Moderate — plain English</option>
            <option value="maximum">Maximum — simplest language</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Tone & Style">
        <SettingRow label="Default Tone">
          <select className="settings-select" value={data.toneDefault} onChange={e => onChange('toneDefault', e.target.value)}>
            {['Reassuring','Urgent','Formal','Friendly','Neutral','Technical'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Governance">
        <SettingRow label="AI Explainability Panel" hint="Show reasoning behind AI decisions in Step 2">
          <label className="settings-toggle">
            <input type="checkbox" checked={data.enableExplainability} onChange={e => onChange('enableExplainability', e.target.checked)} />
            <span className="settings-toggle-track" />
            <span className="settings-toggle-label">{data.enableExplainability ? 'Enabled' : 'Disabled'}</span>
          </label>
        </SettingRow>
        <SettingRow label="Compliance Panel" hint="Run automatic compliance checks in Step 2">
          <label className="settings-toggle">
            <input type="checkbox" checked={data.enableCompliance} onChange={e => onChange('enableCompliance', e.target.checked)} />
            <span className="settings-toggle-track" />
            <span className="settings-toggle-label">{data.enableCompliance ? 'Enabled' : 'Disabled'}</span>
          </label>
        </SettingRow>
      </SettingSection>
    </>
  );
}

function ChannelsTab({ data, onChange }) {
  const [showKeys, setShowKeys] = useState({});
  const toggle = key => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));

  function SecretInput({ field, placeholder }) {
    const shown = showKeys[field];
    return (
      <div className="settings-secret-wrap">
        <input
          className="settings-input settings-input--secret"
          type={shown ? 'text' : 'password'}
          value={data[field]}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
        />
        <button className="settings-secret-toggle" type="button" onClick={() => toggle(field)}>
          {shown ? '🙈' : '👁️'}
        </button>
      </div>
    );
  }

  return (
    <>
      <SettingSection title="Microsoft Teams">
        <SettingRow label="Incoming Webhook URL" hint="Used for Teams posting via webhook">
          <SecretInput field="teamsWebhook" placeholder="https://…webhook.office.com/…" />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Slack">
        <SettingRow label="Slack Webhook URL" hint="Slack Bot webhook for posting messages">
          <SecretInput field="slackWebhook" placeholder="https://hooks.slack.com/services/…" />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Viva Engage">
        <SettingRow label="Viva Engage API Token" hint="Token for posting to Viva Engage communities">
          <SecretInput field="vivaEngageToken" placeholder="Bearer token…" />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Email (SMTP)">
        <SettingRow label="SMTP Host">
          <input className="settings-input" value={data.emailSmtpHost} onChange={e => onChange('emailSmtpHost', e.target.value)} placeholder="smtp.office365.com" />
        </SettingRow>
        <SettingRow label="SMTP Port">
          <input className="settings-input settings-input--sm" value={data.emailSmtpPort} onChange={e => onChange('emailSmtpPort', e.target.value)} placeholder="587" />
        </SettingRow>
        <SettingRow label="From Address">
          <input className="settings-input" value={data.emailFromAddress} onChange={e => onChange('emailFromAddress', e.target.value)} placeholder="ai-comms@electrolux.com" />
        </SettingRow>
      </SettingSection>
    </>
  );
}

function NotificationsTab({ data, onChange }) {
  return (
    <>
      <SettingSection title="Alert Preferences">
        <SettingRow label="Email Alerts" hint="Receive email for critical events">
          <label className="settings-toggle">
            <input type="checkbox" checked={data.emailAlerts} onChange={e => onChange('emailAlerts', e.target.checked)} />
            <span className="settings-toggle-track" />
            <span className="settings-toggle-label">{data.emailAlerts ? 'On' : 'Off'}</span>
          </label>
        </SettingRow>
        <SettingRow label="Approval Notifications" hint="Notify when approval is requested or completed">
          <label className="settings-toggle">
            <input type="checkbox" checked={data.approvalNotifications} onChange={e => onChange('approvalNotifications', e.target.checked)} />
            <span className="settings-toggle-track" />
            <span className="settings-toggle-label">{data.approvalNotifications ? 'On' : 'Off'}</span>
          </label>
        </SettingRow>
        <SettingRow label="Publish Confirmations" hint="Notify when a message is published">
          <label className="settings-toggle">
            <input type="checkbox" checked={data.publishConfirmations} onChange={e => onChange('publishConfirmations', e.target.checked)} />
            <span className="settings-toggle-track" />
            <span className="settings-toggle-label">{data.publishConfirmations ? 'On' : 'Off'}</span>
          </label>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Digest Settings">
        <SettingRow label="Digest Frequency" hint="How often to receive a summary digest">
          <select className="settings-select" value={data.digestFrequency} onChange={e => onChange('digestFrequency', e.target.value)}>
            <option value="realtime">Real-time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="never">Never</option>
          </select>
        </SettingRow>
        <SettingRow label="Alert Email Address" hint="Where to send notification emails">
          <input className="settings-input" value={data.alertEmail} onChange={e => onChange('alertEmail', e.target.value)} placeholder="your.name@electrolux.com" type="email" />
        </SettingRow>
      </SettingSection>
    </>
  );
}

function SecurityTab({ data, onChange }) {
  const [copied, setCopied] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);

  function copyKey() {
    if (data.apiKey && !data.apiKey.includes('•')) {
      navigator.clipboard.writeText(data.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function regenerateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const key = 'elx-' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    onChange('apiKey', key);
  }

  return (
    <>
      <SettingSection title="API Access">
        <SettingRow label="API Key" hint="Use this key to authenticate backend API calls">
          <div className="settings-secret-wrap">
            <input
              className="settings-input settings-input--secret settings-input--mono"
              type={keyVisible ? 'text' : 'password'}
              value={data.apiKey}
              readOnly
            />
            <button className="settings-secret-toggle" type="button" onClick={() => setKeyVisible(v => !v)}>
              {keyVisible ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="settings-api-actions">
            <button className="btn-link" onClick={copyKey}>{copied ? '✓ Copied' : '⎘ Copy'}</button>
            <span className="settings-sep">·</span>
            <button className="btn-link btn-link--danger" onClick={regenerateKey}>↺ Regenerate</button>
          </div>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Access Control">
        <SettingRow label="Your Role" hint="RBAC role assigned to your account">
          <select className="settings-select" value={data.rbacRole} onChange={e => onChange('rbacRole', e.target.value)}>
            <option value="viewer">Viewer — read-only</option>
            <option value="editor">Editor — create &amp; edit</option>
            <option value="publisher">Publisher — can publish</option>
            <option value="admin">Admin — full access</option>
          </select>
        </SettingRow>
        <SettingRow label="MFA" hint="Multi-factor authentication">
          <label className="settings-toggle">
            <input type="checkbox" checked={data.mfaEnabled} onChange={e => onChange('mfaEnabled', e.target.checked)} />
            <span className="settings-toggle-track" />
            <span className="settings-toggle-label">{data.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </SettingRow>
        <SettingRow label="SSO Provider" hint="Identity provider for single sign-on">
          <select className="settings-select" value={data.ssoProvider} onChange={e => onChange('ssoProvider', e.target.value)}>
            <option value="azure-ad">Azure AD (Microsoft)</option>
            <option value="auth0">Auth0</option>
            <option value="okta">Okta</option>
            <option value="saml">Generic SAML 2.0</option>
          </select>
        </SettingRow>
        <SettingRow label="Session Timeout" hint="Auto logout after this period of inactivity">
          <select className="settings-select" value={data.sessionTimeout} onChange={e => onChange('sessionTimeout', e.target.value)}>
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
            <option value="8h">8 hours (standard)</option>
            <option value="24h">24 hours</option>
          </select>
        </SettingRow>
      </SettingSection>
    </>
  );
}

/* ── SettingsPage ─────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [activeTab, setActiveTab]   = useState('general');
  const [settings,  setSettings]    = useState(DEFAULT_SETTINGS);
  const [saved,     setSaved]       = useState(false);
  const [dirty,     setDirty]       = useState(false);

  function handleChange(tab, key, value) {
    setSettings(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: value },
    }));
    setDirty(true);
    setSaved(false);
  }

  function handleSave() {
    // In a real app: PUT /api/settings
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setSettings(DEFAULT_SETTINGS);
    setDirty(false);
    setSaved(false);
  }

  const tabChange = (key, value) => handleChange(activeTab, key, value);

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="settings-page-header">
        <div>
          <h1 className="settings-page-title">Settings</h1>
          <p className="settings-page-subtitle">Configure your AI preferences, integrations, and notification rules.</p>
        </div>
        <div className="settings-header-actions">
          {dirty && (
            <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
          )}
          <button
            className={`btn btn-primary ${saved ? 'btn--saved' : ''}`}
            onClick={handleSave}
            disabled={!dirty}
          >
            {saved ? '✓ Saved' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* Saved banner */}
      {saved && (
        <div className="settings-saved-banner">✓ Settings saved successfully.</div>
      )}

      <div className="settings-layout">

        {/* ── Tab nav ── */}
        <nav className="settings-tabs-nav" aria-label="Settings tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`settings-tab-btn ${activeTab === tab.key ? 'settings-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              aria-selected={activeTab === tab.key}
            >
              <span className="settings-tab-icon">{tab.icon}</span>
              <span className="settings-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Panel ── */}
        <div className="settings-panel">
          {activeTab === 'general'       && <GeneralTab       data={settings.general}       onChange={(k, v) => handleChange('general', k, v)}       />}
          {activeTab === 'ai'            && <AITab            data={settings.ai}            onChange={(k, v) => handleChange('ai', k, v)}            />}
          {activeTab === 'channels'      && <ChannelsTab      data={settings.channels}      onChange={(k, v) => handleChange('channels', k, v)}      />}
          {activeTab === 'notifications' && <NotificationsTab data={settings.notifications} onChange={(k, v) => handleChange('notifications', k, v)} />}
          {activeTab === 'security'      && <SecurityTab      data={settings.security}      onChange={(k, v) => handleChange('security', k, v)}      />}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import './App.css';
import './screens.css';

import Sidebar            from './components/Sidebar';
import StepIndicator      from './components/StepIndicator';
import Step1_InputForm    from './components/Step1_InputForm';
import Step2_ReviewPanel  from './components/Step2_ReviewPanel';
import Step3_PublishPanel from './components/Step3_PublishPanel';
import DashboardPage      from './components/DashboardPage';
import HistoryPage        from './components/HistoryPage';
import TemplatesPage      from './components/TemplatesPage';
import SettingsPage       from './components/SettingsPage';
import AnalyticsPage      from './components/AnalyticsPage';
import AuditLogsPage      from './components/AuditLogsPage';

import { transformMessage, publishMessage, publishToTeams } from './services/api';

/* ── Audience display name map ───────────────────────────────────── */
const AUDIENCE_LABELS = {
  frontline:  'Frontline Workers',
  office:     'Office Employees',
  it:         'IT Staff',
  executives: 'Executives',
  partners:   'External Partners',
};

const STEP_LABELS = {
  1: 'Input Your Message',
  2: 'Review AI Output',
  3: 'Publish'
};

/**
 * Derive a short title from a raw technical message.
 * Takes the first sentence or first 80 characters.
 */
function deriveTitle(raw) {
  const firstSentence = raw.split(/[.\n]/)[0].trim();
  if (firstSentence.length >= 10 && firstSentence.length <= 90) return firstSentence;
  return raw.slice(0, 80).trim() + (raw.length > 80 ? '…' : '');
}

/**
 * Build a human-readable AI summary from the transformed sections.
 */
function buildAiSummary(tm, audienceLabel, channelName) {
  const happening   = (tm?.what_is_happening     || '').slice(0, 80).trim();
  const actionNeeded = (tm?.what_you_need_to_do  || '').slice(0, 60).trim();
  const parts = [];
  if (happening)    parts.push(`Summary: "${happening}…"`);
  if (actionNeeded) parts.push(`Action: "${actionNeeded}…"`);
  parts.push(`Audience: ${audienceLabel}. Channel: ${channelName}.`);
  return parts.join(' ');
}

/**
 * Deterministic confidence score (85–97) based on entry id.
 */
function calcConfidence(id) {
  return 85 + (id * 7 + 3) % 13;
}

export default function App() {
  // ── Layout state ──────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false); // mobile
  const [activeNavItem,    setActiveNavItem]     = useState('dashboard');
  const [userRole,         setUserRole]          = useState('admin'); // 'admin' | 'user'

  // 'dashboard' | 'wizard' | 'history' | 'templates' | 'settings' | 'analytics' | 'audit-logs'
  const [activeView, setActiveView] = useState('dashboard');

  // ── Communications history (dynamic dashboard data) ───────────────
  const [communications, setCommunications] = useState([]);
  const commIdCounter = useRef(0);        // monotonically increasing id
  const currentCommId = useRef(null);     // id of the comm being worked on

  // ── Wizard state ──────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);

  // ── Step 1 state ──────────────────────────────────────────────────
  const [rawMessage, setRawMessage] = useState('');
  const [audience,   setAudience]   = useState('frontline');
  const [channel,    setChannel]    = useState('Viva Engage');
  const [tone,       setTone]       = useState('Reassuring');
  const [language,   setLanguage]   = useState('en');

  // ── Step 2 state ──────────────────────────────────────────────────
  const [transformedMessage, setTransformedMessage] = useState(null);

  // ── Step 3 state ──────────────────────────────────────────────────
  const [publishStatus, setPublishStatus] = useState(null);  // null | 'success' | 'error'
  const [publishResult, setPublishResult] = useState(null);

  // ── Shared async state ────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────

  async function handleTransform() {
    setError(null);
    setIsLoading(true);
    try {
      const result = await transformMessage(rawMessage, audience, channel, tone, language);
      if (result.success) {
        setTransformedMessage(result.transformedMessage);
        setCurrentStep(2);

        // ── Record a new Draft communication ──
        const newId = ++commIdCounter.current;
        currentCommId.current = newId;
        const audienceLabel = AUDIENCE_LABELS[audience] || audience;
        const initialSnapshot = {
          version:            1,
          updatedAt:          new Date().toISOString(),
          transformedMessage: result.transformedMessage,
          aiSummary:          buildAiSummary(result.transformedMessage, audienceLabel, channel),
        };
        const newComm = {
          id:               newId,
          title:            deriveTitle(rawMessage),
          audience:         audienceLabel,
          channel,
          tone,
          language,
          status:           'Draft',
          version:          1,
          versions:         [initialSnapshot],
          updated:          new Date().toISOString(),
          transformedMessage: result.transformedMessage,
          confidence:       calcConfidence(newId),
          aiSummary:        buildAiSummary(result.transformedMessage, audienceLabel, channel),
          publishedAt:      null,
        };
        setCommunications(prev => [newComm, ...prev]);

      } else {
        setError(result.error || 'AI transformation failed. Please try again.');
      }
    } catch {
      setError('Could not reach the backend. Is it running on http://localhost:3001?');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerate() {
    setError(null);
    setIsLoading(true);
    try {
      const result = await transformMessage(rawMessage, audience, channel, tone, language);
      if (result.success) {
        setTransformedMessage(result.transformedMessage);

        // ── Update the current Draft with refreshed AI output + version bump ──
        const audienceLabel = AUDIENCE_LABELS[audience] || audience;
        setCommunications(prev => prev.map(c => {
          if (c.id !== currentCommId.current) return c;
          const newVersion = (c.version || 1) + 1;
          const snapshot = {
            version:            newVersion,
            updatedAt:          new Date().toISOString(),
            transformedMessage: result.transformedMessage,
            aiSummary:          buildAiSummary(result.transformedMessage, audienceLabel, channel),
          };
          return {
            ...c,
            version:            newVersion,
            versions:           [...(c.versions || [{
                version:            c.version || 1,
                updatedAt:          c.updated,
                transformedMessage: c.transformedMessage,
                aiSummary:          c.aiSummary,
              }]), snapshot],
            transformedMessage: result.transformedMessage,
            aiSummary:          buildAiSummary(result.transformedMessage, audienceLabel, channel),
            updated:            new Date().toISOString(),
          };
        }));
      } else {
        setError(result.error || 'Regeneration failed. Please try again.');
      }
    } catch {
      setError('Could not reach the backend. Is it running on http://localhost:3001?');
    } finally {
      setIsLoading(false);
    }
  }

  function handleApprove() {
    setError(null);
    setPublishStatus(null);
    setPublishResult(null);
    setCurrentStep(3);
  }

  async function handlePublish(selectedChannel, scheduledAt, teamsWebhookUrl) {
    setError(null);
    setIsLoading(true);
    try {
      let result;
      if (selectedChannel === 'Microsoft Teams') {
        result = await publishToTeams(transformedMessage, selectedChannel, audience, scheduledAt, teamsWebhookUrl);
      } else {
        result = await publishMessage(transformedMessage, selectedChannel, audience, scheduledAt);
      }
      if (result.success) {
        setPublishResult(result);
        setPublishStatus('success');

        // ── Update comm to Published or Scheduled ──
        const newStatus = scheduledAt ? 'Scheduled' : 'Published';
        setCommunications(prev => prev.map(c =>
          c.id === currentCommId.current
            ? {
                ...c,
                status:      newStatus,
                channel:     selectedChannel,
                updated:     new Date().toISOString(),
                publishedAt: result.publishedAt || new Date().toISOString(),
              }
            : c
        ));
      } else {
        setError(result.error || 'Publish failed. Please try again.');
        setPublishStatus('error');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not reach the backend. Is it running on http://localhost:3001?');
      setPublishStatus('error');
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setCurrentStep(1);
    setRawMessage('');
    setAudience('frontline');
    setChannel('Viva Engage');
    setTone('Reassuring');
    setLanguage('en');
    setTransformedMessage(null);
    setPublishStatus(null);
    setPublishResult(null);
    setError(null);
    setIsLoading(false);
    currentCommId.current = null;
    setActiveNavItem('new');
    setActiveView('wizard');
  }

  /* ── History: Edit — pre-fill Step 1 from an existing comm ── */
  function handleHistoryEdit(comm) {
    // find the audience key from label
    const audienceKey = Object.entries(AUDIENCE_LABELS)
      .find(([, v]) => v === comm.audience)?.[0] || 'frontline';
    setCurrentStep(1);
    setRawMessage('');                    // raw source is not stored, leave blank
    setAudience(audienceKey);
    setChannel(comm.channel || 'Viva Engage');
    setTone(comm.tone || 'Reassuring');
    setLanguage(comm.language || 'en');
    setTransformedMessage(null);
    setPublishStatus(null);
    setPublishResult(null);
    setError(null);
    currentCommId.current = comm.id;     // editing existing entry
    setActiveNavItem('new');
    setActiveView('wizard');
  }

  /* ── History: Duplicate ── */
  function handleHistoryDuplicate(comm) {
    const newId = ++commIdCounter.current;
    const copy = {
      ...comm,
      id:          newId,
      title:       `${comm.title} (Copy)`,
      status:      'Draft',
      version:     1,
      versions:    [{
        version:            1,
        updatedAt:          new Date().toISOString(),
        transformedMessage: comm.transformedMessage,
        aiSummary:          comm.aiSummary,
      }],
      updated:     new Date().toISOString(),
      publishedAt: null,
    };
    setCommunications(prev => [copy, ...prev]);
  }

  /* ── History: Republish — jump to Step 3 with this comm's content ── */
  function handleHistoryRepublish(comm) {
    const audienceKey = Object.entries(AUDIENCE_LABELS)
      .find(([, v]) => v === comm.audience)?.[0] || 'frontline';
    setAudience(audienceKey);
    setChannel(comm.channel || 'Viva Engage');
    setTone(comm.tone || 'Reassuring');
    setLanguage(comm.language || 'en');
    setTransformedMessage(comm.transformedMessage);
    setPublishStatus(null);
    setPublishResult(null);
    setError(null);
    currentCommId.current = comm.id;
    setCurrentStep(3);
    setActiveNavItem('new');
    setActiveView('wizard');
  }

  /* ── History: Delete ── */
  function handleHistoryDelete(id) {
    setCommunications(prev => prev.filter(c => c.id !== id));
  }

  /* ── Per-section regeneration ── */
  async function handleRegenerateSection(sectionKey) {
    setError(null);
    try {
      const result = await transformMessage(rawMessage, audience, channel, tone, language);
      if (result.success) {
        // Only update the specific section key
        setTransformedMessage(prev => ({
          ...prev,
          [sectionKey]: result.transformedMessage?.[sectionKey] ?? prev?.[sectionKey],
        }));
        // Update the comm entry's single section
        const audienceLabel = AUDIENCE_LABELS[audience] || audience;
        setCommunications(prev => prev.map(c => {
          if (c.id !== currentCommId.current) return c;
          const updatedTM = {
            ...c.transformedMessage,
            [sectionKey]: result.transformedMessage?.[sectionKey] ?? c.transformedMessage?.[sectionKey],
          };
          return {
            ...c,
            transformedMessage: updatedTM,
            aiSummary: buildAiSummary(updatedTM, audienceLabel, channel),
            updated: new Date().toISOString(),
          };
        }));
      }
    } catch {
      setError('Could not reach the backend. Is it running on http://localhost:3001?');
    }
  }

  /* ── History: Restore previous version ── */
  function handleHistoryRestore(id, versionSnapshot) {
    setCommunications(prev => prev.map(c => {
      if (c.id !== id) return c;
      // Trim versions array to up to and including the restored version,
      // then add a new "restored" snapshot
      const trimmed = (c.versions || []).filter(v => v.version <= versionSnapshot.version);
      const newVersion = (c.version || 1) + 1;
      const restoredSnapshot = {
        version:            newVersion,
        updatedAt:          new Date().toISOString(),
        transformedMessage: versionSnapshot.transformedMessage,
        aiSummary:          versionSnapshot.aiSummary,
      };
      return {
        ...c,
        version:            newVersion,
        versions:           [...trimmed, restoredSnapshot],
        transformedMessage: versionSnapshot.transformedMessage,
        aiSummary:          versionSnapshot.aiSummary,
        updated:            new Date().toISOString(),
      };
    }));
  }

  /**
   * Stepper click-back: allow navigating to any completed step.
   * Preserves all state — only changes currentStep.
   */
  function handleStepClick(stepNumber) {
    if (stepNumber < currentStep) {
      setError(null);
      setCurrentStep(stepNumber);
    }
  }

  /* ── Save Draft (Step 3) ── */
  function handleSaveDraft() {
    // Mark current comm as Draft (already Draft by default, just surface the flash)
    setCommunications(prev => prev.map(c =>
      c.id === currentCommId.current
        ? { ...c, status: 'Draft', updated: new Date().toISOString() }
        : c
    ));
  }

  /* ── Templates: use template → pre-fill Step 1 raw message ── */
  function handleUseTemplate(filledText) {
    setCurrentStep(1);
    setRawMessage(filledText);
    setTransformedMessage(null);
    setPublishStatus(null);
    setPublishResult(null);
    setError(null);
    currentCommId.current = null;
    setActiveNavItem('new');
    setActiveView('wizard');
  }

  // ── Layout classes ────────────────────────────────────────────────
  const shellClasses = [
    'layout-shell',
    sidebarCollapsed ? 'sidebar-collapsed' : '',
    sidebarOpen      ? 'sidebar-open'      : ''
  ].filter(Boolean).join(' ');

  // Show the stepper only when the wizard is active and not yet success
  const showStepper = activeView === 'wizard' && publishStatus !== 'success';
  // Full-bleed views — no topbar step badge, no card wrapper
  const isDashboard  = activeView === 'dashboard';
  const isHistory    = activeView === 'history';
  const isTemplates  = activeView === 'templates';
  const isSettings   = activeView === 'settings';
  const isAnalytics  = activeView === 'analytics';
  const isAuditLogs  = activeView === 'audit-logs';
  const isFullBleed  = isDashboard || isHistory || isTemplates || isSettings || isAnalytics || isAuditLogs;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className={shellClasses}>

      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        activeItem={activeNavItem}
        userRole={userRole}
        onItemClick={key => {
          setActiveNavItem(key);
          setSidebarOpen(false); // close mobile drawer on selection

          if (key === 'dashboard') {
            setActiveView('dashboard');
            return;
          }

          if (key === 'new') {
            // Full reset → start a new communication
            handleReset();
            return;
          }

          // Channel shortcuts → pre-select that channel and go to wizard Step 1
          const CHANNEL_MAP = {
            viva:  'Viva Engage',
            teams: 'Microsoft Teams',
            slack: 'Slack',
          };
          if (CHANNEL_MAP[key]) {
            setCurrentStep(1);
            setChannel(CHANNEL_MAP[key]);
            setTransformedMessage(null);
            setPublishStatus(null);
            setPublishResult(null);
            setError(null);
            setActiveView('wizard');
            return;
          }

          // Placeholder & admin pages
          if (['history', 'templates', 'settings', 'analytics', 'audit-logs'].includes(key)) {
            setActiveView(key);
            return;
          }
        }}
      />

      {/* ── Main content ── */}
      <div className="main-content">

        {/* Top bar — hide step badge on dashboard/history */}
        <header className="main-topbar">
          <div className="topbar-left">
            <button
              className="topbar-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <span className="topbar-heading">
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'wizard' && 'New Communication'}
              {activeView === 'history' && 'History'}
              {activeView === 'templates' && 'Templates'}
              {activeView === 'settings' && 'Settings'}
              {activeView === 'analytics' && 'Analytics'}
              {activeView === 'audit-logs' && 'Audit Logs'}
            </span>
          </div>
          <div className="topbar-right">
            {!isFullBleed && showStepper && (
              <span className="step-badge">
                Step {currentStep} of 3 — {STEP_LABELS[currentStep]}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)' }}>
              <select 
                value={userRole} 
                onChange={(e) => {
                  setUserRole(e.target.value);
                  if (e.target.value === 'user' && ['settings', 'analytics', 'audit-logs'].includes(activeView)) {
                    setActiveView('dashboard');
                    setActiveNavItem('dashboard');
                  }
                }}
                style={{ 
                  background: 'var(--bg-card)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '4px', 
                  padding: '4px 8px', 
                  fontSize: '12px',
                  height: 'auto'
                }}
              >
                <option value="admin">Admin View</option>
                <option value="user">User View</option>
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>System Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Step progress bar — wizard only */}
        {showStepper && (
          <StepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        )}

        {/* ── Dashboard — full-width, no card wrapper ── */}
        {isDashboard && (
          <DashboardPage
            communications={communications}
            onNewCommunication={() => {
              handleReset();
              setActiveNavItem('new');
            }}
          />
        )}

        {/* ── History — full-width, no card wrapper ── */}
        {isHistory && (
          <HistoryPage
            communications={communications}
            onEdit={handleHistoryEdit}
            onDuplicate={handleHistoryDuplicate}
            onRepublish={handleHistoryRepublish}
            onDelete={handleHistoryDelete}
            onRestore={handleHistoryRestore}
            onNewCommunication={() => {
              handleReset();
              setActiveNavItem('new');
            }}
          />
        )}

        {/* ── Templates — full-width ── */}
        {isTemplates && (
          <div className="fullbleed-page-wrap">
            <TemplatesPage onUseTemplate={handleUseTemplate} />
          </div>
        )}

        {/* ── Settings — full-width ── */}
        {isSettings && (
          <div className="fullbleed-page-wrap">
            <SettingsPage />
          </div>
        )}

        {/* ── Analytics — full-width ── */}
        {isAnalytics && (
          <div className="fullbleed-page-wrap">
            <AnalyticsPage communications={communications} />
          </div>
        )}

        {/* ── Audit Logs — full-width ── */}
        {isAuditLogs && (
          <div className="fullbleed-page-wrap">
            <AuditLogsPage communications={communications} />
          </div>
        )}

        {/* ── Wizard (Steps 1-3) — constrained card layout ── */}
        {activeView === 'wizard' && (
          <main className="main-body">
            <div className="content-card">

              {currentStep === 1 && (
                <Step1_InputForm
                  rawMessage={rawMessage}
                  audience={audience}
                  channel={channel}
                  tone={tone}
                  language={language}
                  isLoading={isLoading}
                  error={error}
                  onMessageChange={setRawMessage}
                  onAudienceChange={setAudience}
                  onChannelChange={setChannel}
                  onToneChange={setTone}
                  onLanguageChange={setLanguage}
                  onTransform={handleTransform}
                />
              )}

              {currentStep === 2 && transformedMessage && (
                <Step2_ReviewPanel
                  transformedMessage={transformedMessage}
                  audience={audience}
                  tone={tone}
                  language={language}
                  isLoading={isLoading}
                  error={error}
                  onMessageChange={setTransformedMessage}
                  onRegenerate={handleRegenerate}
                  onApprove={handleApprove}
                  onRegenerateSection={handleRegenerateSection}
                  confidence={
                    communications.find(c => c.id === currentCommId.current)?.confidence ?? 92
                  }
                />
              )}

              {currentStep === 3 && transformedMessage && (
                <Step3_PublishPanel
                  transformedMessage={transformedMessage}
                  audience={audience}
                  defaultChannel={channel}
                  isLoading={isLoading}
                  publishStatus={publishStatus}
                  publishResult={publishResult}
                  error={error}
                  onPublish={handlePublish}
                  onBack={() => { setError(null); setCurrentStep(2); }}
                  onReset={handleReset}
                  onSaveDraft={handleSaveDraft}
                />
              )}

            </div>
          </main>
        )}

      </div>
    </div>
  );
}

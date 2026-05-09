import { useState, useRef } from 'react';
import './App.css';

import Sidebar            from './components/Sidebar';
import StepIndicator      from './components/StepIndicator';
import Step1_InputForm    from './components/Step1_InputForm';
import Step2_ReviewPanel  from './components/Step2_ReviewPanel';
import Step3_PublishPanel from './components/Step3_PublishPanel';
import PlaceholderView    from './components/PlaceholderView';
import DashboardPage      from './components/DashboardPage';

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
        const newComm = {
          id:               newId,
          title:            deriveTitle(rawMessage),
          audience:         audienceLabel,
          channel,
          tone,
          language,
          status:           'Draft',
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

        // ── Update the current Draft with refreshed AI output ──
        const audienceLabel = AUDIENCE_LABELS[audience] || audience;
        setCommunications(prev => prev.map(c =>
          c.id === currentCommId.current
            ? {
                ...c,
                transformedMessage: result.transformedMessage,
                aiSummary: buildAiSummary(result.transformedMessage, audienceLabel, channel),
                updated: new Date().toISOString(),
              }
            : c
        ));
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
    setTransformedMessage(null);
    setPublishStatus(null);
    setPublishResult(null);
    setError(null);
    setIsLoading(false);
    currentCommId.current = null;
    setActiveNavItem('new');
    setActiveView('wizard');
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

  // ── Layout classes ────────────────────────────────────────────────
  const shellClasses = [
    'layout-shell',
    sidebarCollapsed ? 'sidebar-collapsed' : '',
    sidebarOpen      ? 'sidebar-open'      : ''
  ].filter(Boolean).join(' ');

  // Show the stepper only when the wizard is active and not yet success
  const showStepper = activeView === 'wizard' && publishStatus !== 'success';
  // Dashboard is full-bleed — no topbar step badge, no wrapper card
  const isDashboard = activeView === 'dashboard';

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className={shellClasses}>

      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        activeItem={activeNavItem}
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

        {/* Top bar — hide step badge on dashboard */}
        <header className="main-topbar">
          <div className="topbar-left">
            <button
              className="topbar-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <span className="topbar-heading">🤖 AI Communication Agent</span>
          </div>
          {!isDashboard && (
            <div className="topbar-right">
              {showStepper && (
                <span className="step-badge">
                  Step {currentStep} of 3 — {STEP_LABELS[currentStep]}
                </span>
              )}
            </div>
          )}
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

        {/* ── All other views — constrained card layout ── */}
        {!isDashboard && (
          <main className="main-body">
            <div className="content-card">

              {/* Wizard steps */}
              {activeView === 'wizard' && currentStep === 1 && (
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

              {activeView === 'wizard' && currentStep === 2 && transformedMessage && (
                <Step2_ReviewPanel
                  transformedMessage={transformedMessage}
                  audience={audience}
                  isLoading={isLoading}
                  error={error}
                  onMessageChange={setTransformedMessage}
                  onRegenerate={handleRegenerate}
                  onApprove={handleApprove}
                />
              )}

              {activeView === 'wizard' && currentStep === 3 && transformedMessage && (
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
                />
              )}

              {/* Placeholder pages */}
              {activeView === 'history' && (
                <PlaceholderView
                  icon="📋"
                  title="Communication History"
                  teaser="Review and resend all previously published messages in one place."
                  extras={[
                    { icon: '🔍', text: 'Search & filter by audience, channel, or date' },
                    { icon: '♻️', text: 'One-click re-publish or edit past messages' },
                    { icon: '📊', text: 'Engagement metrics per communication' },
                  ]}
                />
              )}

              {activeView === 'templates' && (
                <PlaceholderView
                  icon="📄"
                  title="Message Templates"
                  teaser="Save, share, and reuse approved message blueprints across your team."
                  extras={[
                    { icon: '⭐', text: '3 saved templates ready to use' },
                    { icon: '🏷️', text: 'Tag templates by audience or campaign' },
                    { icon: '🤝', text: 'Share templates with colleagues' },
                  ]}
                />
              )}

              {activeView === 'settings' && (
                <PlaceholderView
                  icon="⚙️"
                  title="Settings"
                  teaser="Configure your AI preferences, webhook integrations, and notification rules."
                  extras={[
                    { icon: '🔑', text: 'Manage API keys and integrations' },
                    { icon: '🌐', text: 'Default language and tone preferences' },
                    { icon: '🔔', text: 'Notification and approval workflows' },
                  ]}
                />
              )}

              {activeView === 'analytics' && (
                <PlaceholderView
                  icon="📊"
                  title="Analytics Dashboard"
                  teaser="Measure the real-world impact of every AI-assisted communication."
                  extras={[
                    { icon: '📈', text: 'Engagement trends across all channels' },
                    { icon: '🎯', text: 'Audience reach and read-completion rates' },
                    { icon: '🤖', text: 'AI confidence scores and simplification metrics' },
                  ]}
                />
              )}

              {activeView === 'audit-logs' && (
                <PlaceholderView
                  icon="🔒"
                  title="Audit Logs"
                  teaser="Full governance trail — every AI action, approval, and publish event."
                  extras={[
                    { icon: '📝', text: 'Track all edits, approvals, and rejections' },
                    { icon: '🔍', text: 'Filter by user, date range, or event type' },
                    { icon: '📤', text: 'Export compliance reports as PDF or CSV' },
                  ]}
                />
              )}

            </div>
          </main>
        )}

      </div>
    </div>
  );
}

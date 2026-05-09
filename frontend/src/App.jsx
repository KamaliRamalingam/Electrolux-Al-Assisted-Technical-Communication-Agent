import { useState } from 'react';
import './App.css';

import Sidebar            from './components/Sidebar';
import StepIndicator      from './components/StepIndicator';
import Step1_InputForm    from './components/Step1_InputForm';
import Step2_ReviewPanel  from './components/Step2_ReviewPanel';
import Step3_PublishPanel from './components/Step3_PublishPanel';
import PlaceholderView    from './components/PlaceholderView';

import { transformMessage, publishMessage } from './services/api';

const STEP_LABELS = {
  1: 'Input Your Message',
  2: 'Review AI Output',
  3: 'Publish'
};

export default function App() {
  // ── Layout state ──────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false); // mobile
  const [activeNavItem,    setActiveNavItem]     = useState('new');

  // 'wizard' | 'history' | 'templates' | 'settings'
  const [activeView, setActiveView] = useState('wizard');

  // ── Wizard state ──────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);

  // ── Step 1 state ──────────────────────────────────────────────────
  const [rawMessage, setRawMessage] = useState('');
  const [audience,   setAudience]   = useState('frontline');
  const [channel,    setChannel]    = useState('Viva Engage');

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
      const result = await transformMessage(rawMessage, audience, channel);
      if (result.success) {
        setTransformedMessage(result.transformedMessage);
        setCurrentStep(2);
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
      const result = await transformMessage(rawMessage, audience, channel);
      if (result.success) {
        setTransformedMessage(result.transformedMessage);
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

  async function handlePublish(selectedChannel, scheduledAt) {
    setError(null);
    setIsLoading(true);
    try {
      const result = await publishMessage(transformedMessage, selectedChannel, audience, scheduledAt);
      if (result.success) {
        setPublishResult(result);
        setPublishStatus('success');
      } else {
        setError(result.error || 'Publish failed. Please try again.');
        setPublishStatus('error');
      }
    } catch {
      setError('Could not reach the backend. Is it running on http://localhost:3001?');
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

  const showStepper = publishStatus !== 'success';

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

          // Placeholder pages
          if (['history', 'templates', 'settings'].includes(key)) {
            setActiveView(key);
            return;
          }
        }}
      />

      {/* ── Main content ── */}
      <div className="main-content">

        {/* Top bar */}
        <header className="main-topbar">
          <div className="topbar-left">
            {/* Mobile hamburger */}
            <button
              className="topbar-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <span className="topbar-heading">🤖 AI Communication Agent</span>
          </div>
          <div className="topbar-right">
            {showStepper && (
              <span className="step-badge">
                Step {currentStep} of 3 — {STEP_LABELS[currentStep]}
              </span>
            )}
          </div>
        </header>

        {/* Step progress bar */}
        {showStepper && (
          <StepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        )}

        {/* Step content */}
        <main className="main-body">
          <div className="content-card">

            {/* ── Wizard (default view) ── */}
            {activeView === 'wizard' && currentStep === 1 && (
              <Step1_InputForm
                rawMessage={rawMessage}
                audience={audience}
                channel={channel}
                isLoading={isLoading}
                error={error}
                onMessageChange={setRawMessage}
                onAudienceChange={setAudience}
                onChannelChange={setChannel}
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

            {/* ── Placeholder pages ── */}
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

          </div>
        </main>

      </div>
    </div>
  );
}

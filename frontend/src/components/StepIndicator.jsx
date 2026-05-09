/**
 * StepIndicator — Enhanced workflow stepper
 * - Per-step icon + sub-label
 * - Animated fill connector
 * - Completed steps are clickable (navigate back)
 * - Step 3 stays visible on success with ✓ bounce
 */

const STEPS = [
  { number: 1, icon: '✏️', label: 'Input Message',  sublabel: 'Paste & configure' },
  { number: 2, icon: '🔍', label: 'Review Output',  sublabel: 'Edit & approve'    },
  { number: 3, icon: '🚀', label: 'Publish',         sublabel: 'Select & send'     }
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="step-indicator" role="navigation" aria-label="Progress">
      {STEPS.map((step, idx) => {
        const isDone   = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isLast   = idx === STEPS.length - 1;

        return (
          <div
            key={step.number}
            className="step-item"
            style={{ flex: isLast ? '0 0 auto' : 1 }}
          >
            {/* Circle */}
            <div className="step-icon-wrap">
              <div
                className={`step-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}
                onClick={isDone ? () => onStepClick?.(step.number) : undefined}
                aria-label={`Step ${step.number}: ${step.label}${isDone ? ' (completed — click to go back)' : ''}`}
                role={isDone ? 'button' : undefined}
                tabIndex={isDone ? 0 : undefined}
                onKeyDown={isDone ? e => e.key === 'Enter' && onStepClick?.(step.number) : undefined}
                title={isDone ? `Go back to ${step.label}` : step.label}
              >
                {isDone ? '✓' : step.icon}
              </div>
            </div>

            {/* Text */}
            <div className="step-text">
              <span className={`step-label ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                {step.label}
              </span>
              <span className={`step-sublabel ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                {isDone ? 'Completed' : step.sublabel}
              </span>
            </div>

            {/* Animated connector (not after last step) */}
            {!isLast && (
              <div className={`step-connector ${isDone ? 'done' : ''}`}>
                <div className="step-connector-fill" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

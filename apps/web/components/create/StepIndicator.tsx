interface Step {
  number: number;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Assignment Details' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Generate' },
];

interface Props {
  activeStep: number;
}

export default function StepIndicator({ activeStep }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const isDone = step.number < activeStep;
        const isActive = step.number === activeStep;

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isDone
                    ? 'bg-brand-orange text-white'
                    : isActive
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20'
                      : 'bg-app-surface-2 text-app-text-muted'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-app-text-primary' : 'text-app-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 mx-3 mt-[-12px] transition-colors ${
                  isDone ? 'bg-brand-orange' : 'bg-app-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

'use client';

export function TutorialOverlay({
  step,
  total,
  title,
  body,
  showNext,
  nextLabel = 'Volgende',
  onNext,
  onSkip,
}: {
  step: number;
  total: number;
  title: string;
  body: string;
  showNext: boolean;
  nextLabel?: string;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <p className="tutorial-step">
          STAP {step + 1}/{total}
        </p>
        <h3 className="tutorial-title">{title}</h3>
        <p className="tutorial-body">{body}</p>
        <div className="tutorial-actions">
          <button className="btn" onClick={onSkip}>
            Sla over
          </button>
          {showNext && (
            <button className="btn btn-primary" onClick={onNext}>
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

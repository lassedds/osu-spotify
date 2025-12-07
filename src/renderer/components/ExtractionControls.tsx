import React from 'react';
import { ExtractionProgress } from '../../types';

interface ExtractionControlsProps {
  progress: ExtractionProgress;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  canStart: boolean;
}

export const ExtractionControls: React.FC<ExtractionControlsProps> = ({
  progress,
  onStart,
  onPause,
  onResume,
  onStop,
  canStart,
}) => {
  const { status } = progress;

  return (
    <div className="controls">
      {status === 'idle' && (
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={!canStart}
        >
          Start Extraction
        </button>
      )}

      {status === 'running' && (
        <>
          <button className="btn btn-warning" onClick={onPause}>
            Pause
          </button>
          <button className="btn btn-danger" onClick={onStop}>
            Stop
          </button>
        </>
      )}

      {status === 'paused' && (
        <>
          <button className="btn btn-secondary" onClick={onResume}>
            Resume
          </button>
          <button className="btn btn-danger" onClick={onStop}>
            Stop
          </button>
        </>
      )}

      {(status === 'completed' || status === 'error') && (
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={!canStart}
        >
          Start New Extraction
        </button>
      )}
    </div>
  );
};

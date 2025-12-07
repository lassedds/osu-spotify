import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-text">
        {percentage}% ({current} / {total})
      </div>
      <div className="progress-bar" style={{ width: `${percentage}%` }} />
    </div>
  );
};

import React from 'react';
import { ExtractionProgress } from '../../types';

interface ProgressStatsProps {
  progress: ExtractionProgress;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({ progress }) => {
  return (
    <div className="progress-stats">
      <div className="stat-item">
        <label>Total Beatmaps</label>
        <div className="value">{progress.totalBeatmaps.toLocaleString()}</div>
      </div>
      <div className="stat-item">
        <label>Processed</label>
        <div className="value">{progress.processedBeatmaps.toLocaleString()}</div>
      </div>
      <div className="stat-item">
        <label>Songs Extracted</label>
        <div className="value">{progress.extractedSongs.toLocaleString()}</div>
      </div>
    </div>
  );
};

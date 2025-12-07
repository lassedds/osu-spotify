import React from 'react';
import { FolderSelector } from './components/FolderSelector';
import { ProgressBar } from './components/ProgressBar';
import { ProgressStats } from './components/ProgressStats';
import { ExtractionControls } from './components/ExtractionControls';
import { useExtraction } from './hooks/useExtraction';
import './styles/App.css';

export const App: React.FC = () => {
  const {
    osuPath,
    outputPath,
    maxFileSizeMB,
    resumeExtraction: resume,
    progress,
    setMaxFileSizeMB,
    setResumeExtraction,
    selectOsuFolder,
    selectOutputFolder,
    startExtraction,
    pauseExtraction,
    resumeExtraction,
    stopExtraction,
  } = useExtraction();

  const canStart = Boolean(osuPath && outputPath);

  return (
    <div className="app">
      <div className="header">
        <h1>🎵 osu! Song Extractor</h1>
        <p>Extract and organize your osu! music library</p>
      </div>

      <div className="card">
        <FolderSelector
          label="osu! Installation Folder"
          value={osuPath}
          onSelect={selectOsuFolder}
          placeholder="Select your osu! installation folder"
        />

        <FolderSelector
          label="Output Folder"
          value={outputPath}
          onSelect={selectOutputFolder}
          placeholder="Select where to save extracted songs"
        />

        <div className="options">
          <div className="option-row">
            <label>Max File Size (MB):</label>
            <input
              type="number"
              value={maxFileSizeMB}
              onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
              min="1"
              max="500"
              disabled={progress.status === 'running'}
            />
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              (Leave blank or 0 for no limit)
            </span>
          </div>

          <div className="option-row">
            <label>Resume Previous Extraction:</label>
            <input
              type="checkbox"
              checked={resume}
              onChange={(e) => setResumeExtraction(e.target.checked)}
              disabled={progress.status === 'running'}
            />
          </div>
        </div>

        <ExtractionControls
          progress={progress}
          onStart={startExtraction}
          onPause={pauseExtraction}
          onResume={resumeExtraction}
          onStop={stopExtraction}
          canStart={canStart}
        />
      </div>

      {progress.status !== 'idle' && (
        <div className="card">
          <div className="progress-section">
            <span className={`status ${progress.status}`}>
              {progress.status}
            </span>

            <ProgressBar
              current={progress.processedBeatmaps}
              total={progress.totalBeatmaps}
            />

            <ProgressStats progress={progress} />

            {progress.currentBeatmap && (
              <div className="current-file">
                Currently processing: {progress.currentBeatmap}
              </div>
            )}

            {progress.errors.length > 0 && (
              <div className="error-list">
                <h4>Errors:</h4>
                <ul>
                  {progress.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

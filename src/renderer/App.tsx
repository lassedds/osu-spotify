import React from 'react';
import { FolderSelector } from './components/FolderSelector';
import { ProgressBar } from './components/ProgressBar';
import { ProgressStats } from './components/ProgressStats';
import { ExtractionControls } from './components/ExtractionControls';
import { BeatmapList } from './components/BeatmapList';
import { useExtraction } from './hooks/useExtraction';
import './styles/App.css';

export const App: React.FC = () => {
  const {
    osuPath,
    outputPath,
    maxFileSizeMB,
    maxBeatmaps,
    resumeExtraction: resume,
    beatmaps,
    isScanning,
    progress,
    setMaxFileSizeMB,
    setMaxBeatmaps,
    setResumeExtraction,
    setBeatmaps,
    selectOsuFolder,
    selectOutputFolder,
    scanBeatmaps,
    startExtraction,
    pauseExtraction,
    resumeExtraction,
    stopExtraction,
  } = useExtraction();

  const canStart = Boolean(osuPath && outputPath);
  const canScan = Boolean(osuPath) && progress.status === 'idle' && !isScanning;

  return (
    <div className="app">
      <div className="header">
        <h1>🎵 osu! to Spotify Converter</h1>
        <p>Extract and organize your osu! music library for Spotify</p>
      </div>

      <div className="glass-card">
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

        <div className="options-grid">
          <div className="option-item">
            <label>Max File Size (MB)</label>
            <input
              type="number"
              value={maxFileSizeMB || ''}
              onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
              placeholder="0 = no limit"
              min="0"
              max="500"
              disabled={progress.status === 'running'}
            />
          </div>

          <div className="option-item">
            <label>Max Beatmaps to Extract</label>
            <select
              value={maxBeatmaps}
              onChange={(e) => setMaxBeatmaps(Number(e.target.value))}
              disabled={progress.status === 'running'}
            >
              <option value={0}>All Beatmaps</option>
              <option value={100}>100 Beatmaps</option>
              <option value={500}>500 Beatmaps</option>
              <option value={1000}>1000 Beatmaps</option>
              <option value={5000}>5000 Beatmaps</option>
            </select>
          </div>
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="resume"
            checked={resume}
            onChange={(e) => setResumeExtraction(e.target.checked)}
            disabled={progress.status === 'running'}
          />
          <label htmlFor="resume">Resume previous extraction (skip already extracted songs)</label>
        </div>

        {osuPath && beatmaps.length === 0 && (
          <div className="control-row">
            <button
              className="btn btn-primary"
              onClick={scanBeatmaps}
              disabled={!canScan}
            >
              {isScanning ? 'Scanning...' : 'Scan Beatmaps'}
            </button>
          </div>
        )}

        <ExtractionControls
          progress={progress}
          onStart={startExtraction}
          onPause={pauseExtraction}
          onResume={resumeExtraction}
          onStop={stopExtraction}
          canStart={canStart}
        />
      </div>

      {beatmaps.length > 0 && progress.status === 'idle' && (
        <div className="glass-card">
          <h3 style={{ color: 'white', marginBottom: '16px' }}>Select Beatmaps to Extract</h3>
          <BeatmapList beatmaps={beatmaps} onSelectionChange={setBeatmaps} />
        </div>
      )}

      {(progress.status === 'running' || progress.status === 'paused' || progress.status === 'completed' || progress.status === 'error') && (
        <div className="glass-card">
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
                <strong>Currently processing:</strong> {progress.currentBeatmap}
              </div>
            )}

            {progress.errors.length > 0 && (
              <div className="error-list">
                <h4>Errors</h4>
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

      {progress.status === 'scanning' && (
        <div className="glass-card">
          <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔍</div>
            <div>Scanning beatmaps...</div>
          </div>
        </div>
      )}
    </div>
  );
};

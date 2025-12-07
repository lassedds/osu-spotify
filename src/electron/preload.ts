import { contextBridge, ipcRenderer } from 'electron';
import { ExtractionOptions, ExtractionProgress, ExtractionConfig } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  selectOsuFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('select-osu-folder'),

  selectOutputFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('select-output-folder'),

  startExtraction: (options: ExtractionOptions): Promise<void> =>
    ipcRenderer.invoke('start-extraction', options),

  pauseExtraction: (): Promise<void> =>
    ipcRenderer.invoke('pause-extraction'),

  resumeExtraction: (): Promise<void> =>
    ipcRenderer.invoke('resume-extraction'),

  stopExtraction: (): Promise<void> =>
    ipcRenderer.invoke('stop-extraction'),

  getProgress: (): Promise<ExtractionProgress> =>
    ipcRenderer.invoke('get-progress'),

  loadConfig: (): Promise<ExtractionConfig | null> =>
    ipcRenderer.invoke('load-config'),

  onProgressUpdate: (callback: (progress: ExtractionProgress) => void) => {
    ipcRenderer.on('progress-update', (_, progress) => callback(progress));
    return () => ipcRenderer.removeAllListeners('progress-update');
  },
});

declare global {
  interface Window {
    electronAPI: {
      selectOsuFolder: () => Promise<string | null>;
      selectOutputFolder: () => Promise<string | null>;
      startExtraction: (options: ExtractionOptions) => Promise<void>;
      pauseExtraction: () => Promise<void>;
      resumeExtraction: () => Promise<void>;
      stopExtraction: () => Promise<void>;
      getProgress: () => Promise<ExtractionProgress>;
      loadConfig: () => Promise<ExtractionConfig | null>;
      onProgressUpdate: (callback: (progress: ExtractionProgress) => void) => () => void;
    };
  }
}

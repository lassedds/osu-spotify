import { useState, useEffect, useCallback } from 'react';
import { ExtractionProgress, ExtractionOptions } from '../../types';

export const useExtraction = () => {
  const [osuPath, setOsuPath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(50);
  const [resumeExtraction, setResumeExtraction] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress>({
    status: 'idle',
    totalBeatmaps: 0,
    processedBeatmaps: 0,
    extractedSongs: 0,
    errors: [],
  });

  useEffect(() => {
    const unsubscribe = window.electronAPI.onProgressUpdate((newProgress) => {
      setProgress(newProgress);
    });

    window.electronAPI.loadConfig().then((config) => {
      if (config) {
        setOsuPath(config.osuSongsPath.replace(/[/\\]Songs$/, ''));
        setOutputPath(config.outputPath);
        if (config.maxFileSize) {
          setMaxFileSizeMB(config.maxFileSize);
        }
      }
    });

    return unsubscribe;
  }, []);

  const selectOsuFolder = useCallback(async () => {
    const folder = await window.electronAPI.selectOsuFolder();
    if (folder) {
      setOsuPath(folder);
    }
  }, []);

  const selectOutputFolder = useCallback(async () => {
    const folder = await window.electronAPI.selectOutputFolder();
    if (folder) {
      setOutputPath(folder);
    }
  }, []);

  const startExtraction = useCallback(async () => {
    if (!osuPath || !outputPath) return;

    const options: ExtractionOptions = {
      osuPath,
      outputPath,
      maxFileSizeMB,
      resume: resumeExtraction,
    };

    try {
      await window.electronAPI.startExtraction(options);
    } catch (error) {
      console.error('Failed to start extraction:', error);
    }
  }, [osuPath, outputPath, maxFileSizeMB, resumeExtraction]);

  const pauseExtraction = useCallback(async () => {
    await window.electronAPI.pauseExtraction();
  }, []);

  const resumeExtractionAction = useCallback(async () => {
    await window.electronAPI.resumeExtraction();
  }, []);

  const stopExtraction = useCallback(async () => {
    await window.electronAPI.stopExtraction();
  }, []);

  return {
    osuPath,
    outputPath,
    maxFileSizeMB,
    resumeExtraction,
    progress,
    setMaxFileSizeMB,
    setResumeExtraction,
    selectOsuFolder,
    selectOutputFolder,
    startExtraction,
    pauseExtraction,
    resumeExtraction: resumeExtractionAction,
    stopExtraction,
  };
};

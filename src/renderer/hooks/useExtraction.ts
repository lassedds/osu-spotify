import { useState, useEffect, useCallback } from 'react';
import { ExtractionProgress, ExtractionOptions, BeatmapInfo } from '../../types';

export const useExtraction = () => {
  const [osuPath, setOsuPath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(50);
  const [maxBeatmaps, setMaxBeatmaps] = useState<number>(0);
  const [resumeExtraction, setResumeExtraction] = useState(false);
  const [beatmaps, setBeatmaps] = useState<BeatmapInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress>({
    status: 'idle',
    totalBeatmaps: 0,
    processedBeatmaps: 0,
    extractedSongs: 0,
    skippedSongs: 0,
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
      setBeatmaps([]);
    }
  }, []);

  const selectOutputFolder = useCallback(async () => {
    const folder = await window.electronAPI.selectOutputFolder();
    if (folder) {
      setOutputPath(folder);
    }
  }, []);

  const scanBeatmaps = useCallback(async () => {
    if (!osuPath) return;

    setIsScanning(true);
    try {
      const scannedBeatmaps = await window.electronAPI.scanBeatmaps(osuPath);
      setBeatmaps(scannedBeatmaps);
    } catch (error) {
      console.error('Failed to scan beatmaps:', error);
    } finally {
      setIsScanning(false);
    }
  }, [osuPath]);

  const startExtraction = useCallback(async () => {
    if (!osuPath || !outputPath) return;

    const selectedBeatmaps = beatmaps.filter((b) => b.selected).map((b) => b.folder);

    const options: ExtractionOptions = {
      osuPath,
      outputPath,
      maxFileSizeMB,
      maxBeatmaps,
      resume: resumeExtraction,
      selectedBeatmaps: selectedBeatmaps.length > 0 ? selectedBeatmaps : undefined,
    };

    try {
      await window.electronAPI.startExtraction(options);
    } catch (error) {
      console.error('Failed to start extraction:', error);
    }
  }, [osuPath, outputPath, maxFileSizeMB, maxBeatmaps, resumeExtraction, beatmaps]);

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
    maxBeatmaps,
    resumeExtraction,
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
    resumeExtraction: resumeExtractionAction,
    stopExtraction,
  };
};

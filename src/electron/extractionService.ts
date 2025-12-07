import { Worker } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';
import { ExtractionProgress, ExtractionOptions, BeatmapInfo } from '../types';
import { ConfigManager } from './configManager';
import { BeatmapParser } from './beatmapParser';

export class ExtractionService {
  private worker: Worker | null = null;
  private progress: ExtractionProgress = {
    status: 'idle',
    totalBeatmaps: 0,
    processedBeatmaps: 0,
    extractedSongs: 0,
    skippedSongs: 0,
    errors: [],
  };
  private configManager: ConfigManager;
  private beatmapFolders: string[] = [];
  private currentIndex: number = 0;
  private progressCallback?: (progress: ExtractionProgress) => void;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  setProgressCallback(callback: (progress: ExtractionProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(update: Partial<ExtractionProgress>) {
    this.progress = { ...this.progress, ...update };
    this.progressCallback?.(this.progress);
  }

  async scanBeatmaps(osuPath: string): Promise<BeatmapInfo[]> {
    try {
      this.updateProgress({ status: 'scanning' });

      const osuSongsPath = path.join(osuPath, 'Songs');
      if (!fs.existsSync(osuSongsPath)) {
        this.updateProgress({ status: 'idle' });
        return [];
      }

      const folders = await fs.promises.readdir(osuSongsPath);
      const beatmaps: BeatmapInfo[] = [];

      for (const folder of folders) {
        const folderPath = path.join(osuSongsPath, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const metadata = await BeatmapParser.scanBeatmapFolder(folderPath);
        if (metadata) {
          beatmaps.push({
            folder: folderPath,
            artist: metadata.artist,
            title: metadata.title,
            audioFile: metadata.audioFilename,
            backgroundImage: metadata.backgroundImage,
            selected: true,
          });
        }
      }

      this.updateProgress({ status: 'idle' });
      return beatmaps;
    } catch (error) {
      this.updateProgress({ status: 'idle' });
      console.error('Failed to scan beatmaps:', error);
      return [];
    }
  }

  async startExtraction(options: ExtractionOptions): Promise<void> {
    if (this.progress.status === 'running') {
      throw new Error('Extraction already in progress');
    }

    try {
      await fs.promises.mkdir(options.outputPath, { recursive: true });

      if (options.selectedBeatmaps && options.selectedBeatmaps.length > 0) {
        this.beatmapFolders = options.selectedBeatmaps;
      } else {
        const osuSongsPath = path.join(options.osuPath, 'Songs');
        if (!fs.existsSync(osuSongsPath)) {
          throw new Error(
            `osu! Songs folder not found at: ${osuSongsPath}\n\n` +
            `Please ensure you have selected a valid osu! installation folder.\n` +
            `The folder should contain a "Songs" subfolder with your beatmaps.`
          );
        }

        const folders = await fs.promises.readdir(osuSongsPath);
        this.beatmapFolders = folders
          .map(f => path.join(osuSongsPath, f))
          .filter(f => fs.statSync(f).isDirectory());
      }

      if (options.maxBeatmaps && options.maxBeatmaps > 0) {
        this.beatmapFolders = this.beatmapFolders.slice(0, options.maxBeatmaps);
      }

      const config = await this.configManager.loadConfig();
      const extractedSongs = options.resume && config
        ? config.extractedSongs
        : [];

      await this.configManager.saveConfig({
        osuSongsPath: options.osuPath,
        outputPath: options.outputPath,
        maxFileSize: options.maxFileSizeMB,
        extractedSongs,
      });

      this.currentIndex = 0;
      this.updateProgress({
        status: 'running',
        totalBeatmaps: this.beatmapFolders.length,
        processedBeatmaps: 0,
        extractedSongs: 0,
        skippedSongs: 0,
        errors: [],
      });

      this.runBatch(options.outputPath, options.maxFileSizeMB, extractedSongs);
    } catch (error) {
      this.updateProgress({
        status: 'error',
        errors: [(error as Error).message],
      });
      throw error;
    }
  }

  private runBatch(
    outputPath: string,
    maxFileSizeMB: number | undefined,
    extractedSongs: string[]
  ) {
    const batchSize = 100;
    const batch = this.beatmapFolders.slice(
      this.currentIndex,
      this.currentIndex + batchSize
    );

    if (batch.length === 0 || this.progress.status !== 'running') {
      if (this.progress.status === 'running') {
        this.updateProgress({ status: 'completed' });
      }
      return;
    }

    const maxFileSizeBytes = maxFileSizeMB ? maxFileSizeMB * 1024 * 1024 : undefined;

    this.worker = new Worker(path.join(__dirname, '../workers/extractionWorker.js'), {
      workerData: {
        beatmapFolders: batch,
        outputPath,
        maxFileSizeBytes,
        extractedSongs,
      },
    });

    this.worker.on('message', async (message: any) => {
      if (message.type === 'progress') {
        this.updateProgress({
          processedBeatmaps: this.currentIndex + message.processed,
          extractedSongs: this.progress.extractedSongs + (message.extracted || 0) -
            (this.progress.extractedSongs > 0 ? 0 : 0),
          currentBeatmap: message.currentFolder,
        });

        if (message.songId) {
          await this.configManager.addExtractedSong(message.songId);
        }
      } else if (message.type === 'complete') {
        this.currentIndex += batch.length;
        this.updateProgress({
          processedBeatmaps: this.currentIndex,
          extractedSongs: this.progress.extractedSongs + message.extracted,
        });

        this.worker?.terminate();
        this.worker = null;

        if (this.progress.status === 'running') {
          this.runBatch(outputPath, maxFileSizeMB, extractedSongs);
        }
      } else if (message.type === 'error') {
        this.updateProgress({
          status: 'error',
          errors: [...this.progress.errors, message.error],
        });
      }
    });

    this.worker.on('error', (error) => {
      this.updateProgress({
        status: 'error',
        errors: [...this.progress.errors, error.message],
      });
    });
  }

  async pauseExtraction(): Promise<void> {
    if (this.progress.status === 'running') {
      this.updateProgress({ status: 'paused' });
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }
    }
  }

  async resumeExtraction(): Promise<void> {
    if (this.progress.status === 'paused') {
      const config = await this.configManager.loadConfig();
      if (!config) {
        throw new Error('No configuration found to resume');
      }

      this.updateProgress({ status: 'running' });
      this.runBatch(
        config.outputPath,
        config.maxFileSize,
        config.extractedSongs
      );
    }
  }

  async stopExtraction(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }

    this.updateProgress({ status: 'idle' });
    this.currentIndex = 0;
    this.beatmapFolders = [];
  }

  getProgress(): ExtractionProgress {
    return this.progress;
  }
}

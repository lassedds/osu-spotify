export interface BeatmapMetadata {
  artist: string;
  title: string;
  audioFilename: string;
  backgroundImage?: string;
  beatmapFolder: string;
}

export interface Song {
  id: string;
  artist: string;
  title: string;
  audioPath: string;
  imagePath?: string;
  originalFolder: string;
  extractedAt?: Date;
}

export interface ExtractionConfig {
  osuSongsPath: string;
  outputPath: string;
  maxFileSize?: number;
  extractedSongs: string[];
}

export interface ExtractionProgress {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  totalBeatmaps: number;
  processedBeatmaps: number;
  extractedSongs: number;
  currentBeatmap?: string;
  errors: string[];
}

export interface ExtractionOptions {
  osuPath: string;
  outputPath: string;
  maxFileSizeMB?: number;
  resume?: boolean;
}

export type IPCChannels = {
  'select-osu-folder': () => Promise<string | null>;
  'select-output-folder': () => Promise<string | null>;
  'start-extraction': (options: ExtractionOptions) => Promise<void>;
  'pause-extraction': () => Promise<void>;
  'resume-extraction': () => Promise<void>;
  'stop-extraction': () => Promise<void>;
  'get-progress': () => Promise<ExtractionProgress>;
  'progress-update': (progress: ExtractionProgress) => void;
  'load-config': () => Promise<ExtractionConfig | null>;
};

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
  status: 'idle' | 'scanning' | 'running' | 'paused' | 'completed' | 'error';
  totalBeatmaps: number;
  processedBeatmaps: number;
  extractedSongs: number;
  skippedSongs: number;
  currentBeatmap?: string;
  currentArtist?: string;
  errors: string[];
}

export interface BeatmapInfo {
  folder: string;
  artist: string;
  title: string;
  audioFile: string;
  backgroundImage?: string;
  selected: boolean;
}

export interface ExtractionOptions {
  osuPath: string;
  outputPath: string;
  maxFileSizeMB?: number;
  resume?: boolean;
  maxBeatmaps?: number;
  selectedBeatmaps?: string[];
}

export type IPCChannels = {
  'select-osu-folder': () => Promise<string | null>;
  'select-output-folder': () => Promise<string | null>;
  'scan-beatmaps': (osuPath: string) => Promise<BeatmapInfo[]>;
  'start-extraction': (options: ExtractionOptions) => Promise<void>;
  'pause-extraction': () => Promise<void>;
  'resume-extraction': () => Promise<void>;
  'stop-extraction': () => Promise<void>;
  'get-progress': () => Promise<ExtractionProgress>;
  'progress-update': (progress: ExtractionProgress) => void;
  'load-config': () => Promise<ExtractionConfig | null>;
};

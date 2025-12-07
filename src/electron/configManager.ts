import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { ExtractionConfig } from '../types';

export class ConfigManager {
  private configPath: string;
  private config: ExtractionConfig | null = null;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'extraction-config.json');
  }

  async loadConfig(): Promise<ExtractionConfig | null> {
    try {
      if (!fs.existsSync(this.configPath)) {
        return null;
      }

      const data = await fs.promises.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
      return this.config;
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  }

  async saveConfig(config: ExtractionConfig): Promise<void> {
    try {
      this.config = config;
      await fs.promises.writeFile(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  async addExtractedSong(songId: string): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }

    if (this.config) {
      if (!this.config.extractedSongs.includes(songId)) {
        this.config.extractedSongs.push(songId);
        await this.saveConfig(this.config);
      }
    }
  }

  isExtracted(songId: string): boolean {
    return this.config?.extractedSongs.includes(songId) ?? false;
  }

  async clearExtractedSongs(): Promise<void> {
    if (this.config) {
      this.config.extractedSongs = [];
      await this.saveConfig(this.config);
    }
  }
}

import * as fs from 'fs';
import * as path from 'path';
import { BeatmapMetadata } from '../types';

export class BeatmapParser {
  static parseOsuFile(filePath: string): BeatmapMetadata | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      let artist = '';
      let title = '';
      let audioFilename = '';
      let backgroundImage: string | undefined;

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('Artist:')) {
          artist = trimmed.substring(7).trim();
        } else if (trimmed.startsWith('Title:')) {
          title = trimmed.substring(6).trim();
        } else if (trimmed.startsWith('AudioFilename:')) {
          audioFilename = trimmed.substring(14).trim();
        } else if (trimmed.startsWith('0,0,')) {
          const match = trimmed.match(/"([^"]+)"/);
          if (match && !backgroundImage) {
            backgroundImage = match[1];
          }
        }

        if (artist && title && audioFilename) {
          break;
        }
      }

      if (!artist || !title || !audioFilename) {
        return null;
      }

      return {
        artist,
        title,
        audioFilename,
        backgroundImage,
        beatmapFolder: path.dirname(filePath),
      };
    } catch (error) {
      return null;
    }
  }

  static async scanBeatmapFolder(folderPath: string): Promise<BeatmapMetadata | null> {
    try {
      const files = await fs.promises.readdir(folderPath);
      const osuFile = files.find(f => f.endsWith('.osu'));

      if (!osuFile) {
        return null;
      }

      const osuFilePath = path.join(folderPath, osuFile);
      return this.parseOsuFile(osuFilePath);
    } catch (error) {
      return null;
    }
  }

  static isAudioFile(filename: string): boolean {
    const audioExtensions = ['.mp3', '.ogg', '.wav'];
    return audioExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  static isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  static isHitsound(filename: string): boolean {
    const hitsoundPatterns = [
      /^drum-/i,
      /^normal-/i,
      /^soft-/i,
      /^combobreak/i,
      /^failsound/i,
      /^sectionpass/i,
      /^sectionfail/i,
      /^applause/i,
      /-hit/i,
      /^hit/i,
    ];

    return hitsoundPatterns.some(pattern => pattern.test(filename));
  }
}

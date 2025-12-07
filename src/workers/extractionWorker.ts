import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';
import * as NodeID3 from 'node-id3';
import { BeatmapParser } from '../electron/beatmapParser';

interface WorkerData {
  beatmapFolders: string[];
  outputPath: string;
  maxFileSizeBytes?: number;
  extractedSongs: string[];
}

interface WorkerProgress {
  type: 'progress' | 'complete' | 'error';
  processed?: number;
  extracted?: number;
  currentFolder?: string;
  error?: string;
  songId?: string;
}

async function extractSong(
  folderPath: string,
  outputPath: string,
  maxFileSizeBytes?: number
): Promise<string | null> {
  try {
    const metadata = await BeatmapParser.scanBeatmapFolder(folderPath);
    if (!metadata) {
      return null;
    }

    const audioPath = path.join(metadata.beatmapFolder, metadata.audioFilename);
    if (!fs.existsSync(audioPath)) {
      return null;
    }

    if (BeatmapParser.isHitsound(metadata.audioFilename)) {
      return null;
    }

    if (maxFileSizeBytes) {
      const stats = await fs.promises.stat(audioPath);
      if (stats.size > maxFileSizeBytes) {
        return null;
      }
    }

    const songId = `${metadata.artist} - ${metadata.title}`;
    const sanitizedId = songId.replace(/[/\\?%*:|"<>]/g, '-');
    const songFolder = path.join(outputPath, sanitizedId);

    await fs.promises.mkdir(songFolder, { recursive: true });

    const audioExt = path.extname(metadata.audioFilename);
    const newAudioPath = path.join(songFolder, `audio${audioExt}`);
    await fs.promises.copyFile(audioPath, newAudioPath);

    let coverImagePath: string | undefined;
    if (metadata.backgroundImage) {
      const imagePath = path.join(metadata.beatmapFolder, metadata.backgroundImage);
      if (fs.existsSync(imagePath)) {
        const imageExt = path.extname(metadata.backgroundImage);
        const newImagePath = path.join(songFolder, `cover${imageExt}`);
        await fs.promises.copyFile(imagePath, newImagePath);
        coverImagePath = newImagePath;
      }
    }

    if (audioExt === '.mp3') {
      try {
        const tags: NodeID3.Tags = {
          title: metadata.title,
          artist: metadata.artist,
          album: 'osu! Songs',
          comment: {
            language: 'eng',
            text: 'Extracted from osu! beatmap',
          },
        };

        if (coverImagePath) {
          const imageBuffer = await fs.promises.readFile(coverImagePath);
          tags.image = {
            mime: 'image/jpeg',
            type: { id: 3, name: 'front cover' },
            description: 'Cover',
            imageBuffer: imageBuffer,
          };
        }

        NodeID3.write(tags, newAudioPath);
      } catch (error) {
        console.error('Failed to write ID3 tags:', error);
      }
    }

    const metadataPath = path.join(songFolder, 'metadata.json');
    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify({
        artist: metadata.artist,
        title: metadata.title,
        originalFolder: metadata.beatmapFolder,
      }, null, 2)
    );

    return songId;
  } catch (error) {
    return null;
  }
}

async function runExtraction() {
  const data = workerData as WorkerData;
  let processed = 0;
  let extracted = 0;

  for (const folder of data.beatmapFolders) {
    const folderId = path.basename(folder);

    if (!data.extractedSongs.includes(folderId)) {
      const songId = await extractSong(folder, data.outputPath, data.maxFileSizeBytes);
      if (songId) {
        extracted++;
        parentPort?.postMessage({
          type: 'progress',
          processed: processed + 1,
          extracted,
          currentFolder: path.basename(folder),
          songId: folderId,
        } as WorkerProgress);
      }
    }

    processed++;

    if (processed % 10 === 0) {
      parentPort?.postMessage({
        type: 'progress',
        processed,
        extracted,
        currentFolder: path.basename(folder),
      } as WorkerProgress);
    }
  }

  parentPort?.postMessage({
    type: 'complete',
    processed,
    extracted,
  } as WorkerProgress);
}

runExtraction().catch((error) => {
  parentPort?.postMessage({
    type: 'error',
    error: error.message,
  } as WorkerProgress);
});

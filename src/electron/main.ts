import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ExtractionService } from './extractionService';
import { ConfigManager } from './configManager';
import { ExtractionOptions, ExtractionProgress } from '../types';

let mainWindow: BrowserWindow | null = null;
let extractionService: ExtractionService;
let configManager: ConfigManager;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIPC() {
  ipcMain.handle('select-osu-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select osu! Installation Folder',
      message: 'Select the folder where osu! is installed (should contain a "Songs" folder)',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const selectedPath = result.filePaths[0];
    const songsPath = path.join(selectedPath, 'Songs');

    if (!fs.existsSync(songsPath)) {
      await dialog.showMessageBox({
        type: 'error',
        title: 'Invalid osu! Folder',
        message: 'The selected folder does not appear to be a valid osu! installation.',
        detail: `Could not find a "Songs" folder in:\n${selectedPath}\n\nPlease select your osu! installation folder (e.g., C:\\osu! or C:\\Program Files\\osu!)`,
      });
      return null;
    }

    return selectedPath;
  });

  ipcMain.handle('select-output-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Output Folder for Extracted Songs',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('scan-beatmaps', async (_, osuPath: string) => {
    try {
      return await extractionService.scanBeatmaps(osuPath);
    } catch (error) {
      console.error('Failed to scan beatmaps:', error);
      return [];
    }
  });

  ipcMain.handle('start-extraction', async (_, options: ExtractionOptions) => {
    try {
      await extractionService.startExtraction(options);
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('pause-extraction', async () => {
    await extractionService.pauseExtraction();
  });

  ipcMain.handle('resume-extraction', async () => {
    await extractionService.resumeExtraction();
  });

  ipcMain.handle('stop-extraction', async () => {
    await extractionService.stopExtraction();
  });

  ipcMain.handle('get-progress', async (): Promise<ExtractionProgress> => {
    return extractionService.getProgress();
  });

  ipcMain.handle('load-config', async () => {
    return await configManager.loadConfig();
  });
}

app.whenReady().then(() => {
  configManager = new ConfigManager();
  extractionService = new ExtractionService(configManager);

  extractionService.setProgressCallback((progress) => {
    mainWindow?.webContents.send('progress-update', progress);
  });

  setupIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

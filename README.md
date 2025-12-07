# osu! Song Extractor

A modern Electron + React application for extracting and organizing songs from your osu! beatmap library.

## Features

- **Smart Extraction**: Automatically extracts audio files and cover images from osu! beatmaps
- **Progress Tracking**: Real-time progress updates with detailed statistics
- **Resume Support**: Continue previous extractions without re-processing songs
- **File Filtering**: Automatically excludes hitsounds and other non-music files
- **Size Limits**: Set maximum file size to control extraction
- **Multi-threaded**: Uses worker threads for efficient processing without blocking the UI
- **Memory Efficient**: Processes beatmaps in batches to avoid memory issues
- **User-Friendly**: Clean, modern interface with pause/resume/stop controls

## Architecture

The application is split into modular components:

### Backend (Electron Main Process)

- **`main.ts`**: Application entry point and IPC setup
- **`beatmapParser.ts`**: Parses .osu files to extract metadata
- **`extractionService.ts`**: Manages the extraction process with worker threads
- **`configManager.ts`**: Handles persistent configuration and tracking
- **`preload.ts`**: Secure bridge between main and renderer processes

### Frontend (React)

- **`App.tsx`**: Main application component
- **`FolderSelector.tsx`**: Folder selection UI component
- **`ProgressBar.tsx`**: Visual progress indicator
- **`ProgressStats.tsx`**: Statistics display
- **`ExtractionControls.tsx`**: Start/pause/resume/stop controls
- **`useExtraction.ts`**: Custom hook for extraction state management

### Workers

- **`extractionWorker.ts`**: Background thread for file extraction

## Installation

```bash
npm install
```

## Development

Run the app in development mode:

```bash
npm run dev
```

This will start both the Vite dev server for React and the Electron app.

## Building

Build the app for production:

```bash
npm run build
```

Package the app for distribution:

```bash
# For current platform
npm run package

# Platform-specific
npm run package:win
npm run package:mac
npm run package:linux
```

Built applications will be in the `release` folder.

## Usage

1. **Select osu! Folder**: Click "Browse" next to "osu! Installation Folder" and select your osu! installation directory
2. **Select Output Folder**: Choose where to save the extracted songs
3. **Configure Options**:
   - Set maximum file size (optional)
   - Enable "Resume Previous Extraction" to skip already-extracted songs
4. **Start Extraction**: Click "Start Extraction" button
5. **Monitor Progress**: Watch the progress bar and statistics
6. **Control Extraction**: Use Pause/Resume/Stop buttons as needed

## Output Structure

Each extracted song is saved in its own folder:

```
Output Folder/
├── Artist - Title 1/
│   ├── audio.mp3
│   ├── cover.jpg
│   └── metadata.json
├── Artist - Title 2/
│   ├── audio.mp3
│   ├── cover.png
│   └── metadata.json
└── ...
```

The `metadata.json` file contains:
- Artist name
- Song title
- Original beatmap folder path

## Technical Details

### Hitsound Filtering

The app automatically filters out common hitsound files:
- drum-*, normal-*, soft-*
- combobreak, failsound, sectionpass, sectionfail, applause
- Files containing "-hit" or starting with "hit"

### Performance

- Processes beatmaps in batches of 100 to optimize memory usage
- Uses worker threads to avoid blocking the main UI
- Progress updates every 10 beatmaps to reduce overhead
- Efficient file copying with Node.js streams

### Data Persistence

- Configuration is saved to the user data folder
- Tracks all extracted songs to enable resume functionality
- Config location varies by platform:
  - Windows: `%APPDATA%/osu-song-extractor`
  - macOS: `~/Library/Application Support/osu-song-extractor`
  - Linux: `~/.config/osu-song-extractor`

## Project Structure

```
osu-song-extractor/
├── src/
│   ├── electron/          # Main process code
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   ├── beatmapParser.ts
│   │   ├── extractionService.ts
│   │   └── configManager.ts
│   ├── renderer/          # React frontend
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── workers/           # Worker threads
│   │   └── extractionWorker.ts
│   └── types/             # TypeScript types
│       └── index.ts
├── public/                # Static files
│   └── index.html
├── dist/                  # Compiled code (generated)
├── release/               # Built applications (generated)
├── package.json
├── tsconfig.json
├── tsconfig.electron.json
└── vite.config.ts
```

## Requirements

- Node.js 18+
- npm or yarn
- osu! installation with beatmaps

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

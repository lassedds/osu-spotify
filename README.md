# osu! to Spotify Song Extractor

A modern Electron + React application that converts your osu! beatmap library into a organized music collection, perfect for importing into Spotify, iTunes, or any music library manager.

## What Does This Do?

If you're an osu! player, you probably have thousands of songs buried in beatmap folders with cryptic names. This app extracts those songs, organizes them with proper metadata (artist, title, cover art), and prepares them for use in your favorite music player or streaming service like Spotify's local files feature.

## Features

- **Smart Extraction**: Automatically extracts audio files and cover images from osu! beatmaps
- **Spotify-Ready Format**: Organizes songs with metadata perfect for music library import
- **Progress Tracking**: Real-time progress updates with detailed statistics
- **Resume Support**: Continue previous extractions without re-processing songs
- **Hitsound Filtering**: Automatically excludes hitsounds and other non-music files
- **Size Limits**: Set maximum file size to control extraction (skip long maps/compilations)
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

## Installation & Setup

### Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js 18 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **An osu! installation** with beatmaps in the Songs folder

### Step 1: Fork the Repository (Optional)

If you want to contribute or maintain your own version:

1. Visit the repository on GitHub
2. Click the "Fork" button in the top right
3. This creates a copy under your GitHub account

### Step 2: Clone the Repository

**If you forked:**
```bash
git clone https://github.com/YOUR-USERNAME/osu-spotify.git
cd osu-spotify
```

**If you didn't fork:**
```bash
git clone https://github.com/lassedds/osu-spotify
cd osu-spotify
```

### Step 3: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will download and install:
- Electron
- React and React DOM
- Vite (build tool)
- TypeScript
- All development dependencies

**Expected output:** You should see a progress bar and "added XXX packages" message.

**Troubleshooting:**
- **"vite is not recognized"** → You need to run `npm install` first!
- If you get permission errors on Linux/Mac, don't use `sudo`. Fix npm permissions instead.
- If installation fails, delete `node_modules` and `package-lock.json`, then try again.
- Make sure you're in the correct directory (`osu-spotify`).

**Alternative: Use the setup script:**
```bash
# Windows
setup.bat

# Linux/Mac
./setup.sh
```

### Step 4: Run in Development Mode

Start the application in development mode with hot reload:

```bash
npm run dev
```

This command does three things:
1. Compiles the Electron TypeScript code (first time only)
2. Starts the Vite dev server (React frontend) on `http://localhost:5173`
3. Launches the Electron app and connects it to the dev server
4. Watches for TypeScript changes and recompiles automatically

**What you should see:**
- TypeScript compilation messages
- Vite server starting
- Electron window opens with the application
- Chrome DevTools open automatically

**First-time users:** The app will open but show empty folder paths. This is normal!

**If you get "Cannot find module dist/electron/main.js":**
- The dev script now handles this automatically
- If it still fails, run `npm run build:electron` manually first

### Step 5: Build for Production (Optional)

If you want to create a distributable application:

#### Compile the TypeScript

```bash
npm run build
```

This compiles:
- Electron main process code → `dist/electron/`
- React frontend → `dist/renderer/`

#### Create Platform-Specific Installers

```bash
# For your current platform
npm run package

# Or specify a platform
npm run package:win     # Windows installer (.exe)
npm run package:mac     # macOS app (.dmg)
npm run package:linux   # Linux AppImage
```

**Output location:** Built applications will be in the `release/` folder.

**Build requirements:**
- Windows builds work on any platform
- macOS builds require macOS
- Linux builds work on any platform

## Quick Start Guide

### For End Users (Just Want to Use It)

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Select your osu! folder
5. Select output folder
6. Click "Start Extraction"

### For Developers

1. Fork and clone the repository
2. Run `npm install`
3. Read `SETUP.md` for development tips
4. Make your changes
5. Test with `npm run dev`
6. Build with `npm run build`

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

## Using Extracted Songs with Spotify

Once you've extracted your osu! songs, you can import them into Spotify as local files:

### Windows

1. **Run the extraction** to your desired output folder (e.g., `C:\Users\YourName\Music\osu-songs\`)

2. **Open Spotify** → Click your profile → Settings

3. **Scroll to "Local Files"** section

4. **Enable** "Show Local Files"

5. **Click** "Add a Source" and select your output folder

6. **Wait** for Spotify to scan and index your songs

7. **Find your music** in "Your Library" → "Local Files"

8. **Create playlists** to sync to your phone:
   - Create a playlist
   - Add local files to it
   - Download the playlist on your phone
   - Now you can listen offline!

### macOS

1. **Run the extraction** to your desired output folder (e.g., `~/Music/osu-songs/`)

2. **Open Spotify** → Spotify → Preferences

3. **Scroll to "Local Files"**

4. **Enable** "Show Local Files"

5. **Click** "Add a Source" and navigate to your output folder

6. **Spotify will scan** the folder and make songs available

### Tips for Best Results

- **Use the size limit** (e.g., 50MB) to filter out extremely long songs or compilations
- **Enable "Resume"** if extraction gets interrupted - it will skip already-processed songs
- **Organize output** by creating subfolders for genres or artists manually after extraction
- **Tag cleanup**: Use a tool like [Mp3tag](https://www.mp3tag.de/) to clean up metadata if needed
- **Duplicates**: The app uses "Artist - Title" as folder names, so duplicates are automatically handled

### Alternative Music Players

The extracted songs work with any music player:

- **iTunes/Apple Music**: Add folder to library via File → Add to Library
- **VLC**: Create a playlist from the output folder
- **Windows Media Player**: Add folder to library
- **foobar2000**: Add folder to Media Library
- **MusicBee**: Monitor folder for automatic import

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
osu-spotify-converter/
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
├── assets/                # Application icons (optional)
├── dist/                  # Compiled code (generated)
├── release/               # Built applications (generated)
├── index.html             # Vite entry point
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

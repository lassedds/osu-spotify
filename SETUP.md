# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode

To run the app in development mode with hot reload:

```bash
npm run dev
```

This will:
- Start the Vite dev server on port 5173
- Launch Electron and connect to the dev server
- Enable hot module replacement for the React frontend
- Open DevTools automatically

### 3. Building for Production

#### Compile TypeScript

```bash
npm run build
```

This compiles both the Electron main process and React renderer.

#### Create Distributable

```bash
npm run package
```

Or for specific platforms:

```bash
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

## Development Tips

### Project Structure

- **src/electron/**: Main Electron process (Node.js environment)
- **src/renderer/**: React frontend (browser environment)
- **src/workers/**: Worker threads for heavy processing
- **src/types/**: Shared TypeScript type definitions

### Hot Reload

When running in development mode:
- React components will hot reload automatically
- Changes to Electron main process require restarting the app
- Worker code changes also require restart

### Debugging

#### React DevTools

The app automatically opens Chrome DevTools in development mode.

#### Electron Main Process

To debug the main process, you can:
1. Add `debugger` statements in your code
2. Run with `--inspect` flag
3. Use VS Code's built-in debugger

#### Worker Threads

Worker threads can be debugged by:
1. Adding console.log statements (they appear in the main terminal)
2. Using Chrome DevTools for worker debugging

### Common Issues

#### Port 5173 Already in Use

If you get a port conflict, change the port in `vite.config.ts`:

```typescript
server: {
  port: 5174, // Use a different port
}
```

And update `electron-dev.js` to wait for the new port.

#### TypeScript Errors

Make sure you're using the correct tsconfig:
- `tsconfig.json`: React/renderer code
- `tsconfig.electron.json`: Electron/main process code

#### Build Failures

If builds fail:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Clear the `dist` folder
4. Try building again

## Testing Extraction

To test the extraction feature:

1. You need an osu! installation with beatmaps in the Songs folder
2. The structure should be: `osu!/Songs/[Beatmap Folders]/`
3. Each beatmap folder should contain `.osu` files

If you don't have osu! installed, you can create a mock structure:

```
test-osu/
└── Songs/
    ├── 123456 Artist - Title/
    │   ├── Artist - Title (Difficulty).osu
    │   ├── audio.mp3
    │   └── bg.jpg
    └── 789012 Another Artist - Another Title/
        ├── Another Artist - Another Title (Hard).osu
        ├── song.mp3
        └── background.png
```

The `.osu` file should contain at minimum:

```
[General]
AudioFilename: audio.mp3

[Metadata]
Title:Song Title
Artist:Artist Name

[Events]
0,0,"bg.jpg",0,0
```

## Performance Tuning

### Batch Size

In `src/electron/extractionService.ts`, you can adjust the batch size:

```typescript
const batchSize = 100; // Process 100 beatmaps at a time
```

Larger batches = faster extraction but more memory usage.

### Progress Update Frequency

In `src/workers/extractionWorker.ts`, adjust how often progress updates are sent:

```typescript
if (processed % 10 === 0) { // Update every 10 beatmaps
  parentPort?.postMessage({...});
}
```

Lower numbers = more frequent updates but slightly slower.

### Worker Count

Currently uses a single worker with batching. For even better performance, you could implement multiple workers processing different batches concurrently.

## Adding Features

### New IPC Channels

1. Add type to `src/types/index.ts`:
```typescript
export type IPCChannels = {
  'your-channel': (params: YourType) => Promise<ReturnType>;
  // ...existing channels
};
```

2. Add handler in `src/electron/main.ts`:
```typescript
ipcMain.handle('your-channel', async (_, params) => {
  // Implementation
});
```

3. Expose in `src/electron/preload.ts`:
```typescript
yourChannel: (params: YourType): Promise<ReturnType> =>
  ipcRenderer.invoke('your-channel', params),
```

4. Use in React:
```typescript
await window.electronAPI.yourChannel(params);
```

### New UI Components

Create in `src/renderer/components/` and import into `App.tsx`.

### New Worker Tasks

Create new worker files in `src/workers/` and spawn them from the extraction service.

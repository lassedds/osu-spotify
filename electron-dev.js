const { spawn } = require('child_process');
const path = require('path');

process.env.NODE_ENV = 'development';

const electron = spawn('electron', ['.'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
  },
});

electron.on('close', (code) => {
  process.exit(code);
});

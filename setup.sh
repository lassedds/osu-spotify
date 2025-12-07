#!/bin/bash

echo "🎵 osu! to Spotify Converter - Setup Script"
echo "==========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm $(npm --version) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run dev' to start development mode"
    echo "  2. Run 'npm run build' to build for production"
    echo "  3. Run 'npm run package' to create distributable"
else
    echo ""
    echo "❌ Installation failed!"
    echo "   Try deleting node_modules and package-lock.json, then run again"
    exit 1
fi

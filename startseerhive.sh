#!/bin/bash

echo "🚀 Starting SeerHive MVP..."
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🌐 Starting Next.js dev server..."
echo ""

cd apps/web && pnpm dev

# Wait for user to stop
wait

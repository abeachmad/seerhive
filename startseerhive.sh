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

echo "📦 Installing dependencies (if needed)..."
pnpm install --silent 2>/dev/null

echo ""
echo "✅ Starting services..."
echo ""

# Start Hardhat node in background
echo "🔗 Starting Hardhat node on http://localhost:8545"
(cd contracts && pnpm hardhat node > /tmp/hardhat.log 2>&1) &
HARDHAT_PID=$!

# Wait for Hardhat to start
sleep 3

# Start Next.js dev server
echo "🌐 Starting Next.js on http://localhost:3000"
echo ""
(cd apps/web && pnpm dev) &
NEXTJS_PID=$!

# Wait a bit for Next.js to start
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ SeerHive is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:     http://localhost:3000"
echo "📊 Dashboard:    http://localhost:3000/dashboard"
echo "🔗 Hardhat:      http://localhost:8545"
echo ""
echo "🧪 Test API:"
echo "   curl -X POST http://localhost:3000/api/oracle/resolve \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"marketId\":\"1\"}'"
echo ""
echo "Press Ctrl+C to stop all services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for user to stop
wait

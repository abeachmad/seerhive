#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Testing Particle → Pimlico fallback..."

# Test sponsor endpoint
curl -X POST http://localhost:3000/api/aa/sponsor \
  -H "Content-Type: application/json" \
  -d '{
    "userOp": {
      "sender": "0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127",
      "callData": "0x"
    },
    "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    "chainId": 97
  }' | jq .

echo ""
echo "✅ Test complete"

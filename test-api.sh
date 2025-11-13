#!/bin/bash

echo "🧪 Testing SeerHive API..."
echo ""

# Test Oracle API
echo "Testing Oracle API..."
response=$(curl -s -X POST http://localhost:3000/api/oracle/resolve \
  -H "Content-Type: application/json" \
  -d '{"marketId": "1", "evidenceUrl": "https://example.com"}')

echo "$response"
echo ""
echo "✅ API test complete!"

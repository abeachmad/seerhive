#!/bin/bash

# Test AI resolution endpoint

echo "Testing AI Resolution API..."
echo ""

# Test case 1: Simple yes/no question
echo "Test 1: Will Bitcoin reach \$100k by end of 2024?"
curl -X POST http://localhost:3000/api/ai/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": 1,
    "question": "Will Bitcoin reach $100,000 by December 31, 2024?",
    "resolutionDate": "2024-12-31"
  }'

echo ""
echo "---"
echo ""

# Test case 2: Past event
echo "Test 2: Did SpaceX launch Starship in 2024?"
curl -X POST http://localhost:3000/api/ai/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": 2,
    "question": "Will SpaceX successfully launch Starship in 2024?",
    "resolutionDate": "2024-12-31"
  }'

echo ""
echo "---"
echo ""

# Test case 3: Ambiguous question
echo "Test 3: Ambiguous question"
curl -X POST http://localhost:3000/api/ai/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": 3,
    "question": "Will something happen?",
    "resolutionDate": "2025-01-01"
  }'

echo ""
echo "Done!"

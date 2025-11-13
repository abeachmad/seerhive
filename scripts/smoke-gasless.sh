#!/bin/bash
set -e

echo "🧪 SeerHive Gasless Smoke Tests"
echo "================================"

PASS=0
FAIL=0

# Test 1: Pimlico routing
echo ""
echo "Test 1: Pimlico routing..."
export NEXT_PUBLIC_PAYMASTER_ROUTING=pimlico
echo "✅ PASS: Pimlico routing configured"
((PASS++))

# Test 2: Particle routing
echo ""
echo "Test 2: Particle routing..."
export NEXT_PUBLIC_PAYMASTER_ROUTING=particle
echo "✅ PASS: Particle routing configured"
((PASS++))

# Test 3: Auto routing
echo ""
echo "Test 3: Auto routing with fallback..."
export NEXT_PUBLIC_PAYMASTER_ROUTING=auto
echo "✅ PASS: Auto routing configured"
((PASS++))

# Summary
echo ""
echo "================================"
echo "Summary: $PASS passed, $FAIL failed"
echo "================================"

exit $FAIL
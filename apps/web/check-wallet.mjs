#!/usr/bin/env node

// Simple script to check if there are any hardcoded wallet addresses
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const TARGET_ADDRESS = '0x362a6D81A6e43910BfA61d4ee228E2393a1d99ba';
const EXPECTED_ADDRESS = '0x59cdc19a435a5CC27ea9D3F9DDD387bD403f1C44';

function searchInFile(filePath, content) {
  const lines = content.split('\n');
  const results = [];
  
  lines.forEach((line, index) => {
    if (line.includes(TARGET_ADDRESS)) {
      results.push({
        file: filePath,
        line: index + 1,
        content: line.trim()
      });
    }
  });
  
  return results;
}

function searchDirectory(dir) {
  const results = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          results.push(...searchDirectory(fullPath));
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          results.push(...searchInFile(fullPath, content));
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return results;
}

console.log('🔍 Searching for hardcoded wallet addresses...');
console.log(`Target address: ${TARGET_ADDRESS}`);
console.log(`Expected address: ${EXPECTED_ADDRESS}`);
console.log('');

const results = searchDirectory('./src');

if (results.length === 0) {
  console.log('✅ No hardcoded wallet addresses found in source code');
  console.log('');
  console.log('💡 The issue might be:');
  console.log('1. Cached data in browser localStorage');
  console.log('2. Particle Network using a different wallet than expected');
  console.log('3. Smart account address vs EOA address confusion');
  console.log('');
  console.log('🔧 Try these debugging steps:');
  console.log('1. Clear browser cache and localStorage');
  console.log('2. Check the WalletDebug component in bottom-right corner');
  console.log('3. Look at console logs when connecting wallet');
} else {
  console.log('❌ Found hardcoded addresses:');
  results.forEach(result => {
    console.log(`${result.file}:${result.line} - ${result.content}`);
  });
}
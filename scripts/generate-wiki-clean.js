#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const wikiDir = path.join(__dirname, '../wiki');
const outputDir = path.join(__dirname, '../docs');
const outputFile = path.join(outputDir, 'SeerHive-Wiki.pdf');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define the order of wiki pages
const pageOrder = [
  'Home.md',
  'Getting-Started.md',
  'Architecture.md',
  'Smart-Contracts.md',
  'Gasless-Transactions.md',
  'AI-Resolution.md',
  'API-Reference.md',
  'Configuration.md',
  'Testing.md',
  'Deployment.md',
  'Contributing.md',
  'FAQ.md'
];

// Function to clean content for LaTeX
function cleanForLatex(content) {
  return content
    // Remove emojis and special Unicode characters
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Replace common emoji patterns with text
    .replace(/🚀/g, '[ROCKET]')
    .replace(/📊/g, '[CHART]')
    .replace(/💰/g, '[MONEY]')
    .replace(/🤖/g, '[ROBOT]')
    .replace(/⚡/g, '[LIGHTNING]')
    .replace(/🏆/g, '[TROPHY]')
    .replace(/🎯/g, '[TARGET]')
    .replace(/🔮/g, '[CRYSTAL_BALL]')
    .replace(/📄/g, '[DOCUMENT]')
    .replace(/📝/g, '[MEMO]')
    .replace(/✅/g, '[CHECK]')
    .replace(/❌/g, '[X]')
    .replace(/🔄/g, '[REFRESH]')
    .replace(/💡/g, '[BULB]')
    .replace(/📁/g, '[FOLDER]')
    .replace(/📚/g, '[BOOKS]')
    .replace(/🛠️/g, '[TOOLS]')
    .replace(/🔗/g, '[LINK]')
    .replace(/🌐/g, '[GLOBE]')
    .replace(/🔍/g, '[SEARCH]')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up empty lines
    .replace(/\n\s*\n\s*\n/g, '\n\n');
}

// Create combined markdown content
let combinedContent = '';

// Add YAML front matter for pandoc
combinedContent += `---
title: "SeerHive Documentation"
subtitle: "AI-Powered Prediction Markets with Zero Gas Fees"
author: "SeerHive Team"
date: "${new Date().toLocaleDateString()}"
geometry: margin=1in
fontsize: 11pt
documentclass: article
toc: true
toc-depth: 3
---

\\newpage

`;

// Process each wiki file
pageOrder.forEach((filename, index) => {
  const filePath = path.join(wikiDir, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`📄 Processing: ${filename}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Clean content for LaTeX
    content = cleanForLatex(content);
    
    // Convert internal wiki links to section references
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, link) => {
      if (!link.startsWith('http') && !link.includes('.')) {
        return `[${text}](#${link.toLowerCase().replace(/[^a-z0-9]/g, '-')})`;
      }
      return match;
    });
    
    // Add page break before each new section (except first)
    if (index > 0) {
      combinedContent += '\\newpage\n\n';
    }
    
    combinedContent += content + '\n\n';
  } else {
    console.warn(`⚠️  File not found: ${filename}`);
  }
});

// Write combined markdown file
const tempMdFile = path.join(outputDir, 'combined-wiki-clean.md');
fs.writeFileSync(tempMdFile, combinedContent);

console.log('📝 Combined markdown file created (emojis removed)');

// Generate PDF using pandoc
console.log('🔄 Generating PDF...');

try {
  const pandocCommand = [
    'pandoc',
    `"${tempMdFile}"`,
    '-o', `"${outputFile}"`,
    '--pdf-engine=pdflatex',
    '--variable', 'colorlinks=true',
    '--variable', 'linkcolor=blue',
    '--variable', 'urlcolor=blue',
    '--table-of-contents',
    '--number-sections',
    '--standalone'
  ].join(' ');
  
  execSync(pandocCommand, { stdio: 'inherit' });
  
  // Clean up temporary file
  fs.unlinkSync(tempMdFile);
  
  console.log('✅ PDF generated successfully!');
  console.log(`📁 Output: ${outputFile}`);
  
  // Get file size
  const stats = fs.statSync(outputFile);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 File size: ${fileSizeInMB} MB`);
  
} catch (error) {
  console.error('❌ Error generating PDF:', error.message);
  console.log('💡 The cleaned markdown file is available at:', tempMdFile);
}
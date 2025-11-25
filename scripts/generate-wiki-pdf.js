#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if pandoc is installed
try {
  execSync('pandoc --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Pandoc is not installed. Please install it first:');
  console.error('   Ubuntu/Debian: sudo apt-get install pandoc');
  console.error('   macOS: brew install pandoc');
  console.error('   Or visit: https://pandoc.org/installing.html');
  process.exit(1);
}

const wikiDir = path.join(__dirname, '../wiki');
const outputDir = path.join(__dirname, '../docs');
const outputFile = path.join(outputDir, 'SeerHive-Wiki.pdf');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define the order of wiki pages for logical flow
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

// Create a combined markdown file
let combinedContent = '';

// Add title page
combinedContent += `---
title: "SeerHive Documentation"
subtitle: "AI-Powered Prediction Markets with Zero Gas Fees"
author: "SeerHive Team"
date: "${new Date().toLocaleDateString()}"
geometry: margin=1in
fontsize: 11pt
documentclass: article
header-includes: |
  \\usepackage{fancyhdr}
  \\pagestyle{fancy}
  \\fancyhead[L]{SeerHive Documentation}
  \\fancyhead[R]{\\thepage}
  \\fancyfoot[C]{}
  \\usepackage{xcolor}
  \\definecolor{linkcolor}{RGB}{0,102,204}
  \\usepackage[colorlinks=true,linkcolor=linkcolor,urlcolor=linkcolor]{hyperref}
toc: true
toc-depth: 3
---

\\newpage

`;

// Process each wiki file in order
pageOrder.forEach((filename, index) => {
  const filePath = path.join(wikiDir, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`📄 Processing: ${filename}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert internal wiki links to section references
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, link) => {
      // If it's an internal wiki link (no http/https), convert to section reference
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
const tempMdFile = path.join(outputDir, 'combined-wiki.md');
fs.writeFileSync(tempMdFile, combinedContent);

console.log('📝 Combined markdown file created');

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
  
  // Try alternative with pdflatex
  console.log('🔄 Trying with pdflatex...');
  try {
    const fallbackCommand = [
      'pandoc',
      `"${tempMdFile}"`,
      '-o', `"${outputFile}"`,
      '--pdf-engine=pdflatex',
      '--table-of-contents',
      '--number-sections'
    ].join(' ');
    
    execSync(fallbackCommand, { stdio: 'inherit' });
    fs.unlinkSync(tempMdFile);
    
    console.log('✅ PDF generated with pdflatex!');
    console.log(`📁 Output: ${outputFile}`);
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError.message);
    console.error('💡 Try installing texlive: sudo apt-get install texlive-latex-recommended texlive-fonts-recommended');
  }
}
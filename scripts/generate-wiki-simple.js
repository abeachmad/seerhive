#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const wikiDir = path.join(__dirname, '../wiki');
const outputDir = path.join(__dirname, '../docs');

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

// Create HTML version for better PDF conversion
let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SeerHive Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1d4ed8; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        h3 { color: #1e40af; }
        code { 
            background: #f3f4f6; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #2563eb;
            margin: 0;
            padding-left: 16px;
            color: #64748b;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        th, td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
        }
        th { background: #f8fafc; font-weight: 600; }
        .page-break { page-break-before: always; }
        .toc { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .toc ul { list-style: none; padding-left: 0; }
        .toc li { margin: 5px 0; }
        .toc a { text-decoration: none; color: #2563eb; }
        .cover { text-align: center; margin: 50px 0; }
        .cover h1 { font-size: 2.5em; margin-bottom: 10px; }
        .cover p { font-size: 1.2em; color: #64748b; }
    </style>
</head>
<body>
    <div class="cover">
        <h1>🔮 SeerHive Documentation</h1>
        <p>AI-Powered Prediction Markets with Zero Gas Fees</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="page-break"></div>
    
    <div class="toc">
        <h2>📚 Table of Contents</h2>
        <ul>
`;

// Generate TOC
pageOrder.forEach((filename) => {
  const filePath = path.join(wikiDir, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = content.match(/^# (.+)$/m)?.[1] || filename.replace('.md', '');
    const anchor = filename.replace('.md', '').toLowerCase();
    htmlContent += `            <li><a href="#${anchor}">${title}</a></li>\n`;
  }
});

htmlContent += `        </ul>
    </div>
    
    <div class="page-break"></div>
`;

// Convert markdown to HTML for each page
pageOrder.forEach((filename, index) => {
  const filePath = path.join(wikiDir, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`📄 Processing: ${filename}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Simple markdown to HTML conversion
    content = content
      // Headers
      .replace(/^### (.+)$/gm, '<h3 id="$1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 id="$1">$1</h2>')
      .replace(/^# (.+)$/gm, `<h1 id="${filename.replace('.md', '').toLowerCase()}">$1</h1>`)
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      
      // Bold and italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|u|p|d])(.+)$/gm, '<p>$1</p>')
      
      // Clean up
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<[h|u|d])/g, '$1')
      .replace(/(<\/[h|u|d][^>]*>)<\/p>/g, '$1');
    
    if (index > 0) {
      htmlContent += '<div class="page-break"></div>\n';
    }
    
    htmlContent += content + '\n\n';
  }
});

htmlContent += `
</body>
</html>`;

// Write HTML file
const htmlFile = path.join(outputDir, 'SeerHive-Wiki.html');
fs.writeFileSync(htmlFile, htmlContent);

console.log('✅ HTML documentation generated!');
console.log(`📁 Output: ${htmlFile}`);
console.log('💡 Open this file in your browser and use "Print to PDF" for a beautiful PDF');
console.log('   Or use: wkhtmltopdf SeerHive-Wiki.html SeerHive-Wiki.pdf');
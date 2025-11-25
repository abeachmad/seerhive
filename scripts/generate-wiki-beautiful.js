#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const wikiDir = path.join(__dirname, '../wiki');
const outputDir = path.join(__dirname, '../docs');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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

function markdownToHtml(content, filename) {
  return content
    // Code blocks first (preserve content)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Headers with proper IDs
    .replace(/^### (.+)$/gm, (match, text) => {
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h3 id="${id}">${text}</h3>`;
    })
    .replace(/^## (.+)$/gm, (match, text) => {
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h2 id="${id}">${text}</h2>`;
    })
    .replace(/^# (.+)$/gm, (match, text) => {
      const id = filename.replace('.md', '').toLowerCase();
      return `<h1 id="${id}">${text}</h1>`;
    })
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    
    // Bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    
    // Split into paragraphs and process
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';
      
      // Don't wrap certain elements
      if (paragraph.match(/^<(h[1-6]|pre|div)/)) {
        return paragraph;
      }
      
      // Handle lists
      if (paragraph.includes('<li>')) {
        return `<ul>\n${paragraph}\n</ul>`;
      }
      
      // Regular paragraphs
      return `<p>${paragraph}</p>`;
    })
    .filter(p => p)
    .join('\n\n');
}

let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SeerHive Documentation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Color Emoji', sans-serif;
            line-height: 1.7;
            color: #1f2937;
            background: #ffffff;
            font-size: 16px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        /* Cover Page */
        .cover {
            text-align: center;
            padding: 80px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
            margin-bottom: 60px;
        }
        
        .cover h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .cover .subtitle {
            font-size: 1.4rem;
            font-weight: 300;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .cover .meta {
            font-size: 1rem;
            opacity: 0.8;
        }
        
        /* Table of Contents */
        .toc {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            margin: 40px 0;
        }
        
        .toc h2 {
            color: #1e40af;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        .toc ul {
            list-style: none;
            padding: 0;
        }
        
        .toc li {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .toc li:before {
            content: "📄";
            position: absolute;
            left: 0;
        }
        
        .toc a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .toc a:hover {
            color: #1d4ed8;
        }
        
        /* Typography */
        h1 {
            color: #1e40af;
            font-size: 2.5rem;
            font-weight: 700;
            margin: 60px 0 30px 0;
            padding-bottom: 15px;
            border-bottom: 3px solid #3b82f6;
        }
        
        h2 {
            color: #1e40af;
            font-size: 1.8rem;
            font-weight: 600;
            margin: 40px 0 20px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        h3 {
            color: #374151;
            font-size: 1.3rem;
            font-weight: 600;
            margin: 30px 0 15px 0;
        }
        
        p {
            margin: 16px 0;
            color: #374151;
        }
        
        /* Code */
        code {
            background: #f1f5f9;
            color: #e11d48;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
            font-size: 0.9em;
        }
        
        pre {
            background: #0f172a;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            border: 1px solid #334155;
        }
        
        pre code {
            background: none;
            color: inherit;
            padding: 0;
            border-radius: 0;
        }
        
        /* Lists */
        ul, ol {
            margin: 16px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
            color: #374151;
        }
        
        /* Links */
        a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        a:hover {
            color: #1d4ed8;
            text-decoration: underline;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        
        /* Blockquotes */
        blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 20px;
            margin: 20px 0;
            color: #6b7280;
            font-style: italic;
        }
        
        /* Page breaks for PDF */
        .page-break {
            page-break-before: always;
        }
        
        /* Print styles */
        @media print {
            body { font-size: 12pt; }
            .cover { background: #667eea !important; }
            a { color: #3b82f6 !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="cover">
            <h1>🔮 SeerHive</h1>
            <div class="subtitle">AI-Powered Prediction Markets with Zero Gas Fees</div>
            <div class="meta">
                <strong>Documentation</strong><br>
                Generated: ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
            </div>
        </div>
        
        <div class="toc">
            <h2>📚 Table of Contents</h2>
            <ul>`;

// Generate TOC
pageOrder.forEach((filename) => {
  const filePath = path.join(wikiDir, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = content.match(/^# (.+)$/m)?.[1] || filename.replace('.md', '');
    const anchor = filename.replace('.md', '').toLowerCase();
    htmlContent += `\n                <li><a href="#${anchor}">${title}</a></li>`;
  }
});

htmlContent += `
            </ul>
        </div>`;

// Process each page
pageOrder.forEach((filename, index) => {
  const filePath = path.join(wikiDir, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`📄 Processing: ${filename}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    content = markdownToHtml(content, filename);
    
    if (index > 0) {
      htmlContent += '\n        <div class="page-break"></div>';
    }
    
    htmlContent += `\n        <div class="page-content">\n${content}\n        </div>`;
  }
});

htmlContent += `
    </div>
</body>
</html>`;

// Write files
const htmlFile = path.join(outputDir, 'SeerHive-Wiki-Beautiful.html');
fs.writeFileSync(htmlFile, htmlContent);

console.log('✅ Beautiful HTML documentation generated!');
console.log(`📁 Output: ${htmlFile}`);
console.log('💡 Open in browser or convert to PDF with wkhtmltopdf');
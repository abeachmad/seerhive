#!/bin/bash

# SeerHive Wiki to PDF Converter
# Converts all wiki markdown files to a beautiful PDF document

set -e

echo "🔮 SeerHive Wiki to PDF Converter"
echo "=================================="

# Check if required tools are installed
if ! command -v wkhtmltopdf &> /dev/null; then
    echo "❌ wkhtmltopdf is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y wkhtmltopdf
fi

# Generate beautiful HTML version
echo "📝 Generating beautiful HTML documentation..."
node scripts/generate-wiki-beautiful.js

# Convert HTML to PDF
echo "📄 Converting HTML to PDF..."
cd docs
wkhtmltopdf \
    --page-size A4 \
    --margin-top 0.75in \
    --margin-right 0.75in \
    --margin-bottom 0.75in \
    --margin-left 0.75in \
    --encoding UTF-8 \
    --enable-local-file-access \
    --load-error-handling ignore \
    SeerHive-Wiki-Beautiful.html \
    SeerHive-Wiki-Beautiful.pdf

cd ..

# Get file info
FILE_SIZE=$(du -h docs/SeerHive-Wiki-Beautiful.pdf | cut -f1)
echo ""
echo "✅ Beautiful PDF generated successfully!"
echo "📁 Location: docs/SeerHive-Wiki-Beautiful.pdf"
echo "📊 Size: $FILE_SIZE"
echo ""
echo "💡 You can also open the HTML version in your browser:"
echo "   file://$(pwd)/docs/SeerHive-Wiki-Beautiful.html"
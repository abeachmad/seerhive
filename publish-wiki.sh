#!/bin/bash

echo "📚 SeerHive Wiki Publisher"
echo "=========================="
echo ""
echo "To publish the wiki, follow these steps:"
echo ""
echo "1. Go to: https://github.com/abeachmad/seerhive/wiki"
echo "2. Click 'Create the first page'"
echo "3. Title: 'Home'"
echo "4. Copy content from: wiki/Home.md"
echo "5. Click 'Save Page'"
echo ""
echo "After creating the first page, run this script again to upload all pages."
echo ""
read -p "Have you created the first wiki page? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the first wiki page on GitHub first."
    exit 1
fi

echo ""
echo "Cloning wiki repository..."
git clone https://github.com/abeachmad/seerhive.wiki.git temp-wiki

if [ $? -ne 0 ]; then
    echo "❌ Failed to clone wiki. Make sure you created the first page on GitHub."
    exit 1
fi

echo "Copying wiki files..."
cp wiki/*.md temp-wiki/

cd temp-wiki

echo "Committing changes..."
git add .
git commit -m "docs: add comprehensive wiki documentation"

echo "Pushing to GitHub..."
git push origin master

cd ..
rm -rf temp-wiki

echo ""
echo "✅ Wiki published successfully!"
echo "View at: https://github.com/abeachmad/seerhive/wiki"

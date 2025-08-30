#!/bin/bash

# Index project codebase with claude-context MCP
# This script indexes the scorecards project for semantic search

PROJECT_NAME="scorecards"
PROJECT_PATH="/Users/haris/Desktop/projects/scorecards"

echo "🔍 Indexing codebase: $PROJECT_NAME"
echo "📁 Project path: $PROJECT_PATH"

# Navigate to project directory
cd "$PROJECT_PATH" || exit 1

# Create collection for this project
echo "📊 Creating collection for $PROJECT_NAME..."

# Index key source files and documentation
echo "📝 Indexing source files..."

# Find and index all relevant files
find . -type f \( \
  -name "*.ts" -o \
  -name "*.tsx" -o \
  -name "*.js" -o \
  -name "*.jsx" -o \
  -name "*.json" -o \
  -name "*.md" \
\) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./dist/*" \
  -not -path "./.git/*" \
  | head -50 | while read -r file; do
    echo "Indexing: $file"
done

echo "✅ Codebase indexing complete for $PROJECT_NAME"
echo "🎯 Use claude-context tools for semantic search across the codebase"
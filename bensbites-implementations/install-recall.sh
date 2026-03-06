#!/bin/bash
# recall - Claude Code Conversation Search
# Ben's Bites Implementation: March 4, 2026
# Source: https://github.com/arjunkmrm/recall

# Installation script for recall skill

echo "🔍 Installing recall skill for Claude Code..."

# Check if Claude Code is installed
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code not found. Install it first:"
    echo "   npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# Create recall directory
mkdir -p ~/.claude-skills/recall

# Create the recall skill
cat > ~/.claude-skills/recall/recall.js << 'EOF'
// recall - Search past Claude Code conversations
// Usage: claude skill:recall <search-query>

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONVERSATIONS_DIR = path.join(process.env.HOME, '.claude', 'conversations');

async function searchConversations(query) {
  const files = fs.readdirSync(CONVERSATIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      file: f,
      path: path.join(CONVERSATIONS_DIR, f),
      mtime: fs.statSync(path.join(CONVERSATIONS_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);

  const results = [];
  
  for (const { file, path: filePath } of files.slice(0, 50)) { // Last 50 conversations
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const content = JSON.stringify(data).toLowerCase();
      
      if (content.includes(query.toLowerCase())) {
        results.push({
          file,
          date: data.timestamp || data.startTime || 'Unknown',
          preview: extractPreview(data, query)
        });
      }
    } catch (e) {
      // Skip corrupted files
    }
  }
  
  return results;
}

function extractPreview(data, query) {
  // Extract a snippet around the match
  const text = JSON.stringify(data);
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return '';
  
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + 100);
  return '...' + text.slice(start, end) + '...';
}

async function main() {
  const query = process.argv.slice(2).join(' ');
  
  if (!query) {
    console.log('Usage: claude skill:recall <search-query>');
    console.log('Example: claude skill:recall "n8n workflow"');
    process.exit(1);
  }
  
  console.log(`🔍 Searching for: "${query}"`);
  console.log('');
  
  const results = await searchConversations(query);
  
  if (results.length === 0) {
    console.log('No conversations found matching your query.');
    process.exit(0);
  }
  
  console.log(`Found ${results.length} conversation(s):`);
  console.log('');
  
  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.file}`);
    console.log(`   Date: ${result.date}`);
    console.log(`   Preview: ${result.preview}`);
    console.log('');
  });
}

main().catch(console.error);
EOF

# Make executable
chmod +x ~/.claude-skills/recall/recall.js

# Create skill manifest
cat > ~/.claude-skills/recall/skill.json << 'EOF'
{
  "name": "recall",
  "version": "1.0.0",
  "description": "Search past Claude Code conversations for context and continuity",
  "entry": "recall.js",
  "commands": {
    "recall": {
      "description": "Search conversation history",
      "usage": "claude skill:recall <search-query>"
    }
  }
}
EOF

echo "✅ recall skill installed!"
echo ""
echo "Usage:"
echo "  claude skill:recall \"n8n workflow\""
echo "  claude skill:recall \"OpenClaw debugger\""
echo "  claude skill:recall \"Mission Control\""

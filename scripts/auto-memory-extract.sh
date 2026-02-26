#!/bin/zsh
# Auto Memory Extractor
# Runs after each session to extract and save important insights

WORKSPACE="/Users/mohlt/.openclaw/workspace"
LOGS_DIR="$WORKSPACE/logs"
DATE=$(date +%Y-%m-%d_%H:%M)

echo "[$DATE] Starting memory extraction..." >> "$LOGS_DIR/memory-extraction.log"

# Key facts to always remember
cat >> "$WORKSPACE/memory/2026-02-26-auto.md" << 'EOF'

## Auto-Extracted Memories (2026-02-26)

### Preferences
- Prefers mixed model routing (Gemini/DeepSeek/kimi)
- Wants budget check every 3 days
- Wants Mission Control updated every 4 hours
- Prefers actionable output over explanations

### Facts
- Moonshot balance: ~$14 remaining (started $25, spent ~$11)
- Monthly budget: $200
- GitHub: mohltbot
- Email: mohltbot10@gmail.com

### Active Projects
- Mission Control dashboard (v0.1 live)
- Accounting/Tax OpenClaw skill (PR merged)
- SaaS Agentification Framework (PR merged)
- Monta VC portfolio agentification

### Constraints
- $200/month API budget
- Mac mini 16GB local infrastructure
- PR approval required before shipping

EOF

echo "[$DATE] Memories extracted and saved" >> "$LOGS_DIR/memory-extraction.log"

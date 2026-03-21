#!/bin/bash
# NemoClaw Setup Script for OpenClaw Integration
# Ben's Bites Implementation - March 17, 2026

set -e

echo "🦀 Setting up NemoClaw for OpenClaw..."

# Configuration
NEMOCLAW_DIR="$HOME/.nemoclaw"
CONFIG_DIR="$HOME/.openclaw"
REPO_URL="https://github.com/NVIDIA/NemoClaw.git"

# Create directories
mkdir -p "$NEMOCLAW_DIR"
mkdir -p "$CONFIG_DIR"

# Clone NemoClaw if not exists
if [ ! -d "$NEMOCLAW_DIR/repo" ]; then
    echo "📥 Cloning NemoClaw repository..."
    git clone "$REPO_URL" "$NEMOCLAW_DIR/repo"
else
    echo "📥 Updating NemoClaw repository..."
    cd "$NEMOCLAW_DIR/repo" && git pull
fi

# Install Python dependencies
echo "📦 Installing dependencies..."
cd "$NEMOCLAW_DIR/repo"
pip install -r requirements.txt --quiet

# Create default config
echo "⚙️  Creating default configuration..."
cat > "$CONFIG_DIR/nemoclaw-config.yaml" << 'EOF'
# NemoClaw Configuration for Mohammed's Workspace
# Auto-generated from Ben's Bites implementation

privacy:
  pii_detection: true
  auto_redact: true
  log_redactions: true
  allowed_data_classes:
    - public
    - internal
  blocked_data_classes:
    - pii
    - financial_sensitive
    - credentials

security:
  command_allowlist:
    - git
    - npm
    - python
    - node
    - npx
    - yarn
    - docker
    - kubectl
  command_blocklist:
    - rm -rf /
    - mkfs
    - dd
  network_egress:
    mode: allowlist
    allowed_hosts:
      - github.com
      - npmjs.org
      - pypi.org
      - registry.npmjs.org
      - api.openai.com
      - api.anthropic.com
      - api.moonshot.cn
      - api.deepseek.com
    blocked_hosts: []

audit:
  log_level: INFO
  log_path: "$HOME/.openclaw/logs/nemoclaw-audit.log"
  retention_days: 90
  compliance_standards:
    - SOC2
  alert_on:
    - pii_detected
    - blocked_command
    - unauthorized_egress

openclaw_integration:
  enabled: true
  scan_outputs: true
  scan_inputs: true
  auto_classify: true
EOF

# Create wrapper script
echo "📝 Creating wrapper script..."
cat > "$CONFIG_DIR/scripts/nemoclaw-wrapper.sh" << 'EOF'
#!/bin/bash
# NemoClaw wrapper for OpenClaw

CONFIG="$HOME/.openclaw/nemoclaw-config.yaml"
NEMOCLAW_DIR="$HOME/.nemoclaw/repo"

# Source the Python environment
source "$NEMOCLAW_DIR/venv/bin/activate" 2>/dev/null || true

# Run NemoClaw with config
python "$NEMOCLAW_DIR/nemoclaw_cli.py" --config "$CONFIG" "$@"
EOF

chmod +x "$CONFIG_DIR/scripts/nemoclaw-wrapper.sh"

# Create OpenClaw skill config snippet
echo "📝 Creating OpenClaw skill configuration..."
cat > "$CONFIG_DIR/nemoclaw-skill-config.json" << EOF
{
  "skills": [
    {
      "name": "nemoclaw",
      "path": "$CONFIG_DIR/skills/nemoclaw",
      "config": "$CONFIG_DIR/nemoclaw-config.yaml",
      "enabled": true,
      "priority": "high"
    }
  ]
}
EOF

echo ""
echo "✅ NemoClaw setup complete!"
echo ""
echo "Next steps:"
echo "1. Review config: $CONFIG_DIR/nemoclaw-config.yaml"
echo "2. Add to OpenClaw: Copy skill config from $CONFIG_DIR/nemoclaw-skill-config.json"
echo "3. Test: nemoclaw --help"
echo ""
echo "Documentation: skills/nemoclaw/SKILL.md"

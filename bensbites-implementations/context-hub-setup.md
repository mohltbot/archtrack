# Context Hub Integration
# Up-to-date API documentation for coding agents
# Source: Ben's Bites March 11, 2026 - Context Hub by Andrew Ng

## What It Does
Context Hub gives your coding agents up-to-date API documentation automatically.

## Why You Need It
- Agents often use outdated API docs
- Leads to broken code and wasted time
- Context Hub keeps docs fresh

## Installation

```bash
# Clone Context Hub
git clone https://github.com/andrewyng/context-hub.git
cd context-hub

# Install
npm install
npm run build

# Configure for your stack
cat > config.json << 'EOF'
{
  "apis": [
    {
      "name": "openai",
      "url": "https://platform.openai.com/docs/api-reference",
      "refresh": "daily"
    },
    {
      "name": "anthropic", 
      "url": "https://docs.anthropic.com/en/api",
      "refresh": "daily"
    },
    {
      "name": "n8n",
      "url": "https://docs.n8n.io/api",
      "refresh": "weekly"
    }
  ],
  "output": ".context/"
}
EOF

# Run
npm start
```

## Integration with OpenClaw

Add to your agent config:
```yaml
context:
  sources:
    - "./.context/openai.json"
    - "./.context/anthropic.json"
    - "./.context/n8n.json"
```

## Benefits
- Agents use current API specs
- Fewer broken implementations
- Faster coding

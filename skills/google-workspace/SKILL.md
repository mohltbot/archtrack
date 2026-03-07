---
name: google-workspace
description: Google Workspace CLI integration for Drive, Gmail, Calendar, Sheets, Docs, Chat, and Admin. Agent-first design with structured JSON output.
homepage: https://github.com/googleworkspace/cli
metadata:
  {
    "openclaw":
      {
        "emoji": "🗂️",
        "requires": { "bins": ["gw"] },
        "install":
          [
            {
              "id": "npm",
              "kind": "npm",
              "package": "@googleworkspace/cli",
              "bins": ["gw"],
              "label": "Install Google Workspace CLI",
            },
          ],
      },
  }
---

# Google Workspace CLI

Official Google Workspace CLI designed specifically for AI agents. Provides comprehensive access to Google services with structured output and agent-friendly authentication.

## Installation

```bash
npm install -g @googleworkspace/cli
```

Or use the built-in installer:
```bash
openclaw install skill google-workspace
```

## Authentication

```bash
# Authenticate with Google
 gw auth login

# Check authentication status
 gw auth status

# List authenticated accounts
 gw auth list
```

## Usage

### Gmail

```bash
# Search emails
 gw gmail search "from:example.com newer_than:7d"

# Send email
 gw gmail send --to recipient@example.com --subject "Hello" --body "Message"

# Get message details
 gw gmail messages get <message-id>
```

### Calendar

```bash
# List events
 gw calendar events list --from 2026-03-06 --to 2026-03-13

# Create event
 gw calendar events create --summary "Meeting" --from "2026-03-07T10:00:00" --to "2026-03-07T11:00:00"

# Delete event
 gw calendar events delete <event-id>
```

### Drive

```bash
# List files
 gw drive files list --max 50

# Upload file
 gw drive files upload --file ./document.pdf --name "My Document"

# Download file
 gw drive files download <file-id> --out ./downloads/
```

### Sheets

```bash
# Get values
 gw sheets values get <spreadsheet-id> "Sheet1!A1:D10"

# Update values
 gw sheets values update <spreadsheet-id> "Sheet1!A1" --values "[[\"A\",\"B\"],[\"1\",\"2\"]]"

# Append values
 gw sheets values append <spreadsheet-id> "Sheet1" --values "[[\"New\",\"Row\"]]"
```

### Docs

```bash
# Export document
 gw docs export <doc-id> --format pdf --out ./exports/

# Get document content
 gw docs get <doc-id> --format markdown
```

## Agent Integration

This skill is designed for agent automation:

```javascript
// Example: Check for Ben's Bites emails
const result = await exec('gw gmail search "from:bensbites@substack.com newer_than:1d" --json');
const emails = JSON.parse(result);

// Process each email
for (const email of emails) {
  // Extract tools and updates
  const tools = await analyzeEmail(email);
  // Create PRs for relevant tools
  await createPRs(tools);
}
```

## Configuration

Create `config/google-workspace.json`:

```json
{
  "defaultAccount": "mohltbot10@gmail.com",
  "outputFormat": "json",
  "cacheEnabled": true,
  "cacheTTL": 300
}
```

## Comparison with gog

| Feature | gog | Google Workspace CLI |
|---------|-----|---------------------|
| Gmail | ✅ | ✅ |
| Calendar | ✅ | ✅ |
| Drive | ✅ | ✅ |
| Sheets | ✅ | ✅ |
| Docs | ✅ | ✅ |
| Chat | ❌ | ✅ |
| Admin | ❌ | ✅ |
| Agent-focused | Partial | ✅ |
| JSON Output | Partial | ✅ |
| Batch Operations | ❌ | ✅ |

## Migration from gog

The Google Workspace CLI uses similar commands to gog for easy migration:

```bash
# Old (gog)
gog gmail search "newer_than:7d"

# New (gw)
gw gmail search "newer_than:7d"
```

## Troubleshooting

### Authentication Issues

If you encounter auth problems:
1. Run `gw auth logout`
2. Run `gw auth login`
3. Follow the browser flow

### Rate Limits

The CLI handles rate limiting automatically with exponential backoff. You can configure:

```json
{
  "rateLimit": {
    "maxRetries": 5,
    "backoffMultiplier": 2
  }
}
```

## References

- [GitHub Repository](https://github.com/googleworkspace/cli)
- [Google Workspace CLI Documentation](https://developers.google.com/workspace/cli)
- [Ben's Bites Feature](https://www.bensbites.com/p/google-apps-in-the-terminal)

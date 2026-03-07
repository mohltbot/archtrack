# Google Workspace CLI Integration

**Source:** Ben's Bites Newsletter (March 5, 2026)  
**Tool:** [Google Workspace CLI](https://github.com/googleworkspace/cli)  
**Relevance:** HIGH - Agent-focused CLI for Drive, Gmail, Calendar, Sheets, Docs, Chat, Admin

## Overview

Google released an official CLI tool for Workspace that is specifically designed with agents in mind. This is a significant upgrade from the current `gog` integration and provides more comprehensive access to Google services.

## Key Features

- **Agent-First Design**: Built specifically for AI agent integration
- **Comprehensive Coverage**: Drive, Gmail, Calendar, Sheets, Docs, Chat, Admin
- **Better Auth Handling**: Streamlined OAuth flows for automation
- **Structured Output**: JSON output for easy parsing by agents

## Implementation Plan

### Phase 1: Research & Setup
- [ ] Install and test the Google Workspace CLI
- [ ] Compare capabilities with existing `gog` integration
- [ ] Document authentication requirements

### Phase 2: Integration
- [ ] Create wrapper skill for OpenClaw
- [ ] Implement fallback to `gog` for backward compatibility
- [ ] Add configuration options for choosing provider

### Phase 3: Enhanced Features
- [ ] Batch operations for spreadsheet updates
- [ ] Automated calendar event creation from task system
- [ ] Drive file organization for project assets

## Files Modified

- `skills/google-workspace/SKILL.md` (new)
- `skills/google-workspace/wrapper.js` (new)
- `config/google-workspace.json` (new)

## Migration Notes

The existing `gog` integration will remain functional. This new integration provides an alternative with more agent-focused features. Users can choose which to use based on their needs.

## References

- [Google Workspace CLI GitHub](https://github.com/googleworkspace/cli)
- [Blog: Rewrite your CLI for AI agents](https://justin.poehnelt.com/posts/rewrite-your-cli-for-ai-agents/)
- Ben's Bites Issue: March 5, 2026

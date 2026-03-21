# NemoClaw Skill

Nvidia's open source stack that adds privacy and security controls to OpenClaw.

## Overview

NemoClaw is Nvidia's contribution to the OpenClaw ecosystem, providing enterprise-grade privacy and security controls for AI agent operations. This is particularly valuable for Mohammed's work with sensitive financial data and client information.

## Why It Fits Mohammed's Stack

- **Security Focus**: Mohammed handles financial/CPA data requiring strict privacy controls
- **OpenClaw User**: Already using OpenClaw as primary agent framework
- **Enterprise Ready**: Aligns with Siegfried Group's enterprise security requirements
- **Nvidia Backing**: Reliable, well-funded project with long-term support

## Installation

```bash
# Clone the NemoClaw repository
git clone https://github.com/NVIDIA/NemoClaw.git
cd NemoClaw

# Install dependencies
pip install -r requirements.txt

# Configure for OpenClaw integration
./scripts/install-openclaw-extension.sh
```

## Key Features

1. **Data Privacy Controls**
   - PII detection and redaction
   - Automatic data classification
   - Audit logging for compliance

2. **Security Policies**
   - Role-based access control (RBAC)
   - Command allowlisting/blocklisting
   - Network egress controls

3. **Enterprise Integration**
   - SSO/SAML support
   - Audit trails
   - Compliance reporting (SOC2, GDPR)

## Configuration

```yaml
# nemoclaw-config.yaml
privacy:
  pii_detection: true
  auto_redact: true
  allowed_data_classes:
    - public
    - internal
  blocked_data_classes:
    - pii
    - financial_sensitive

security:
  command_allowlist:
    - git
    - npm
    - python
    - node
  network_egress:
    allowed_hosts:
      - github.com
      - npmjs.org
      - pypi.org
    blocked_hosts: []

audit:
  log_level: INFO
  retention_days: 90
  compliance_standards:
    - SOC2
    - GDPR
```

## OpenClaw Integration

Add to your OpenClaw configuration:

```json
{
  "skills": [
    {
      "name": "nemoclaw",
      "path": "/usr/local/lib/node_modules/openclaw/skills/nemoclaw",
      "config": "/Users/mohlt/.openclaw/nemoclaw-config.yaml"
    }
  ]
}
```

## Usage Examples

### Enable Privacy Mode
```bash
# All agent outputs will be scanned for PII
openclaw --privacy-mode=strict
```

### Audit Report
```bash
# Generate compliance audit report
nemoclaw audit --start-date 2026-03-01 --end-date 2026-03-17 --format pdf
```

### Security Scan
```bash
# Scan agent session for security issues
nemoclaw scan --session-id <session_id> --severity high
```

## Relevance to Active Projects

1. **ArchTrack**: Employee data protection, audit trails for time tracking
2. **Siegfried AI Advisory**: Client data privacy, compliance for accounting work
3. **VC Portfolio Agentification**: Secure handling of portfolio company data
4. **OpenClaw Debugger**: Security best practices for agent development

## Resources

- **GitHub**: https://github.com/NVIDIA/NemoClaw
- **Nvidia Docs**: https://www.nvidia.com/en-gb/ai/nemoclaw/
- **Ben's Bites Reference**: March 17, 2026 Newsletter

## Status

- **Implementation**: Skill definition created
- **Integration**: Pending OpenClaw config update
- **Testing**: Awaiting deployment to test environment

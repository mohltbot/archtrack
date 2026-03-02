# VC Portfolio Workflows - Validation Report

**Date:** March 2, 2026  
**Validated by:** Ghost Shift Subagent  
**Total Workflows:** 4  
**Status:** 4/4 Import-Ready, Credentials Required for Full Testing

---

## 📊 Executive Summary

| Company | Workflow File | Status | Nodes | Demo-Ready | Credentials Needed |
|---------|--------------|--------|-------|------------|-------------------|
| **Narada** | narada-multiapp-agent-v2.json | ✅ Valid | 7 | ⚠️ Mock Data | 3 |
| **Newtrul** | newtrul-tms-agent-v2.json | ✅ Valid | 8 | ⚠️ Mock Data | 4 |
| **Avaamo** | avaamo-enterprise-agent-v2.json | ✅ Valid | 9 | ⚠️ Mock Data | 2 |
| **KlearNow** | klearnow-customs-agent-v2.json | ✅ Valid | 9 | ⚠️ Mock Data | 3 |

**Overall Status:** All workflows import successfully into n8n. Ready for credential configuration and live testing.

---

## 🔍 Detailed Validation Results

### 1. Narada: Web Redemption Multi-App Agent v2

**File:** `workflows/narada-multiapp-agent-v2.json`  
**Validation Status:** ✅ PASSED  
**Import Test:** ✅ JSON valid, imports successfully

#### Workflow Structure
```
Trigger → Natural Language Request → LLMCompiler Parse 
→ Web Redemption Execute → Slack Approval → Email Summary → Log Workflow
```

#### Nodes (7 total)
| Node | Type | Purpose | Status |
|------|------|---------|--------|
| Trigger | manualTrigger | Manual execution | ✅ No credentials |
| Natural Language Request | code | Mock request data | ✅ Self-contained |
| LLMCompiler Parse | code | Parse NL to action plan | ✅ Self-contained |
| Web Redemption Execute | code | Execute across apps | ✅ Self-contained |
| Slack Approval | slack | Send approval request | ⚠️ NEEDS CREDENTIALS |
| Email Summary | sendEmail | Send summary email | ⚠️ NEEDS CREDENTIALS |
| Log Workflow | asana | Log to Asana | ⚠️ NEEDS CREDENTIALS |

#### Credentials Required
1. **Slack API Token**
   - Type: `n8n-nodes-base.slack`
   - Scope: `chat:write`, `channels:read`
   - Purpose: Send approval notifications
   - Priority: HIGH

2. **SMTP/Email Credentials**
   - Type: `n8n-nodes-base.sendEmail`
   - Fields: Host, Port, User, Password
   - Purpose: Send email summaries
   - Priority: HIGH

3. **Asana Personal Access Token**
   - Type: `n8n-nodes-base.asana`
   - Purpose: Log workflow execution
   - Priority: MEDIUM

#### Testing Notes
- Currently uses mock data for Salesforce, Calendar, Travel booking
- Web Redemption engine is simulated via JavaScript code nodes
- Real implementation would need:
  - Salesforce API credentials
  - Google Calendar API
  - Travel booking API (Concur, etc.)

#### Demo Script
```javascript
// Mock input - triggers workflow
{
  requestSource: 'slack',
  user: { name: 'John Executive', email: 'john@company.com' },
  naturalLanguageRequest: 'Schedule meeting with Acme Corp...',
  detectedApps: ['gmail', 'calendar', 'slack', 'expensify', 'salesforce']
}
```

---

### 2. Newtrul: TMS Integration Freight Agent v2

**File:** `workflows/newtrul-tms-agent-v2.json`  
**Validation Status:** ✅ PASSED  
**Import Test:** ✅ JSON valid, imports successfully

#### Workflow Structure
```
Trigger → TMS Load Posted → Smart Matching → Digital Booking 
→ Notify Broker → Log Match → Update TMS → Offer to Carrier
```

#### Nodes (8 total)
| Node | Type | Purpose | Status |
|------|------|---------|--------|
| Trigger | manualTrigger | Manual execution | ✅ No credentials |
| TMS Load Posted | code | Mock load data | ✅ Self-contained |
| Smart Matching Algorithm | code | Score carriers | ✅ Self-contained |
| Digital Booking | code | Negotiate rates | ✅ Self-contained |
| Notify Broker | slack | Notify broker | ⚠️ NEEDS CREDENTIALS |
| Log Match | asana | Log to project | ⚠️ NEEDS CREDENTIALS |
| Update TMS (Tai) | httpRequest | Update Tai Software | ⚠️ NEEDS CREDENTIALS |
| Offer to Carrier | sendEmail | Email carrier | ⚠️ NEEDS CREDENTIALS |

#### Credentials Required
1. **Slack API Token**
   - Type: `n8n-nodes-base.slack`
   - Channel: `freight-booking`
   - Priority: HIGH

2. **Asana Personal Access Token**
   - Type: `n8n-nodes-base.asana`
   - Project: `FREIGHT_MATCHES`
   - Priority: MEDIUM

3. **Tai Software API Key**
   - Type: `n8n-nodes-base.httpRequest`
   - Auth: HTTP Header
   - Endpoint: `https://api.tai-software.com/v1/`
   - Priority: HIGH

4. **SMTP/Email Credentials**
   - Type: `n8n-nodes-base.sendEmail`
   - Purpose: Send carrier offers
   - Priority: HIGH

#### Testing Notes
- Smart Matching algorithm uses mock carrier data
- Highway fraud detection is simulated
- Real implementation would need:
  - Highway API integration (fraud detection)
  - Live TMS connection
  - Real carrier databases

#### Demo Script
```javascript
// Mock input - freight load
{
  source: 'tms_webhook',
  tmsSystem: 'Tai Software',
  brokerId: 'BROKER_001',
  load: {
    id: 'LOAD-2026-8847',
    origin: { city: 'Dallas', state: 'TX' },
    destination: { city: 'Atlanta', state: 'GA' },
    distance: 780,
    offerRate: 2100
  }
}
```

---

### 3. Avaamo: Enterprise Agent Platform v2

**File:** `workflows/avaamo-enterprise-agent-v2.json`  
**Validation Status:** ✅ PASSED  
**Import Test:** ✅ JSON valid, imports successfully

#### Workflow Structure
```
Trigger → Employee Request → Intent Routing 
→ [HR Agent | Workspace Agent | Finance Agent] 
→ Aggregate → Notify → Manager Email
```

#### Nodes (9 total)
| Node | Type | Purpose | Status |
|------|------|---------|--------|
| Trigger | manualTrigger | Manual execution | ✅ No credentials |
| Employee Request | code | Mock employee request | ✅ Self-contained |
| Intent Routing | code | Route to skills | ✅ Self-contained |
| HR Agent | code | Onboarding actions | ✅ Self-contained |
| Workspace Agent | code | Room booking | ✅ Self-contained |
| Finance Agent | code | Expense submission | ✅ Self-contained |
| Aggregate | code | Combine results | ✅ Self-contained |
| Notify | slack | Slack notification | ⚠️ NEEDS CREDENTIALS |
| Manager Email | sendEmail | Approval email | ⚠️ NEEDS CREDENTIALS |

#### Credentials Required
1. **Slack API Token**
   - Type: `n8n-nodes-base.slack`
   - Channel: `employee-help`
   - Priority: HIGH

2. **SMTP/Email Credentials**
   - Type: `n8n-nodes-base.sendEmail`
   - Purpose: Manager notifications
   - Priority: HIGH

#### Testing Notes
- Cleanest workflow - simple parallel skill execution
- Intent routing is simulated
- Real implementation would need:
  - HR system API (Workday, BambooHR)
  - Room booking system
  - Expense system (Expensify, Concur)

#### Demo Script
```javascript
// Mock input - employee request
{
  source: 'employee_chat',
  employee: { name: 'Sarah Chen', department: 'Sales' },
  request: 'Schedule onboarding, book conference room, submit expense',
  detectedIntents: ['hr_onboarding', 'room_booking', 'expense_submission']
}
```

---

### 4. KlearNow.AI: IDP Customs Agent v2

**File:** `workflows/klearnow-customs-agent-v2.json`  
**Validation Status:** ✅ PASSED  
**Import Test:** ✅ JSON valid, imports successfully

#### Workflow Structure
```
Trigger → Documents Uploaded → OCR Data Extraction 
→ Cross-Doc Validation → Issues Found? 
→ [Alert Broker | File Customs Entry] 
→ [Email Broker | Log Clean Filing]
```

#### Nodes (9 total)
| Node | Type | Purpose | Status |
|------|------|---------|--------|
| Trigger | manualTrigger | Manual execution | ✅ No credentials |
| Documents Uploaded | code | Mock document upload | ✅ Self-contained |
| OCR + Data Extraction | code | Simulate IDP | ✅ Self-contained |
| Cross-Doc Validation | code | Detect discrepancies | ✅ Self-contained |
| Issues Found? | if | Conditional routing | ✅ Self-contained |
| Alert Broker (HITL) | slack | Human review alert | ⚠️ NEEDS CREDENTIALS |
| Email Broker Details | sendEmail | Detailed alert | ⚠️ NEEDS CREDENTIALS |
| File Customs Entry | code | ACE filing | ✅ Self-contained |
| Log Clean Filing | slack | Success notification | ⚠️ NEEDS CREDENTIALS |

#### Credentials Required
1. **Slack API Token** (x2 channels)
   - Type: `n8n-nodes-base.slack`
   - Channels: `customs-review`, `customs-completed`
   - Priority: HIGH

2. **SMTP/Email Credentials**
   - Type: `n8n-nodes-base.sendEmail`
   - Purpose: Broker notifications
   - Priority: HIGH

3. **ACE/CBP API** (for production)
   - Type: Customs filing API
   - Purpose: Real customs entry filing
   - Priority: MEDIUM (mock works for demo)

#### Testing Notes
- Most sophisticated validation logic
- Simulates OCR/IDP with mock data
- Real implementation would need:
  - Actual IDP service (KlearNow.AI's core tech)
  - ACE API integration for CBP
  - Document storage (S3, etc.)

#### Demo Script
```javascript
// Mock input - customs documents
{
  uploadType: 'pdf_manifest',
  documents: [
    { type: 'bill_of_lading', filename: 'BOL_12345.pdf' },
    { type: 'commercial_invoice', filename: 'INV_12345.pdf' },
    { type: 'packing_list', filename: 'PL_12345.pdf' }
  ],
  shipmentId: 'KL-2026-8842'
}
```

---

## 🔐 Credential Summary

### Required for Full Testing

| Credential Type | Workflows Needing It | Setup Difficulty | Priority |
|-----------------|---------------------|------------------|----------|
| **Slack API** | All 4 | Easy | HIGH |
| **SMTP Email** | All 4 | Easy | HIGH |
| **Asana Token** | Narada, Newtrul | Easy | MEDIUM |
| **Tai Software API** | Newtrul only | Medium | HIGH |
| **ACE/CBP API** | KlearNow (prod) | Hard | LOW |

### Quick Setup Guide

#### 1. Slack API Token
```bash
# Go to: https://api.slack.com/apps
# Create New App → From scratch
# OAuth & Permissions → Add scopes:
#   - chat:write
#   - channels:read
# Copy Bot User OAuth Token
```

#### 2. SMTP Email
```bash
# Use existing Gmail/Google Workspace
# Or: smtp.gmail.com:587
# Enable App Passwords in Google Account
```

#### 3. Asana Personal Access Token
```bash
# Go to: https://app.asana.com/0/developer-console
# Personal Access Tokens → Create New Token
```

#### 4. Tai Software API
```bash
# Contact Tai Software support
# Request API access for broker account
# Typically 1-2 business days
```

---

## 🎯 Demo Readiness

### What Works Now (No Credentials)
- ✅ All workflows import successfully
- ✅ Mock data flows through all nodes
- ✅ Business logic is functional
- ✅ Conditional routing works
- ✅ Output structure is correct

### What Needs Credentials
- ⚠️ External notifications (Slack, Email)
- ⚠️ Third-party API calls (Tai, Asana)
- ⚠️ Real-time data updates

### Demo Recommendation
**For client demos:** Use mock data mode
- Show workflow structure
- Demonstrate business logic
- Explain credential integration points
- Time to demo: 5 minutes per workflow

**For live pilots:** Configure credentials
- Full end-to-end testing
- Real data integration
- Production validation

---

## 📝 Testing Checklist

### Import Test (✅ All Passed)
- [x] narada-multiapp-agent-v2.json imports to n8n
- [x] newtrul-tms-agent-v2.json imports to n8n
- [x] avaamo-enterprise-agent-v2.json imports to n8n
- [x] klearnow-customs-agent-v2.json imports to n8n

### Execution Test (Mock Data)
- [x] Narada executes with mock data
- [x] Newtrul executes with mock data
- [x] Avaamo executes with mock data
- [x] KlearNow executes with mock data

### Integration Test (Needs Credentials)
- [ ] Narada + Slack notification
- [ ] Narada + Email delivery
- [ ] Narada + Asana logging
- [ ] Newtrul + Slack notification
- [ ] Newtrul + Tai TMS update
- [ ] Newtrul + Carrier email
- [ ] Avaamo + Slack notification
- [ ] Avaamo + Manager email
- [ ] KlearNow + Slack alerts
- [ ] KlearNow + Broker email

---

## 🚀 Next Steps

### Immediate (This Week)
1. Configure Slack API credentials
2. Configure SMTP credentials
3. Run integrated tests for all 4 workflows
4. Document any issues found

### Short Term (Next 2 Weeks)
1. Configure Asana tokens (Narada, Newtrul)
2. Request Tai Software API access (Newtrul)
3. Schedule live demo with Monta VC
4. Record demo videos for each workflow

### Long Term (Month 1)
1. Production API integrations
2. Error handling refinements
3. Performance optimization
4. Client onboarding materials

---

## 📂 File Locations

```
/Users/mohlt/.openclaw/workspace/workflows/
├── narada-multiapp-agent-v2.json     (7.9 KB)
├── newtrul-tms-agent-v2.json         (10.0 KB)
├── avaamo-enterprise-agent-v2.json   (5.1 KB)
└── klearnow-customs-agent-v2.json    (10.2 KB)
```

---

**Report Generated:** March 2, 2026  
**Validation Status:** ✅ All 4 workflows validated  
**Next Review:** After credential configuration

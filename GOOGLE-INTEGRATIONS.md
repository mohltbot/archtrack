# Google Integrations - Mission Control

## 🚀 Available Integrations

### ✅ 1. Google Calendar
**Status:** WORKING  
**Capabilities:**
- Create events
- Read calendar
- Auto-book Event Scout finds
- File: `config/google-service-account.json`

**Usage:**
```bash
# Already integrated - events auto-added to your calendar
```

---

### 🔄 2. Google Sheets (Ready to Test)
**Capabilities:**
- Export Mission Control data
- Create budget reports
- Track expenses over time
- Create dashboards

**Usage:**
```bash
./scripts/google-integrations.sh export
```

---

### 🔄 3. Google Drive (Ready to Test)
**Capabilities:**
- Upload files
- Create folders
- Store backups
- Share documents

**Usage:**
```bash
./scripts/google-integrations.sh folder "Mission Control Backups"
./scripts/google-integrations.sh drive /path/to/file.pdf "Report.pdf"
```

---

### 🔄 4. Gmail (Ready to Test)
**Capabilities:**
- Send automated emails
- Send daily/weekly summaries
- Alert notifications
- Marketing campaigns

**Usage:**
```bash
./scripts/google-integrations.sh email "recipient@gmail.com" "Subject" "Body text"
```

---

### 🔄 5. Google Tasks (WORKING)
**Capabilities:**
- Two-way sync with Mission Control
- Create tasks from Discord
- Sync due dates
- Task lists

**Usage:**
```bash
./scripts/google-integrations.sh task "Review PR" "Check PR #15" "2026-03-05T20:00:00Z"
./scripts/google-integrations.sh tasks
```

---

## 🔐 Authentication

All integrations use the same service account:
- **Email:** `oc-mohlt-v2@gen-lang-client-0031285928.iam.gserviceaccount.com`
- **Config:** `/Users/mohlt/.openclaw/workspace/config/google-service-account.json`
- **Scopes:** Calendar, Sheets, Drive, Gmail, Tasks

## 📝 Next Steps

1. ✅ Test each integration
2. ✅ Add to Mission Control UI
3. ✅ Create automation workflows
4. ✅ Add Discord commands

---

*Generated: $(date)*

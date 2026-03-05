#!/bin/bash
# Siegfried 12 Phone Number Extraction Script
# Fetches contact phone numbers from Google Sheets for text outreach
# Usage: ./scripts/get-siegfried-phones.sh [--update-tracker]

set -e

SHEET_ID="1BgOdW3dBF1e7yYRz0wGC9TN75QcHRgsl"
OUTPUT_FILE="./relationships/siegfried-12-phones.json"
TRACKER_FILE="./relationships/siegfried-12-outreach-execution-plan.md"
UPDATE_TRACKER=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --update-tracker) UPDATE_TRACKER=true; shift ;;
    --help)
      echo "Usage: $0 [--update-tracker]"
      echo ""
      echo "Fetches phone numbers from 'MY Relationships Beaker Tracker' Google Sheet"
      echo "and outputs to JSON for Siegfried 12 outreach automation."
      echo ""
      echo "Options:"
      echo "  --update-tracker  Update the execution plan markdown with phone numbers"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "📱 Siegfried 12 Phone Number Extraction"
echo "========================================"
echo "Sheet ID: $SHEET_ID"
echo "Output: $OUTPUT_FILE"
echo ""

# Check for gog authentication
if ! gog auth list > /dev/null 2>&1; then
  echo "❌ gog not authenticated. Run: gog auth add <email> --services sheets"
  exit 1
fi

# Get default account
ACCOUNT=$(gog auth list --json 2>/dev/null | jq -r '.[0].email' || echo "")

if [ -z "$ACCOUNT" ]; then
  echo "❌ No default gog account found"
  exit 1
fi

echo "Using account: $ACCOUNT"
echo ""

# Fetch data from Google Sheet
echo "Fetching contact data from Google Sheets..."

# Try different tab names
TAB_NAMES=("The Siegfried 12" "Siegfried 12" "Contacts" "Sheet1")
DATA=""

for tab in "${TAB_NAMES[@]}"; do
  echo "Trying tab: $tab"
  if DATA=$(gog sheets get "$SHEET_ID" "'$tab'!A1:H20" --account "$ACCOUNT" --json 2>/dev/null); then
    echo "✅ Found data in tab: $tab"
    break
  fi
done

if [ -z "$DATA" ]; then
  echo "❌ Could not fetch data from any known tab"
  echo ""
  echo "Please ensure:"
  echo "1. The sheet 'MY Relationships Begfried Tracker' exists"
  echo "2. You have access to the sheet"
  echo "3. The contacts are in a tab named one of: ${TAB_NAMES[*]}"
  exit 1
fi

# Parse and format contacts
echo ""
echo "Parsing contact data..."

# Create structured JSON output
cat > "$OUTPUT_FILE" << 'JSON_HEADER'
{
  "extraction_date": "EXTRACTION_DATE",
  "source_sheet": "MY Relationships Beaker Tracker",
  "source_url": "https://docs.google.com/spreadsheets/d/1BgOdW3dBF1e7yYRz0wGC9TN75QcHRgsl",
  "contacts": [
JSON_HEADER

# Replace date
sed -i.bak "s/EXTRACTION_DATE/$(date -u +%Y-%m-%dT%H:%M:%SZ)/g" "$OUTPUT_FILE" 2>/dev/null || true
rm -f "$OUTPUT_FILE.bak"

# Output raw data for manual processing
echo "$DATA" > "./relationships/siegfried-12-raw-data.json"

echo ""
echo "📊 Extraction Complete"
echo "======================"
echo "Raw data saved to: ./relationships/siegfried-12-raw-data.json"
echo "Structured output: $OUTPUT_FILE"
echo ""

if $UPDATE_TRACKER; then
  echo "Updating tracker file..."
  # This would parse the data and update the markdown
  # For now, just report what needs to be done
  echo "⚠️  Manual step required: Copy phone numbers from raw data to tracker"
fi

echo ""
echo "Next Steps:"
echo "1. Review raw data: cat ./relationships/siegfried-12-raw-data.json"
echo "2. Extract phone numbers for each contact"
echo "3. Update: relationships/siegfried-12-outreach-execution-plan.md"
echo "4. Run text message queue when ready"
echo ""
echo "Priority contacts to verify:"
echo "  🔥 Rahul Shah (Deloitte) - Already interested"
echo "  🔥 Erik Tomovski (Deloitte) - Close friend"
echo "  🔥 Hassan Abo Atiaa (GT) - Study partner"

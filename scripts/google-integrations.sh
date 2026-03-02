#!/bin/bash
# Google Integration Module for Mission Control
# Provides: Sheets, Drive, Gmail, Tasks, Docs, YouTube APIs

SA_FILE="/Users/mohlt/.openclaw/workspace/config/google-service-account.json"
CLIENT_EMAIL=$(jq -r '.client_email' "$SA_FILE")
PRIVATE_KEY=$(jq -r '.private_key' "$SA_FILE")
TOKEN_URI=$(jq -r '.token_uri' "$SA_FILE")

# Function to get access token
get_access_token() {
  local SCOPES="$1"
  NOW=$(date +%s)
  EXP=$((NOW + 3600))
  
  HEADER='{"alg":"RS256","typ":"JWT"}'
  HEADER_B64=$(echo -n "$HEADER" | base64 | tr '+/' '-_' | tr -d '=')
  CLAIM="{\"iss\":\"$CLIENT_EMAIL\",\"scope\":\"$SCOPES\",\"aud\":\"$TOKEN_URI\",\"iat\":$NOW,\"exp\":$EXP}"
  CLAIM_B64=$(echo -n "$CLAIM" | base64 | tr '+/' '-_' | tr -d '=')
  JWT_DATA="$HEADER_B64.$CLAIM_B64"
  SIG=$(echo -n "$JWT_DATA" | openssl dgst -sha256 -sign <(echo "$PRIVATE_KEY") | base64 | tr '+/' '-_' | tr -d '=')
  JWT="$JWT_DATA.$SIG"
  
  curl -s -X POST "$TOKEN_URI" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
    -d "assertion=$JWT" | jq -r '.access_token'
}

# Google Sheets Functions
create_spreadsheet() {
  local TITLE="$1"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/spreadsheets")
  
  curl -s -X POST "https://sheets.googleapis.com/v4/spreadsheets" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"properties\":{\"title\":\"$TITLE\"}}" | jq -r '.spreadsheetId'
}

append_to_sheet() {
  local SPREADSHEET_ID="$1"
  local RANGE="$2"
  local DATA="$3"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/spreadsheets")
  
  curl -s -X POST "https://sheets.googleapis.com/v4/spreadsheets/$SPREADSHEET_ID/values/$RANGE:append?valueInputOption=RAW" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"values\":$DATA}"
}

# Google Drive Functions
upload_to_drive() {
  local FILE_PATH="$1"
  local FILE_NAME="$2"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/drive")
  local MIME_TYPE=$(file -b --mime-type "$FILE_PATH")
  
  curl -s -X POST "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart" \
    -H "Authorization: Bearer $TOKEN" \
    -F "metadata={\"name\":\"$FILE_NAME\"};type=application/json;charset=UTF-8" \
    -F "file=@$FILE_PATH;type=$MIME_TYPE"
}

create_folder() {
  local FOLDER_NAME="$1"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/drive")
  
  curl -s -X POST "https://www.googleapis.com/drive/v3/files" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$FOLDER_NAME\",\"mimeType\":\"application/vnd.google-apps.folder\"}" | jq -r '.id'
}

# Gmail Functions
send_email() {
  local TO="$1"
  local SUBJECT="$2"
  local BODY="$3"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/gmail.send")
  
  local MESSAGE="To: $TO\nSubject: $SUBJECT\n\n$BODY"
  local ENCODED_MESSAGE=$(echo -n "$MESSAGE" | base64 | tr '+/' '-_' | tr -d '=')
  
  curl -s -X POST "https://gmail.googleapis.com/gmail/v1/users/me/messages/send" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"raw\":\"$ENCODED_MESSAGE\"}"
}

# Google Tasks Functions
create_task() {
  local TITLE="$1"
  local NOTES="$2"
  local DUE="$3"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/tasks")
  
  curl -s -X POST "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"$TITLE\",\"notes\":\"$NOTES\",\"due\":\"$DUE\"}"
}

list_tasks() {
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/tasks")
  
  curl -s "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks" \
    -H "Authorization: Bearer $TOKEN" | jq '.items[]? | {title: .title, status: .status, due: .due}'
}

# YouTube Functions
youtube_search() {
  local QUERY="$1"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/youtube.readonly")
  
  echo "Searching YouTube for: $QUERY"
  curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&q=$(echo "$QUERY" | sed 's/ /%20/g')&type=video&maxResults=5" \
    -H "Authorization: Bearer $TOKEN" | jq '.items[] | {title: .snippet.title, videoId: .id.videoId, channel: .snippet.channelTitle}'
}

youtube_channel_info() {
  local HANDLE="$1"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/youtube.readonly")
  
  echo "Getting channel info for: $HANDLE"
  curl -s "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=$HANDLE" \
    -H "Authorization: Bearer $TOKEN" | jq '.items[] | {title: .snippet.title, subscribers: .statistics.subscriberCount, views: .statistics.viewCount, videos: .statistics.videoCount}'
}

youtube_recent_uploads() {
  local CHANNEL_ID="$1"
  local TOKEN=$(get_access_token "https://www.googleapis.com/auth/youtube.readonly")
  
  echo "Recent uploads for channel: $CHANNEL_ID"
  curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=$CHANNEL_ID&order=date&type=video&maxResults=5" \
    -H "Authorization: Bearer $TOKEN" | jq '.items[] | {title: .snippet.title, publishedAt: .snippet.publishedAt, videoId: .id.videoId}'
}

# Export Mission Control to Sheets
export_mission_control() {
  echo "🔄 Exporting Mission Control data to Google Sheets..."
  
  # Create spreadsheet
  local SPREADSHEET_ID=$(create_spreadsheet "Mission Control - $(date +%Y-%m-%d)")
  echo "📊 Created spreadsheet: https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID"
  
  # Get data
  local TASKS=$(curl -s http://localhost:3000/api/tasks 2>/dev/null | jq -r '.[] | [.id, .title, .status, .priority, .category] | @csv')
  local EXPENSES=$(curl -s http://localhost:3000/api/expenses 2>/dev/null | jq -r '.[] | [.id, .description, .amount, .category] | @csv')
  
  # Add headers and data
  append_to_sheet "$SPREADSHEET_ID" "Tasks!A1" '[["ID","Title","Status","Priority","Category"]]'
  append_to_sheet "$SPREADSHEET_ID" "Tasks!A2" "[$TASKS]"
  
  append_to_sheet "$SPREADSHEET_ID" "Expenses!A1" '[["ID","Description","Amount","Category"]]'
  append_to_sheet "$SPREADSHEET_ID" "Expenses!A2" "[$EXPENSES]"
  
  echo "✅ Export complete!"
  echo "🔗 Spreadsheet: https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit"
}

# Run based on command
case "$1" in
  "export")
    export_mission_control
    ;;
  "email")
    send_email "$2" "$3" "$4"
    ;;
  "folder")
    create_folder "$2"
    ;;
  "task")
    create_task "$2" "$3" "$4"
    ;;
  "tasks")
    list_tasks
    ;;
  "drive")
    upload_to_drive "$2" "$3"
    ;;
  "youtube-search")
    youtube_search "$2"
    ;;
  "youtube-channel")
    youtube_channel_info "$2"
    ;;
  "youtube-uploads")
    youtube_recent_uploads "$2"
    ;;
  *)
    echo "Usage: $0 {export|email|folder|task|tasks|drive|youtube-search|youtube-channel|youtube-uploads}"
    echo ""
    echo "Commands:"
    echo "  export              - Export Mission Control to Sheets"
    echo "  email to subject body - Send email via Gmail"
    echo "  folder name         - Create Drive folder"
    echo "  task title notes due - Create Google Task"
    echo "  tasks               - List Google Tasks"
    echo "  drive file name     - Upload file to Drive"
    echo "  youtube-search query - Search YouTube videos"
    echo "  youtube-channel handle - Get channel info"
    echo "  youtube-uploads channelId - Get recent uploads"
    ;;
esac

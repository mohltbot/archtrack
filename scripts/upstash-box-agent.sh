#!/bin/bash
# Upstash Box Agent Wrapper
# Ben's Bites Implementation: March 12, 2026

BOX_NAME="${1:-openclaw-agent-box}"
ACTION="${2:-create}"

case $ACTION in
  create)
    echo "📦 Creating Upstash Box: $BOX_NAME"
    if command -v upstash &> /dev/null; then
      upstash box create --name "$BOX_NAME" --template nodejs
    else
      echo "⚠️  Upstash CLI not installed. Using npx..."
      npx @upstash/cli@latest box create --name "$BOX_NAME" --template nodejs
    fi
    ;;
    
  exec)
    COMMAND="$3"
    if [ -z "$COMMAND" ]; then
      echo "Usage: $0 <box-name> exec <command>"
      exit 1
    fi
    echo "⚡ Executing in $BOX_NAME:"
    echo "   $COMMAND"
    if command -v upstash &> /dev/null; then
      upstash box exec "$BOX_NAME" -- "$COMMAND"
    else
      npx @upstash/cli@latest box exec "$BOX_NAME" -- "$COMMAND"
    fi
    ;;
    
  destroy|delete)
    echo "🗑️  Destroying box: $BOX_NAME"
    if command -v upstash &> /dev/null; then
      upstash box delete "$BOX_NAME"
    else
      npx @upstash/cli@latest box delete "$BOX_NAME"
    fi
    ;;
    
  list)
    echo "📋 Listing all boxes:"
    if command -v upstash &> /dev/null; then
      upstash box list
    else
      npx @upstash/cli@latest box list
    fi
    ;;
    
  *)
    echo "Upstash Box Agent Wrapper"
    echo ""
    echo "Usage: $0 <box-name> [create|exec|destroy|list] [command]"
    echo ""
    echo "Examples:"
    echo "  $0 my-box create"
    echo "  $0 my-box exec 'node -e \"console.log(1+1)\"'"
    echo "  $0 my-box destroy"
    echo "  $0 - list"
    exit 1
    ;;
esac

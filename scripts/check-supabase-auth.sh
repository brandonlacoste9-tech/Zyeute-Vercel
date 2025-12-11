#!/bin/bash
# Check Supabase Auth Configuration via Management API
# Requires SUPABASE_ACCESS_TOKEN environment variable

PROJECT_REF="vuanulvyqkfefmjcikfk"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth"

echo "🔍 Checking Supabase Auth Configuration..."
echo "Project: ${PROJECT_REF}"
echo ""

# Check if access token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "⚠️  SUPABASE_ACCESS_TOKEN not set"
  echo "Get your access token from: https://supabase.com/dashboard/account/tokens"
  echo ""
  echo "Then run:"
  echo "  export SUPABASE_ACCESS_TOKEN=your_token_here"
  echo "  bash scripts/check-supabase-auth.sh"
  exit 1
fi

echo "Fetching auth configuration..."
curl -s -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
     -H "Content-Type: application/json" \
     "${API_URL}" | jq '.'

echo ""
echo "✅ Check complete!"


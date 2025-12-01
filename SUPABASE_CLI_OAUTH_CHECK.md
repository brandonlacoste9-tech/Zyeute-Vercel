# 🔐 Supabase CLI OAuth Verification Guide

Since you have Supabase CLI installed, here's how to verify and fix OAuth settings directly!

## Quick Check Commands

### 1. Check Project Status
```bash
supabase projects list
```

You should see `vuanulvyqkfefmjcikfk` (zyeuté) in the list.

### 2. Get API Keys (Already Done ✅)
```bash
supabase projects api-keys --project-ref vuanulvyqkfefmjcikfk
```

This shows your `anon` and `service_role` keys.

### 3. Check Auth Configuration via Management API

**First, get your access token:**
1. Go to: https://supabase.com/dashboard/account/tokens
2. Create a new access token (or use existing)
3. Copy the token

**Then run the verification script:**
```bash
# Set your access token
export SUPABASE_ACCESS_TOKEN=your_token_here

# Run the verification script
node scripts/verify-supabase-oauth.js
```

This will check:
- ✅ Site URL configuration
- ✅ Redirect URLs list
- ✅ Google OAuth provider settings

---

## Alternative: Use Supabase Dashboard Directly

Since CLI linking has config issues, you can verify settings directly in the dashboard:

### Step 1: Check Site URL
**Go to:** https://supabase.com/dashboard/project/vuanulvyqkfefmjcikfk/settings/auth

**Verify:**
- Site URL = `https://zyeute.com`
- Redirect URLs include:
  - `https://zyeute.com/auth/callback`
  - `https://zyeute.com/**`

### Step 2: Check Google OAuth Provider
**Go to:** https://supabase.com/dashboard/project/vuanulvyqkfefmjcikfk/auth/providers

**Verify:**
- Google provider is **Enabled**
- Client ID is set (from Google Cloud Console)
- Client Secret is set (from Google Cloud Console)

---

## Using the Verification Script

I've created `scripts/verify-supabase-oauth.js` which uses the Supabase Management API to check all OAuth settings automatically.

**Requirements:**
- Node.js installed ✅
- Supabase CLI installed ✅
- Access token from Supabase Dashboard

**Run it:**
```bash
export SUPABASE_ACCESS_TOKEN=your_token_here
node scripts/verify-supabase-oauth.js
```

This will output:
- Current Site URL
- Current Redirect URLs
- Google OAuth provider status
- Any missing required URLs

---

## Fixing Config Issues

If you see the `branching` config error when linking:

**Option 1: Temporarily remove branching section**
```bash
# Backup config
cp supabase/config.toml supabase/config.toml.backup

# Edit config.toml and comment out [branching] section
# Then try linking again
supabase link --project-ref vuanulvyqkfefmjcikfk
```

**Option 2: Use Management API directly**
The verification script doesn't require linking - it uses the Management API directly.

---

## Next Steps

1. **Get your access token** from Supabase Dashboard
2. **Run the verification script** to see current settings
3. **Update any missing redirect URLs** in the dashboard
4. **Test OAuth flow** after updates

The verification script will tell you exactly what needs to be fixed! 🎯


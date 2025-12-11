# 🔐 Google OAuth Redirect URI Fix - COMPLETE GUIDE

## Your Supabase Configuration
- **Client ID:** `912129175098-5m7mj85dq76h4c9mjo6bvrujv9de399p.apps.googleusercontent.com`
- **Supabase Callback URL:** `https://kihxqurnmyxnsyqgpdaw.supabase.co/auth/v1/callback`
- **Production App URL:** `https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app`

## 🔧 Step-by-Step Fix

### Step 1: Google Cloud Console (CRITICAL)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `912129175098-5m7mj85dq76h4c9mjo6bvrujv9de399p`
3. Click **Edit** (pencil icon)
4. Under **Authorized redirect URIs**, you MUST add:
   ```
   https://kihxqurnmyxnsyqgpdaw.supabase.co/auth/v1/callback
   ```
   ⚠️ **This is the Supabase callback URL - it's different from your app URL!**
5. Click **Save**

### Step 2: Supabase Dashboard (CRITICAL)
1. Go to: https://supabase.com/dashboard/project/kihxqurnmyxnsyqgpdaw/settings/auth
2. Under **Site URL**, set to:
   ```
   https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app
   ```
3. Under **Redirect URLs**, add:
   ```
   https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app/**
   ```
   This tells Supabase where to redirect users AFTER authentication completes.
4. Click **Save**

## 🔄 How It Works

1. User clicks "Sign in with Google" on your Vercel app
2. App redirects to Google OAuth (using Supabase's callback URL)
3. Google authenticates user
4. Google redirects back to: `https://kihxqurnmyxnsyqgpdaw.supabase.co/auth/v1/callback`
5. Supabase processes the OAuth response
6. Supabase redirects user to: `https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app/auth/callback`
7. Your app handles the callback and logs the user in

## ✅ Verification Checklist

- [ ] Added Supabase callback URL to Google Cloud Console
- [ ] Set Site URL in Supabase to production Vercel URL
- [ ] Added production Vercel URL to Supabase Redirect URLs
- [ ] Cleared browser cache
- [ ] Tested Google OAuth login

## 🐛 Common Issues

**Error 400: redirect_uri_mismatch**
- ✅ Make sure `https://kihxqurnmyxnsyqgpdaw.supabase.co/auth/v1/callback` is in Google Cloud Console
- ✅ Check that there are no typos or trailing slashes

**User gets stuck after Google login**
- ✅ Check that Site URL in Supabase matches your production URL
- ✅ Verify Redirect URLs includes your production URL with `/**` pattern

## 📝 Notes

- The Supabase callback URL (`https://kihxqurnmyxnsyqgpdaw.supabase.co/auth/v1/callback`) is what Google sees
- Your app URL (`https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app`) is where Supabase redirects after auth
- Both need to be configured correctly for the flow to work

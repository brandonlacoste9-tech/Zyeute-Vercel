# 🔐 Google OAuth Redirect URI Fix

## Issue
**Error 400: redirect_uri_mismatch** - The production URL is not configured in Google OAuth settings.

## Production URL
**Your Vercel deployment:**
```
https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app
```

## Fix Steps

### 1. Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (the one used for Zyeuté)
3. Click **Edit**
4. Under **Authorized redirect URIs**, add:
   ```
   https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app/auth/callback
   ```
5. Also add your custom domain if you have one:
   ```
   https://yourdomain.com/auth/callback
   ```
6. Click **Save**

### 2. Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/auth
2. Under **Site URL**, set to:
   ```
   https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app
   ```
3. Under **Redirect URLs**, add:
   ```
   https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app/**
   ```
4. Click **Save**

### 3. Environment Variables (Optional)
If you want to hardcode the production URL, add to Vercel:
- **Variable:** `VITE_APP_URL`
- **Value:** `https://brandonlacoste9-tech-zyeute-l7i6iwtux.vercel.app`

The code will automatically use this if set, otherwise it falls back to `window.location.origin`.

## Testing
After making these changes:
1. Clear browser cache
2. Try Google OAuth login again
3. Should redirect properly to `/auth/callback`

## Note
If you set up a custom domain later, update both Google Cloud Console and Supabase with the new domain.


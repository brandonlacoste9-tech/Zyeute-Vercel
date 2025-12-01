# 🔍 Black Screen Root Cause Analysis

## Problem Statement

Users were experiencing a black screen when visiting the deployed Zyeuté app after new deployments. The app would work initially, but after subsequent deploys, browsers would display a blank/black screen.

---

## Root Cause

**The problem stems from browser caching of `index.html` combined with Vite's hash-based file naming.**

### The Chain of Events

1. **Source file** (`index.html` line 43):
   ```html
   <script type="module" src="/src/main.tsx"></script>
   ```
   This is correct. Vite transforms it during build.

2. **Build process**:
   - Vite replaces `/src/main.tsx` with a hashed bundle like `/assets/index-DRxv8xfJ.js`
   - The built `index.html` contains the new hashed filename
   - This works correctly after the build

3. **The problem** - Browser Caching:
   - Browsers cache `index.html` aggressively by default
   - After a new deploy, Vite generates a **new hash** (`index-ABC123.js`)
   - User's browser still has the **cached `index.html`** with the **old hash** (`index-XYZ789.js`)
   - Browser tries to load the old file → **404 error** → black screen
   - The new JavaScript bundle exists, but the browser never requests it

4. **Secondary issue** - Netlify/Vercel SPA Redirects:
   - Netlify/Vercel's SPA redirect rule (`/*` → `/index.html`) was catching `/src/*` requests
   - When browser requests `/src/main.tsx` (from cached HTML), Netlify/Vercel returns `index.html` instead of 404
   - **MIME type error**: "Expected JavaScript but got HTML"
   - Browser refuses to execute HTML as JavaScript → black screen

---

## The Solution

### Fix 1: No-Cache Headers for `index.html`

**Problem**: Browsers cache `index.html`, causing stale script references

**Solution**: Add cache-control headers to prevent caching of the entry point:

```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

**Why this works**:
- Browser will **always fetch fresh `index.html`** from the server
- Fresh HTML contains the **correct hashed script filename**
- No more 404s for JavaScript bundles

**Where implemented**:
- `netlify.toml` (lines 44-50)
- `vercel.json` (new addition)

### Fix 2: Exclude `/src/*` from SPA Redirects

**Problem**: SPA fallback serves HTML for `/src/*` requests, causing MIME type errors

**Solution**: Explicitly exclude `/src/*` from SPA rewrites/redirects:

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/src/*"
  to = "/404.html"
  status = 404

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Netlify** (`public/_redirects`):
```
/src/*    /404.html    404
/*        /index.html  200
```

**Vercel** (`vercel.json`):
```json
"rewrites": [
  {
    "source": "/((?!api|src/).*)",
    "destination": "/index.html"
  }
]
```

**Why this works**:
- `/src/*` requests now return proper 404 errors
- Browser immediately knows the file doesn't exist
- No MIME type confusion

---

## Testing the Fix

### Before the Fix
1. Deploy app (version 1)
2. Visit site → works fine
3. Deploy app (version 2, new hash)
4. Visit site without clearing cache → **black screen**
5. Browser console shows: `Failed to load module /assets/index-XYZ789.js` (404)

### After the Fix
1. Deploy app (version 1)
2. Visit site → works fine
3. Deploy app (version 2, new hash)
4. Visit site without clearing cache → **works fine!**
5. Browser fetches fresh `index.html` with correct hash
6. New JavaScript bundle loads successfully

---

## Why This Happens with Vite

### Vite's Build Process

Vite uses **content-based hashing** for cache busting:
- `main.tsx` → `index-ABC123.js` (hash based on file content)
- Every code change generates a **new hash**
- This is **intentional** for optimal caching

### The Double-Edged Sword

**Good**: Hashed files can be cached forever (immutable)
```
/assets/index-ABC123.js → Cache-Control: public, max-age=31536000, immutable
```

**Bad**: If `index.html` is also cached, it references the **wrong hash**

### The Critical Distinction

- **Hashed assets** (`/assets/*`): Cache forever ✅
- **Entry point** (`index.html`): Never cache ❌

**The fix ensures this distinction is enforced.**

---

## Prevention

### For Future Deployments

These fixes are **permanent** and **automatic**:

1. **No-cache headers** are configured in:
   - `netlify.toml`
   - `vercel.json`

2. **Redirect exclusions** are configured in:
   - `netlify.toml`
   - `vercel.json`
   - `public/_redirects`

### For Other Vite Apps

If you encounter similar issues in other Vite projects:

1. **Always** set no-cache headers for `index.html`
2. **Always** exclude source directories (`/src/*`) from SPA fallbacks
3. **Always** cache hashed assets with `immutable`

---

## Technical Details

### HTTP Headers Explained

**Cache-Control: no-cache**
- Browser must revalidate with server before using cached copy
- Doesn't mean "don't cache", means "check first"

**Cache-Control: no-store**
- Don't cache at all, always fetch fresh
- Most aggressive anti-caching directive

**Cache-Control: must-revalidate**
- If cache is stale, must check with server
- Can't serve stale content

**Pragma: no-cache**
- HTTP/1.0 backward compatibility
- Same as `Cache-Control: no-cache`

**Expires: 0**
- HTTP/1.0 backward compatibility
- Tells browser the content is already expired

**Why use all three?**
- Different browsers and proxies respect different headers
- Using all three ensures maximum compatibility

### SPA Routing Explained

**Problem**: Client-side routing vs. server routing
- User visits `/profile/john` directly
- Server doesn't have a file at `/profile/john`
- Server returns 404 → broken app

**Solution**: Serve `index.html` for all routes
- Server returns `index.html` for `/profile/john`
- React Router takes over and renders the profile page
- This is called the "SPA fallback"

**Caveat**: Must exclude actual 404s
- `/src/main.tsx` doesn't exist in production
- If we serve `index.html`, browser gets HTML when expecting JS
- **MIME type error**: "Expected JavaScript but got HTML"

---

## Summary

### TL;DR

**Problem**: Browser caching + Vite's file hashing + SPA redirects = black screen

**Solution**:
1. Never cache `index.html` → always get fresh script references
2. Exclude `/src/*` from redirects → prevent MIME type errors

**Result**: App works reliably across all deployments ✅

---

## Related Files

- `netlify.toml` - Netlify configuration with headers and redirects
- `vercel.json` - Vercel configuration with headers and rewrites
- `public/_redirects` - Netlify redirects backup file
- `vite.config.ts` - Vite build configuration
- `index.html` - Entry point with script reference

---

## Further Reading

- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
- [Vercel Rewrites](https://vercel.com/docs/project-configuration#rewrites)

---

**Fixed**: December 1, 2025

**Status**: ✅ Resolved permanently

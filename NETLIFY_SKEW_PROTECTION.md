# Netlify Skew Protection

## What is Skew Protection?

Netlify Skew Protection prevents "chunk-load errors" during deploys when users have old HTML cached but new assets are deployed (or vice versa). It works behind the scenes by pinning each user session to a specific deploy.

## Automatic Availability

**Skew Protection is automatically available** for supported frameworks:
- ✅ Astro 5.15+
- ✅ Next.js
- ⚠️ Vite apps: Check Netlify's latest documentation for Vite support

**No manual configuration needed** - it works automatically when available for your framework.

## Alternative Solutions (if Skew Protection not available)

### Option 1: Disable File Hashing (Simplest)
In `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].js',
      chunkFileNames: 'assets/[name].js',
      assetFileNames: 'assets/[name].[ext]'
    }
  }
}
```
**Trade-off:** Loses cache-busting benefits, but eliminates hash mismatch issues

### Option 2: Use Deploy Permalinks (Advanced)
Configure Vite to use Netlify's deploy permalinks as the base URL. This requires Netlify Functions or Edge Functions.

### Option 3: Service Worker Strategy
Implement a service worker that handles asset versioning and fallbacks. More complex but gives full control.

## Current Status

✅ **Standard SPA rewrite configured** (`/*` → `/index.html` 200)
✅ **Asset caching configured** (hashed assets cached for 1 year)
⏳ **Skew Protection:** Enable in Netlify Dashboard (recommended)

## References

- [Netlify: Code-splitting guide](https://docs.netlify.com/integrations/frameworks/vite/)
- [Netlify: JS SPAs](https://docs.netlify.com/routing/redirects/rewrites-proxies/#spa-fallback)
- [Netlify: Caching overview](https://docs.netlify.com/edge/cache-overview/)


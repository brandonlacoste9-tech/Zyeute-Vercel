# Root Cause Analysis: Black Screen / MIME Type Error

## The Problem Chain

### 1. **Source File** (`index.html` line 43)
```html
<script type="module" src="/src/main.tsx"></script>
```
This is **correct** for development. Vite transforms it during build.

### 2. **Build Process** (Vite)
✅ **Works correctly**: Vite replaces `/src/main.tsx` with hashed bundle:
```html
<script type="module" crossorigin src="/assets/index-DRxv8xfJ.js"></script>
```

### 3. **The Root Cause: Hash Mismatch During Deploys**
❌ **Problem**: "Chunk-load errors" during deploy transitions
- User has old `index.html` cached (references `index-XYZ789.js`)
- New deploy happens → New assets deployed (`index-ABC123.js`)
- Old HTML tries to load old assets → 404 → Black screen
- OR: New HTML loads but user's browser cache has old assets → Mismatch

### 4. **Why This Happens**
- Vite uses content hashing for cache-busting (good for performance)
- During deploys, there's a window where HTML and assets can be mismatched
- Browser caching can exacerbate this during the transition period

## The Solution (Following Netlify Best Practices)

### ✅ Standard SPA Rewrite
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
**Result**: Proper SPA routing for React Router

### ✅ Long-term Caching for Hashed Assets
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```
**Result**: Hashed assets cached safely (hashes change on content updates)

### ✅ Enable Skew Protection (Recommended)
**Action**: Enable in Netlify Dashboard
- Site settings → Build & deploy → Deploy settings → Skew Protection
- **Result**: Netlify automatically handles HTML/asset mismatches during deploys

## Why Netlify's Approach is Better

1. **Atomic Deploys**: Netlify's CDN automatically invalidates cache per deploy
2. **Skew Protection**: Handles edge cases during deploy transitions
3. **No Manual Cache-Busting**: Netlify handles it automatically
4. **Performance**: Proper caching without breaking functionality

## Prevention

✅ **Current Configuration**:
- Standard SPA rewrite (Netlify recommended pattern)
- Long-term caching for hashed assets
- ⏳ **Next Step**: Enable Skew Protection in Netlify Dashboard

## Summary

**Root cause**: Hash mismatches during deploy transitions (old HTML + new assets or vice versa)
**Netlify Solution**: Skew Protection + proper SPA rewrite + automatic cache invalidation
**Status**: Configuration aligned with Netlify best practices. Enable Skew Protection for complete protection.


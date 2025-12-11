# 🔐 VERCEL ENVIRONMENT VARIABLES SETUP

## ⚠️ CRITICAL: Use `VITE_` prefix (NOT `NEXT_PUBLIC_`)

Zyeuté uses **Vite**, not Next.js. Environment variables MUST use the `VITE_` prefix!

---

## 📋 REQUIRED ENVIRONMENT VARIABLES

### 1. Supabase (Required)

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2. AI Services (Optional but recommended)

```bash
VITE_GEMINI_API_KEY=AIzaSy...
VITE_OPENAI_API_KEY=sk-proj-...
```

**Gemini (for Ti-Guy AI):**
- Get from: https://makersuite.google.com/app/apikey

**OpenAI (for DALL-E image generation):**
- Get from: https://platform.openai.com/api-keys

### 3. Stripe (Optional, for payments)

```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**Where to find:**
- Go to: https://dashboard.stripe.com/test/apikeys
- Copy your **Publishable key**

---

## 🚀 VERCEL SETUP STEPS

### Step 1: Add Variables to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. For EACH variable:
   - Click **Add New**
   - Enter **Name** (e.g., `VITE_SUPABASE_URL`)
   - Enter **Value** (your actual key)
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

### Step 2: Verify Variables Are Set

In Vercel Settings → Environment Variables, you should see:

```
✅ VITE_SUPABASE_URL          (Production, Preview, Development)
✅ VITE_SUPABASE_ANON_KEY     (Production, Preview, Development)
✅ VITE_GEMINI_API_KEY        (Production, Preview, Development) - Optional
✅ VITE_OPENAI_API_KEY        (Production, Preview, Development) - Optional
✅ VITE_STRIPE_PUBLIC_KEY     (Production, Preview, Development) - Optional
```

### Step 3: Redeploy

**CRITICAL:** Environment variables are only applied during build time!

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for build to complete

---

## 🧪 TEST YOUR SETUP

### Option 1: Check Browser Console

After deployment, open your app and check the browser console:

```javascript
// Should NOT see this warning if keys are set:
// "⚠️ Missing Supabase credentials! Using demo mode."
```

### Option 2: Test Supabase Connection

Open DevTools Console on your deployed site and run:

```javascript
// Replace with your actual values
const url = 'https://your-project-ref.supabase.co/rest/v1/';
const anon = 'your_anon_key';

fetch(url + 'rpc/pg_version', {
  headers: { 
    apikey: anon, 
    Authorization: `Bearer ${anon}` 
  }
})
.then(r => console.log('Status:', r.status))
.catch(console.error);

// Expected: Status: 200 or 404
// If you get 401/403, your keys are wrong
```

### Option 3: Check Runtime Environment

Add this temporarily to your app to verify:

```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "Missing Supabase credentials" warning

**Cause:** Environment variables not set or using wrong prefix

**Fix:**
1. Verify you're using `VITE_` prefix (NOT `NEXT_PUBLIC_`)
2. Check variables are set in Vercel for all environments
3. Redeploy after adding variables

### Issue 2: 401 Unauthorized from Supabase

**Cause:** Wrong anon key or URL

**Fix:**
1. Double-check keys in Supabase Dashboard → Settings → API
2. Copy-paste carefully (no extra spaces)
3. Make sure you're using the **anon public** key, NOT the service role key

### Issue 3: Variables work locally but not on Vercel

**Cause:** Local `.env.local` file vs Vercel environment variables

**Fix:**
1. Verify variables are set in Vercel (not just locally)
2. Redeploy after adding Vercel variables
3. Check you're testing the correct deployment (Production vs Preview)

### Issue 4: Changes not taking effect

**Cause:** Environment variables are baked into the build

**Fix:**
1. **Always redeploy** after changing environment variables
2. Clear browser cache
3. Use incognito/private window to test

---

## 🔒 SECURITY BEST PRACTICES

### ✅ DO:
- Use `VITE_` prefix for client-side variables
- Use **anon public** key (safe to expose)
- Store sensitive keys in Vercel environment variables
- Keep `.env.local` in `.gitignore`

### ❌ DON'T:
- Never commit `.env.local` to git
- Never use `SUPABASE_SERVICE_ROLE_KEY` in client code
- Never hardcode keys in source code
- Never share your service role key publicly

---

## 📚 ADDITIONAL RESOURCES

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase Client Setup](https://supabase.com/docs/reference/javascript/initializing)

---

## ✅ CHECKLIST

Before deploying:

- [ ] Supabase project created
- [ ] `VITE_SUPABASE_URL` added to Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` added to Vercel
- [ ] Variables set for Production, Preview, and Development
- [ ] Redeployed after adding variables
- [ ] Tested on deployed site (not just local)
- [ ] No console warnings about missing credentials
- [ ] Authentication working
- [ ] Database queries working

---

**Need help?** Check the browser console for error messages and verify your Supabase keys are correct!

🔥 **Bonne chance!** ⚜️


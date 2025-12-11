# 🚀 FRESH SUPABASE SETUP FOR ZYEUTÉ

Complete guide to set up a brand new Supabase project for your Zyeuté app.

---

## 📋 STEP 1: GET YOUR SUPABASE CREDENTIALS

### 1.1 Get Project URL and Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your new project
3. Go to **Settings** (gear icon) → **API**
4. Copy these values:

```bash
Project URL: https://YOUR-PROJECT-REF.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)
```

### 1.2 Add to Vercel Environment Variables

Go to Vercel → Your Project → **Settings** → **Environment Variables**

Add these **EXACTLY** (use `VITE_` prefix!):

```bash
Name: VITE_SUPABASE_URL
Value: https://YOUR-PROJECT-REF.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)
Environments: ✅ Production ✅ Preview ✅ Development

Name: SUPABASE_SERVICE_ROLE_KEY (optional, for server-side operations)
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service role key)
Environments: ✅ Production ✅ Preview ✅ Development
```

**⚠️ CRITICAL:** 
- Use `VITE_` prefix (NOT `NEXT_PUBLIC_`)
- No quotes around values
- No extra spaces
- Select all 3 environments

---

## 📊 STEP 2: CREATE DATABASE TABLES

### 2.1 Go to SQL Editor

In Supabase Dashboard:
1. Click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy and paste the SQL below
4. Click **Run** (or press Ctrl+Enter)

### 2.2 Core Tables SQL

```sql
-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  website TEXT,
  location TEXT,
  quebec_region TEXT,
  verified BOOLEAN DEFAULT FALSE,
  is_creator BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== POSTS TABLE ====================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  hashtags TEXT[],
  region TEXT,
  city TEXT,
  fire_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== COMMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  fire_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== FIRES (LIKES) TABLE ====================
CREATE TABLE IF NOT EXISTS public.fires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- ==================== FOLLOWS TABLE ====================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ==================== STORIES TABLE ====================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_fires_user_id ON public.fires(user_id);
CREATE INDEX IF NOT EXISTS idx_fires_post_id ON public.fires(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
```

### 2.3 Run the SQL

Click **Run** or press `Ctrl+Enter`. You should see:
```
Success. No rows returned
```

---

## 🔒 STEP 3: SET UP ROW LEVEL SECURITY (RLS)

### 3.1 Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
```

### 3.2 Create RLS Policies

```sql
-- ==================== USERS POLICIES ====================
-- Anyone can view users
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ==================== POSTS POLICIES ====================
-- Anyone can view posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== COMMENTS POLICIES ====================
-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== FIRES POLICIES ====================
-- Anyone can view fires
CREATE POLICY "Fires are viewable by everyone"
  ON public.fires FOR SELECT
  USING (true);

-- Authenticated users can create fires
CREATE POLICY "Authenticated users can create fires"
  ON public.fires FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own fires
CREATE POLICY "Users can delete own fires"
  ON public.fires FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== FOLLOWS POLICIES ====================
-- Anyone can view follows
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

-- Authenticated users can follow others
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ==================== STORIES POLICIES ====================
-- Anyone can view non-expired stories
CREATE POLICY "Stories are viewable by everyone"
  ON public.stories FOR SELECT
  USING (expires_at > NOW());

-- Authenticated users can create stories
CREATE POLICY "Authenticated users can create stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own stories
CREATE POLICY "Users can delete own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== NOTIFICATIONS POLICIES ====================
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 🎯 STEP 4: CONFIGURE AUTHENTICATION

### 4.1 Email Settings

In Supabase Dashboard:
1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Configure:

```
✅ Enable Email provider
✅ Enable Email confirmations: OFF (for testing) or ON (for production)
✅ Secure email change: ON
✅ Double confirm email change: ON
```

### 4.2 Site URL

Set your site URL:
```
Site URL: https://your-vercel-app.vercel.app
```

### 4.3 Redirect URLs

Add these redirect URLs:
```
https://your-vercel-app.vercel.app/**
http://localhost:5173/**
```

---

## 📦 STEP 5: SET UP STORAGE

### 5.1 Create Storage Buckets

In Supabase Dashboard:
1. Go to **Storage**
2. Click **New bucket**
3. Create these buckets:

```
Bucket name: posts
Public: ✅ Yes
File size limit: 50 MB
Allowed MIME types: image/*, video/*

Bucket name: avatars
Public: ✅ Yes
File size limit: 5 MB
Allowed MIME types: image/*

Bucket name: stories
Public: ✅ Yes
File size limit: 50 MB
Allowed MIME types: image/*, video/*
```

### 5.2 Storage Policies

For each bucket, add these policies:

```sql
-- Anyone can view files
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Repeat for `avatars` and `stories` buckets (change `bucket_id` accordingly).

---

## 🧪 STEP 6: TEST YOUR SETUP

### 6.1 Create a Test User

In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter:
   ```
   Email: test@example.com
   Password: test123456
   Auto Confirm User: ✅ Yes
   ```
4. Click **Create user**

### 6.2 Create Test User Profile

Go to **SQL Editor** and run:

```sql
INSERT INTO public.users (id, username, display_name)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'testuser',
  'Test User'
);
```

---

## ✅ STEP 7: REDEPLOY YOUR APP

After setting up everything:

1. **Verify Vercel Environment Variables** are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Trigger a new deployment:**
   - Go to Vercel → Deployments
   - Click **Redeploy** on latest deployment
   - OR push a commit to GitHub

3. **Test your app:**
   - Visit your deployed app
   - Try logging in with `test@example.com` / `test123456`
   - Should work! ✅

---

## 🎊 YOU'RE DONE!

Your fresh Supabase project is now fully configured for Zyeuté!

### ✅ What You Have:
- Database tables with proper structure
- Row Level Security policies
- Authentication configured
- Storage buckets ready
- Test user created
- Environment variables set

### 🚀 Next Steps:
1. Test login on your deployed app
2. Try creating a post
3. Upload an image
4. Test all features!

---

## 🆘 TROUBLESHOOTING

### Issue: "Invalid API key"
**Fix:** Double-check `VITE_SUPABASE_ANON_KEY` in Vercel

### Issue: "Failed to fetch"
**Fix:** Check `VITE_SUPABASE_URL` is correct

### Issue: "Row Level Security policy violation"
**Fix:** Make sure you ran all the RLS policy SQL

### Issue: "Storage bucket not found"
**Fix:** Create the storage buckets (Step 5)

---

**Need help?** Check the browser console for specific error messages!

🔥 **Bonne chance!** ⚜️


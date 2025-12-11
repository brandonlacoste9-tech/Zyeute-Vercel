# 🗄️ Database Setup Guide

## Issue Found

Your code queries:
- `posts` table → But Supabase has `publications` table
- `stories` table → May not exist
- `notifications` table → Exists but may need fixes

## Solution

I've created a migration file that:
1. ✅ Creates `posts` VIEW pointing to `publications` table
2. ✅ Creates `stories` table with proper schema
3. ✅ Fixes `notifications` table (adds `post_id` if missing)
4. ✅ Adds indexes for performance
5. ✅ Sets up RLS policies

## How to Apply

### Option 1: Via Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/vuanulvyqkfefmjcikfk/sql
2. Click "New query"
3. Copy the contents of `supabase/migrations/20250102000000_fix_table_names.sql`
4. Paste into the SQL editor
5. Click "Run"
6. Wait for completion

### Option 2: Via Supabase CLI

```bash
cd C:\Users\north\brandonlacoste9-tech-ZYEUTE\brandonlacoste9-tech-ZYEUTE
supabase db push
```

### Option 3: Ask Supabase AI

Copy this prompt to Supabase AI:

```
I need to fix table name mismatches in my database. My code queries 'posts' and 'stories' tables, but:
- Supabase has 'publications' table (not 'posts')
- 'stories' table may not exist

Please run this SQL migration to fix it:

[Paste the contents of supabase/migrations/20250102000000_fix_table_names.sql]

This will:
1. Create a 'posts' view pointing to 'publications'
2. Create 'stories' table if missing
3. Fix 'notifications' table
4. Add indexes and RLS policies
```

## After Migration

Test your app:
1. Visit: `https://zyeute.netlify.app`
2. Check console - 404 errors should be gone
3. Try creating a post/story
4. Check notifications work

## Verification

Run this SQL to verify:

```sql
-- Check posts view exists
SELECT COUNT(*) FROM posts;

-- Check stories table exists
SELECT COUNT(*) FROM stories;

-- Check notifications has post_id
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'post_id';
```

All should return successfully!


-- Fix table name mismatches: Create views/aliases for posts and stories
-- The code expects 'posts' but Supabase has 'publications'
-- The code expects 'stories' but it may not exist

-- 1. Create 'posts' view pointing to 'publications' table
CREATE OR REPLACE VIEW posts AS
SELECT 
  id,
  user_id,
  content,
  visibilite as visibility,
  est_masque as is_hidden,
  supprime_a as scheduled_delete_at,
  created_at,
  deleted_at,
  comments_count,
  reactions_count,
  media_url
FROM publications
WHERE deleted_at IS NULL;

-- Grant permissions on the view
GRANT SELECT, INSERT, UPDATE, DELETE ON posts TO authenticated;
GRANT SELECT ON posts TO anon;

-- 2. Create 'stories' table if it doesn't exist
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for stories queries
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Enable RLS on stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Users can view active stories"
  ON stories FOR SELECT
  USING (expires_at > now() AND deleted_at IS NULL);

CREATE POLICY "Users can create their own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Fix notifications table query issue
-- The notifications table exists but may need the post reference fixed
-- Check if notifications has proper foreign key to publications
DO $$
BEGIN
  -- Add post_id column if it doesn't exist (for referencing publications)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'post_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN post_id UUID REFERENCES publications(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for notifications queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu) WHERE lu = false;
CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON notifications(post_id) WHERE post_id IS NOT NULL;

-- 4. Create a function to help with posts insert (maps to publications)
CREATE OR REPLACE FUNCTION insert_post(
  p_user_id UUID,
  p_content TEXT,
  p_media_url TEXT DEFAULT NULL,
  p_visibility TEXT DEFAULT 'public'
)
RETURNS UUID AS $$
DECLARE
  new_post_id UUID;
BEGIN
  INSERT INTO publications (
    user_id,
    content,
    media_url,
    visibilite
  ) VALUES (
    p_user_id,
    p_content,
    p_media_url,
    p_visibility
  )
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_post TO authenticated;

COMMENT ON VIEW posts IS 'View mapping posts to publications table for backward compatibility';
COMMENT ON TABLE stories IS 'Stories table for temporary content (24h expiry)';
COMMENT ON FUNCTION insert_post IS 'Helper function to insert posts into publications table';


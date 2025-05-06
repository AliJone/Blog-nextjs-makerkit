/*
 * -------------------------------------------------------
 * Blog Schema
 * This migration adds the necessary tables and functions
 * for the blog functionality
 * -------------------------------------------------------
 */

-- Create the 'posts' table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false NOT NULL
);

-- Add comments to posts table
COMMENT ON TABLE public.posts IS 'Blog posts created by users';
COMMENT ON COLUMN public.posts.id IS 'The unique identifier for the post';
COMMENT ON COLUMN public.posts.title IS 'The title of the post';
COMMENT ON COLUMN public.posts.body IS 'The content of the post';
COMMENT ON COLUMN public.posts.user_id IS 'The user who created the post';
COMMENT ON COLUMN public.posts.published IS 'Whether the post is published or in draft mode';

-- Set up RLS (Row Level Security) for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for accessing posts
-- Anyone can read published posts
CREATE POLICY "Allow public read access for published posts" 
  ON public.posts 
  FOR SELECT 
  USING (published = true);

-- Users can CRUD their own posts
CREATE POLICY "Allow full access to own posts" 
  ON public.posts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at timestamp on posts
CREATE TRIGGER update_posts_timestamp
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Storage for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog_images', 'blog_images', true);

-- RLS policies for storage bucket blog_images
CREATE POLICY blog_images_select ON storage.objects FOR SELECT
USING (bucket_id = 'blog_images');

CREATE POLICY blog_images_insert ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog_images' AND
  auth.role() = 'authenticated'
);

-- Function to get user's posts with pagination
CREATE OR REPLACE FUNCTION public.get_user_posts(
  user_uuid UUID,
  posts_limit INTEGER DEFAULT 10,
  posts_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.posts
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT *
  FROM public.posts
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT posts_limit
  OFFSET posts_offset;
$$;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION public.get_user_posts TO authenticated, service_role;
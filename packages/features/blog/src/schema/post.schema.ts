import { z } from 'zod';

// Define the validation schema with Zod
export const PostSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  body: z.string()
    .min(10, 'Content must be at least 10 characters long')
    .max(50000, 'Content is too long'),
  published: z.boolean().optional().default(true),
});

export type PostFormValues = z.infer<typeof PostSchema>;

export const PostResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  published: z.boolean(),
  user_id: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string().nullable(),
    display_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
  }).nullable().optional(),
});

export type Post = z.infer<typeof PostResponseSchema>;
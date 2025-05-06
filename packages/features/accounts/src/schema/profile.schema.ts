import { z } from 'zod';

export const ProfileSchema = z.object({
  bio: z.string().max(250, 'Bio must be less than 250 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  job_title: z.string().max(100, 'Job title must be less than 100 characters').optional(),
  social_links: z.object({
    twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    github: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  }).optional(),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;

export const ProfileResponseSchema = ProfileSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

export type ProfileData = z.infer<typeof ProfileResponseSchema>;
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Button } from '@kit/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@kit/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';

import type { User } from '../graphql/types';
import type { ProfileFormData } from '../hooks/use-profile';

// Profile validation schema
const ProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters').optional().nullable(),
  display_name: z.string().max(100, 'Display name must be less than 100 characters').optional().nullable(),
  bio: z.string().max(250, 'Bio must be less than 250 characters').optional().nullable(),
  website: z.string().url('Please enter a valid URL').optional().nullable().or(z.literal('')),
  avatar_url: z.string().url('Please enter a valid URL').optional().nullable().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;

interface ProfileFormProps {
  profile: User | null;
  onSubmit: (values: ProfileFormData) => Promise<unknown>;
  isSubmitting?: boolean;
}

export default function ProfileForm({
  profile,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // Default values from existing profile or empty values
  const defaultValues: ProfileFormValues = {
    username: profile?.username || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    avatar_url: profile?.avatar_url || '',
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues,
  });

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      setFormError(null);
      setFormSuccess(false);
      
      await onSubmit({
        ...values,
        // Convert empty strings to null for optional fields
        bio: values.bio || null,
        website: values.website || null,
        avatar_url: values.avatar_url || null,
      });
      
      setFormSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  };

  return (
    <div className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      {formSuccess && (
        <Alert variant="default" className="border-green-500 bg-green-50 text-green-700">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your profile has been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div className="relative group">
              <Avatar className="h-24 w-24 rounded-full border-2 border-primary/10 overflow-hidden shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:border-primary/30">
                <AvatarImage src={form.watch('avatar_url') || undefined} alt="Profile" />
                <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary/10 to-primary/5">
                  {profile?.display_name?.substring(0, 2) || profile?.username?.substring(0, 2) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium">
                Update Avatar
              </div>
            </div>
            
            {/* Avatar URL */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="johndoe"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display Name */}
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="h-32"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
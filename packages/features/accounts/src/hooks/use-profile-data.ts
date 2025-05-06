import { useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import type { ProfileFormValues } from '../schema/profile.schema';

export function useProfileData(userId: string) {
  const client = useSupabase();
  const queryKey = ['profile:data', userId];

  const queryFn = async () => {
    if (!userId) {
      return null;
    }

    // Using 'as any' to bypass TypeScript validation since profiles table isn't in the types yet
    const response = await (client as any)
      .from('profiles')
      .select(`
        id,
        user_id,
        bio,
        website,
        location,
        job_title,
        social_links,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .single();

    if (response.error) {
      // If profile doesn't exist, return null instead of throwing
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw response.error;
    }

    return response.data;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateProfile(userId: string) {
  const client = useSupabase();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await (client as any)
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error } = await (client as any)
          .from('profiles')
          .update({
            bio: data.bio,
            website: data.website,
            location: data.location,
            job_title: data.job_title,
            social_links: data.social_links,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();
          
        if (error) throw error;
        return updatedProfile;
      } else {
        // Create new profile
        const { data: newProfile, error } = await (client as any)
          .from('profiles')
          .insert([{
            user_id: userId,
            bio: data.bio,
            website: data.website,
            location: data.location,
            job_title: data.job_title,
            social_links: data.social_links,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (error) throw error;
        return newProfile;
      }
    },
    onSuccess: () => {
      // Invalidate profile data query to refetch
      queryClient.invalidateQueries({ queryKey: ['profile:data', userId] });
    },
  });
}

export function useRevalidateProfileDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['profile:data', userId],
      }),
    [queryClient],
  );
}
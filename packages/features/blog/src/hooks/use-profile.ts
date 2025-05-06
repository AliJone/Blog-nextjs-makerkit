'use client';

import { useState } from 'react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { GET_PROFILE } from '../graphql/operations/profile-queries';
import { UPDATE_PROFILE } from '../graphql/operations/profile-mutations';
import type { ProfileResponse, UpdateProfileResponse, User } from '../graphql/types';

/**
 * Hook to fetch a user's profile by ID
 */
export function useProfile(id: string) {
  const { data, loading, error, refetch } = useQuery<ProfileResponse>(GET_PROFILE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  // Extract profile from the response
  let profile = null;
  if (data?.profilesCollection?.edges?.[0]?.node) {
    profile = data.profilesCollection.edges[0].node;
  }
  
  return {
    profile,
    isLoading: loading,
    error,
    refetch,
  };
}

/**
 * Hook for updating a user's profile
 */
export function useUpdateProfile() {
  const [updateProfileMutation, { loading }] = useMutation<UpdateProfileResponse>(UPDATE_PROFILE);
  const [error, setError] = useState<ApolloError | null>(null);
  
  const update = async ({ 
    id, 
    username, 
    display_name, 
    bio, 
    website, 
    avatar_url 
  }: {
    id: string;
    username?: string;
    display_name?: string;
    bio?: string;
    website?: string;
    avatar_url?: string;
  }) => {
    try {
      const { data } = await updateProfileMutation({
        variables: { 
          id, 
          username, 
          display_name, 
          bio, 
          website, 
          avatar_url 
        },
        // Add optimistic response for immediate UI
        optimisticResponse: {
          updateprofilesCollection: {
            __typename: 'profilesUpdateResponse',
            records: [
              {
                __typename: 'profiles',
                id,
                username: username || null,
                display_name: display_name || null,
                bio: bio || null,
                website: website || null,
                avatar_url: avatar_url || null,
                created_at: new Date().toISOString(),
              }
            ]
          }
        } as any
      });
      
      // Return the updated profile
      if (data?.updateprofilesCollection?.records?.[0]) {
        return data.updateprofilesCollection.records[0];
      }
      return null;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as ApolloError);
      throw err;
    }
  };
  
  return { 
    update, 
    isLoading: loading, 
    error 
  };
}

// For backward compatibility with the previous API
export const useFetchProfile = useProfile;

// Interface for profile form data
export interface ProfileFormData {
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  website?: string | null;
  avatar_url?: string | null;
}
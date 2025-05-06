'use client';

import { useProfileData, useUpdateProfile } from '../../hooks/use-profile-data';
import { ProfileForm } from './profile-form';
import type { ProfileFormValues } from '../../schema/profile.schema';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

interface ProfileFormContainerProps {
  userId: string;
}

export function ProfileFormContainer({ userId }: ProfileFormContainerProps) {
  // Fetch existing profile data
  const { data: profile, isLoading: isLoadingProfile } = useProfileData(userId);
  
  // Mutation hook for updating profile
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile(userId);

  // Handle form submission
  const handleSubmit = async (values: ProfileFormValues) => {
    await updateProfile(values);
  };

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return <LoadingOverlay />;
  }

  // Transform profile data to form values
  const defaultValues: Partial<ProfileFormValues> = {
    bio: profile?.bio || '',
    website: profile?.website || '',
    location: profile?.location || '',
    job_title: profile?.job_title || '',
    social_links: {
      twitter: profile?.social_links?.twitter || '',
      github: profile?.social_links?.github || '',
      linkedin: profile?.social_links?.linkedin || '',
    },
  };

  return (
    <ProfileForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isUpdating}
    />
  );
}
'use client';

import { useUser } from '@kit/supabase/hooks/use-user';
import { PageBody } from '@kit/ui/page';
import { BlogApolloProvider, ProfileForm } from '@kit/blog';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { useProfile, useUpdateProfile } from '@kit/blog';
import { useEffect, useState } from 'react';

function ProfileSettingsContent() {
  const { data: user, isLoading: userLoading } = useUser();
  const userId = user?.id;
  
  // Client-side state to prevent hydration issues
  const [mounted, setMounted] = useState(false);
  
  // Get the user's profile using the useProfile hook
  const { profile, isLoading: profileLoading } = useProfile(userId || '');
  const { update, isLoading: updateLoading } = useUpdateProfile();
  
  // Set mounted state after component mounts to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading indicator while fetching user or profile data
  if (!mounted || userLoading || profileLoading) {
    return (
      <div className="flex w-full justify-center py-8">
        <LoadingOverlay>Loading your profile information...</LoadingOverlay>
      </div>
    );
  }

  // Handle form submission
  const handleUpdateProfile = async (formData: any) => {
    if (!userId) throw new Error('User ID is required');
    return await update({
      id: userId,
      ...formData
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col space-y-6 lg:max-w-3xl">
      <div>
        <h1 className="mb-1 text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your public profile information
        </p>
      </div>

      <ProfileForm
        profile={profile as any}  // Type cast to resolve type mismatch
        onSubmit={handleUpdateProfile}
        isSubmitting={updateLoading}
      />
    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <PageBody>
      <BlogApolloProvider>
        <ProfileSettingsContent />
      </BlogApolloProvider>
    </PageBody>
  );
}
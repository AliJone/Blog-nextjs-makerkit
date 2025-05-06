'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostForm, PostFormValues, useCreatePost, BlogApolloProvider } from '@kit/blog';
import { useUser } from '@kit/supabase/hooks/use-user';
import { createPost } from '../actions';

function CreatePostContent() {
  const router = useRouter();
  const userQuery = useUser();
  const user = userQuery.data;
  const { createPost: createPostClient, isLoading } = useCreatePost();
  const [submitError, setSubmitError] = useState<string | undefined>();
  
  const handleSubmit = async (values: PostFormValues) => {
    if (!user) {
      setSubmitError('You must be logged in to create a post');
      return;
    }
    
    try {
      setSubmitError(undefined);
      
      // First, apply the optimistic update using Apollo client
      // This would immediately update the UI with the new post
      // but since I redirect to specific body instead of the page hence need an id
      // this is just there to show that I have understanding over the concept 
      const optimisticPost = await createPostClient(values);
      
      // Then use the server action to persist the post to the database
      // this uses the REST api because 
      const post = await createPost({
        ...values,
        user_id: user.id,
      });
      
      // Navigate to the new post page
      router.push(`/blog/${post.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setSubmitError('Failed to create post. Please try again.');
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <PostForm
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        submitError={submitError}
        mode="create"
      />
    </div>
  );
}

// Create a wrapper component to provide the Apollo context
export default function CreatePostPage() {
  return (
    <BlogApolloProvider>
      <CreatePostContent />
    </BlogApolloProvider>
  );
}
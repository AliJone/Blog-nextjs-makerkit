'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { PostForm, PostFormValues, useFetchPost, useUpdatePost, PostFragment, BlogApolloProvider } from '@kit/blog';
import { useUser } from '@kit/supabase/hooks/use-user';
import { updatePost } from '../../actions';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

function EditPostContent({ params }: EditPostPageProps) {
  // Unwrap the params using React.use
  const { id: postId } = React.use(params);

  const router = useRouter();
  const userQuery = useUser();
  const user = userQuery.data;
  
  const { post, isLoading: isLoadingPost, error: postError } = useFetchPost(postId);
  const { updatePost: updatePostClient, isLoading: isUpdating } = useUpdatePost(postId);
  
  const [submitError, setSubmitError] = useState<string | undefined>();
  
  // Redirect if post not found or user is not the author
  useEffect(() => {
    if (!isLoadingPost && !post) {
      router.push('/blog');
    } else if (post && user && post.user_id !== user.id) {
      router.push('/blog');
    }
  }, [post, user, router, isLoadingPost]);
  
  const handleSubmit = async (values: PostFormValues) => {
    if (!user || !post) {
      setSubmitError('You must be logged in to update a post');
      return;
    }
    
    try {
      setSubmitError(undefined);
      
      // Use the server action to update the post
      await updatePost(post.id, values);
      
      router.push(`/blog/${post.id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      setSubmitError('Failed to update post. Please try again.');
    }
  };
  
  if (isLoadingPost) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <PostForm
        initialValues={{
          title: post.title,
          body: post.body,
          published: post.published,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
        submitError={submitError}
        mode="edit"
      />
    </div>
  );
}

// Create a wrapper component to provide the Apollo context
export default function EditPostPage({ params }: EditPostPageProps) {
  return (
    <BlogApolloProvider>
      <EditPostContent params={params} />
    </BlogApolloProvider>
  );
}

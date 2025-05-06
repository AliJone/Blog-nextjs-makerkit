'use client';

import { useQuery, useMutation, FetchPolicy } from '@apollo/client';
import { GET_POST_BY_ID, POST_FRAGMENT } from '../graphql/operations/queries';
import { UPDATE_POST } from '../graphql/operations/mutations';
import type { PostResponse, Post } from '../graphql/types';
import type { PostFormValues } from '../schema/post.schema';
import { getUserData } from '../graphql/types';

interface FetchPostOptions {
  fetchPolicy?: FetchPolicy;
}

export function useFetchPost(postId: string | undefined, options: FetchPostOptions = {}) {
  const { fetchPolicy = 'cache-and-network' } = options;
  
  // Use the actual GraphQL query
  const { data, loading, error } = useQuery<PostResponse>(GET_POST_BY_ID, {
    variables: { id: postId },
    skip: !postId,
    fetchPolicy,
  });

  // Extract the post from the edges/nodes structure
  const post = data?.postsCollection?.edges?.[0]?.node;

  return {
    post,
    isLoading: loading,
    error,
  };
}

export function useUpdatePost(postId: string | undefined) {
  // Use the actual GraphQL mutation with optimistic UI
  const [updatePostMutation, { loading }] = useMutation<any>(UPDATE_POST, {
    // Add optimistic response for immediate UI feedback with type assertion to avoid TS errors
    optimisticResponse: (vars: any) => {
      return {
        updatepostsCollection: {
          __typename: "postsUpdateResponse",
          records: [{
            __typename: "posts",
            id: postId,
            title: vars.title,
            body: vars.body,
            published: vars.published,
            updated_at: new Date().toISOString(),
            // We don't change other fields in updates
            // These will be preserved from the current cache
          }]
        }
      } as any;
    }
  });

  const updatePost = async (values: PostFormValues) => {
    if (!postId) throw new Error('Post ID is required');

    const { data } = await updatePostMutation({
      variables: {
        id: postId,
        title: values.title,
        body: values.body,
        published: values.published,
      },
      update(cache, { data }) {
        if (!data) return;
        
        // Clear the cache for posts collection to force a refresh
        cache.modify({
          fields: {
            postsCollection() {
              return undefined; // This will force a refetch when the posts page is visited
            }
          }
        });
        
        // Update the post in cache
        const updatedPost = data.updatepostsCollection.records[0];
        
        // Write the updated post to the cache
        cache.writeFragment({
          id: `Post:${postId}`,
          fragment: POST_FRAGMENT,
          data: updatedPost,
        });
      }
    });

    return data?.updatepostsCollection?.records?.[0];
  };

  return {
    updatePost,
    isLoading: loading,
  };
}
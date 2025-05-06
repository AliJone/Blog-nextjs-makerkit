'use client';

import { useQuery, useMutation, FetchPolicy } from '@apollo/client';
import { GET_POSTS } from '../graphql/operations/queries';
import { CREATE_POST, DELETE_POST } from '../graphql/operations/mutations';
import { useUser } from '@kit/supabase/hooks/use-user';
import type { PostsResponse, Post, CreatePostResponse, DeletePostResponse } from '../graphql/types';
import type { PostFormValues } from '../schema/post.schema';
import { getUserData } from '../graphql/types';

interface FetchPostsOptions {
  limit?: number;
  after?: string;
  fetchPolicy?: FetchPolicy;
}

export function useFetchPosts(options: FetchPostsOptions = {}) {
  const { limit = 5, after, fetchPolicy = 'cache-and-network' } = options;

  // Use the actual GraphQL query
  const { data, loading, error, fetchMore } = useQuery<PostsResponse>(GET_POSTS, {
    variables: {
      first: limit,
      after,
    },
    fetchPolicy,
  });

  // Extract posts from the edges/nodes structure
  const posts = data?.postsCollection?.edges?.map(edge => edge.node) || [];
  
  // Handle pagination
  const pageInfo = data?.postsCollection?.pageInfo || { hasNextPage: false, endCursor: null };
  
  const loadMore = () => {
    if (pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          return {
            postsCollection: {
              ...fetchMoreResult.postsCollection,
              edges: [
                ...prev.postsCollection.edges,
                ...fetchMoreResult.postsCollection.edges,
              ],
            },
          };
        },
      });
    }
  };

  return {
    posts,
    isLoading: loading,
    error,
    hasNextPage: pageInfo?.hasNextPage || false,
    loadMore,
  };
}

export function useCreatePost() {
  const { data: user } = useUser();
  
  // Use actual GraphQL mutation with optimistic UI
  const [createPostMutation, { loading }] = useMutation<CreatePostResponse>(CREATE_POST, {
    // Simple optimistic UI handling to avoid TypeScript errors
    optimisticResponse: (vars: any) => {
      if (!user) throw new Error('User must be logged in to create a post');
      
      // Create a simplified optimistic response
      const response = {
        insertIntopostsCollection: {
          __typename: 'postsInsertResponse',
          records: [
            {
              __typename: 'posts',
              id: `temp-${Date.now()}`,
              title: vars.title,
              body: vars.body,
              published: vars.published || true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: user.id,
              profile_id: user.id,
              user: {
                __typename: 'profiles',
                id: user.id,
                username: user?.user_metadata?.username || null,
                display_name: user?.user_metadata?.name || null,
                avatar_url: user?.user_metadata?.avatar_url || null,
              }
            }
          ]
        }
      };
      
      // Use type assertion to avoid TypeScript errors
      return response as any;
    }
  });

  const createPost = async (values: PostFormValues) => {
    if (!user) throw new Error('User must be logged in to create a post');

    const { data } = await createPostMutation({
      variables: {
        title: values.title,
        body: values.body,
        published: values.published,
        user_id: user.id,
      },
      update(cache, { data }) {
        if (!data) return;
        
        // Get the newly created post
        const newPost = data.insertIntopostsCollection.records[0];
        
        // Update the cache to include this new post
        cache.modify({
          fields: {
            postsCollection(existingCollection = { edges: [] }) {
              // Create a new edge for the new post
              const newEdge = {
                __typename: 'postsEdge',
                node: newPost,
              };
              
              // Add the new edge to the existing edges
              return {
                ...existingCollection,
                edges: [newEdge, ...existingCollection.edges],
              };
            }
          }
        });
      }
    });

    return data?.insertIntopostsCollection.records[0];
  };

  return {
    createPost,
    isLoading: loading,
  };
}

export function useDeletePost() {
  // Use actual GraphQL mutation with optimistic UI
  const [deletePostMutation, { loading }] = useMutation<DeletePostResponse>(DELETE_POST, {
    // Add optimistic response for immediate UI update
    optimisticResponse: {
      deleteFrompostsCollection: {
        __typename: "postsDeleteResponse",
        affectedCount: 1,
        records: [{ id: "optimistic-deleted" }] as any
      }
    } as any
  });

  const deletePost = async (postId: string) => {
    const { data } = await deletePostMutation({
      variables: { id: postId },
      update(cache) {
        // Remove deleted post from cache
        cache.modify({
          fields: {
            postsCollection(existingCollection = { edges: [] }, { readField }) {
              // Filter out the deleted post
              const newEdges = existingCollection.edges.filter(
                (edge: any) => {
                  const nodeId = readField('id', edge.node);
                  return nodeId !== postId;
                }
              );
              
              return {
                ...existingCollection,
                edges: newEdges,
              };
            },
          },
        });
      },
    });

    return { id: postId };
  };

  return {
    deletePost,
    isLoading: loading,
  };
}
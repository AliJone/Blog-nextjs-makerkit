'use client';

import { useQuery, FetchPolicy } from '@apollo/client';
import { GET_USER_POSTS } from '../graphql/operations/queries';
import type { PostsResponse } from '../graphql/types';

interface FetchUserPostsOptions {
  limit?: number;
  after?: string;
  fetchPolicy?: FetchPolicy;
}

export function useUserPosts(userId: string | undefined, options: FetchUserPostsOptions = {}) {
  const { limit = 5, after, fetchPolicy = 'cache-and-network' } = options;

  // Use the actual GraphQL query
  const { data, loading, error, fetchMore } = useQuery<PostsResponse>(GET_USER_POSTS, {
    variables: {
      userId,
      first: limit,
      after,
    },
    skip: !userId,
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
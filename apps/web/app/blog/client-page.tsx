'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PostCard, useFetchPosts, BlogApolloProvider, PostFragment } from '@kit/blog';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';

interface PostsListProps {
  initialPosts: PostFragment[];
}

function PostsList({ initialPosts }: PostsListProps) {
  // Start with the initial statically generated posts
  const [posts, setPosts] = useState<PostFragment[]>(initialPosts);
  const [useClientData, setUseClientData] = useState(false);
  
  // Fetch fresh data with Apollo Client
  const { 
    posts: freshPosts, 
    isLoading, 
    error, 
    hasNextPage, 
    loadMore 
  } = useFetchPosts({
    fetchPolicy: 'network-only'
  });
  
  // Track whether we've switched from static to client data
  const initialDataReplacedRef = useRef(false);
  
  // Use ref to store previous post IDs to prevent infinite updates
  const prevPostIdsRef = useRef<string[]>([]);
  
  useEffect(() => {
    // Skip if loading or no posts
    if (isLoading || !freshPosts || freshPosts.length === 0) return;
    
    // Get current post IDs
    const currentPostIds = freshPosts.map(post => post.id);
    
    // Check if post IDs have changed
    const hasNewPosts =
      // Different length
      currentPostIds.length !== prevPostIdsRef.current.length ||
      // Or any new post IDs
      currentPostIds.some(id => !prevPostIdsRef.current.includes(id));
    
    // Only update when we have new posts
    if (hasNewPosts) {
      // Save current IDs for next comparison
      prevPostIdsRef.current = currentPostIds;
      
      if (!initialDataReplacedRef.current) {
        // First time switching from static to client data
        initialDataReplacedRef.current = true;
        setUseClientData(true);
      }
      
      // Update posts state with fresh data
      setPosts(freshPosts);
    }
  }, [freshPosts, isLoading]);
  
  // Only show loading when we're actually loading more data after initial render
  // Initial data comes from SSR, so we don't need to show loading for it
  if (isLoading && useClientData) {
    return (
      <div className="my-4 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error && useClientData) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <p>Error loading posts: {String(error)}</p>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="rounded-md bg-muted p-6 text-center">
        <p className="text-muted-foreground">No posts found. Be the first to create one!</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: PostFragment) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></span>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export function BlogClientPage({ initialPosts }: { initialPosts: PostFragment[] }) {
  return (
    <BlogApolloProvider>
      <div className="mb-8 flex items-center justify-between">
        <Heading level={1}>Blog</Heading>
        <Button asChild>
          <Link href="/blog/create">Create New Post</Link>
        </Button>
      </div>
      
      <PostsList initialPosts={initialPosts} />
    </BlogApolloProvider>
  );
}
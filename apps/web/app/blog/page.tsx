import { Suspense } from 'react';
import { BlogClientPage } from './client-page';
import { getApolloClientInstance } from '@kit/blog';
import { GET_POSTS } from '@kit/blog';
import type { PostFragment } from '@kit/blog';

// Server component to fetch initial data for static generation
async function fetchInitialPosts() {
  // Use the fetch API for proper ISR
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  try {
    // This fetch will use ISR with a 60-second revalidation period
    const response = await fetch(`${supabaseUrl}/graphql/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey as string,
      },
      body: JSON.stringify({
        query: `
          query GetPosts {
            postsCollection(
              filter: { published: { eq: true } }
              orderBy: [{ created_at: DescNullsLast }]
              first: 5
            ) {
              edges {
                node {
                  id
                  title
                  body
                  created_at
                  published
                  user_id
                  profile_id
                  user: profiles {
                    id
                    username
                    display_name
                    avatar_url
                  }
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 60 }, // This is the key for ISR
    });
    
    const data = await response.json();
    
    // Transform the data to match the expected structure
    return data?.data?.postsCollection?.edges.map((edge: any) => edge.node) || [];
  } catch (error) {
    console.error('Error fetching initial posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  // This data is statically generated and revalidated every 60 seconds
  const initialPosts = await fetchInitialPosts();
  
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <BlogClientPage initialPosts={initialPosts} />
    </Suspense>
  );
}
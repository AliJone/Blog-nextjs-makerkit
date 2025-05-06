import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PostDetailClient } from './client-page';
import { getApolloClientInstance } from '@kit/blog';
import { GET_POSTS } from '@kit/blog';

// Generate static paths for first 10 posts at build time
export async function generateStaticParams() {
  const apolloClient = getApolloClientInstance();
  
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS,
      variables: { first: 10 },
    });
    
    return (data?.postsCollection?.edges || []).map((edge: any) => ({
      id: edge.node.id,
    }));
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

// Enable on-demand ISR for paths not generated at build time
export const dynamicParams = true;

// Fetch post data for static generation with proper ISR
// I could use the same function I use to fetch posts in PostDetailClient with an additional parameter 
// but keeping exposed here just so  we can really drive in the ISR portion that removes the need for loading
async function fetchPost(id: string) {
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
          query GetPostById($id: UUID!) {
            postsCollection(filter: { id: { eq: $id } }) {
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
        variables: { id },
      }),
      // This is the key for ISR, I realize that this is too early to refresh but is seems fine for my usecase
      // This is fine until I figure out how to clear the cashe for posts that I am mutilating my self then I could
      // probably keep this a bit longer and reap the benefits of both ISR and CSR at once
      next: { revalidate: 60 }, 
    });
    
    const data = await response.json();
    
    return data?.data?.postsCollection?.edges?.[0]?.node;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  
  // without this await for the params we get an error
  const { id } = await params;
  
  // This data is statically generated and revalidated every 60 seconds
  const initialPost = await fetchPost(id);
  
  if (!initialPost) {
    notFound();
  }
  
  return (
    <Suspense fallback={<div>Loading post...</div>}>
      <PostDetailClient initialPost={initialPost} postId={id} />
    </Suspense>
  );
}
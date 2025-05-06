// Remove 'use client' directive to allow using in both server and client components
// We'll handle client-side or server-side usage in the code

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Function to get GraphQL client
export const getApolloClient = () => {
  // Create HTTP link to Supabase GraphQL endpoint
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'}/graphql/v1`,
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    },
    credentials: 'same-origin'
  });

  // Simple auth link - will be populated with session token later
  const authLink = setContext(async (_, { headers }) => {
    try {
      // We'll use the Authorization header from the server action later
      return {
        headers: {
          ...headers,
        }
      };
    } catch (e) {
      console.error('Error setting auth context:', e);
      return { headers };
    }
  });

  // Return configured Apollo Client
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({}),
    ...(typeof window === 'undefined' ? { ssrMode: true } : {}), // Enable SSR mode on server
  });
};

// Create a singleton instance for the browser and separate instance for server
let clientInstance: ApolloClient<any> | null = null;
let serverInstance: ApolloClient<any> | null = null;

export const getApolloClientInstance = () => {
  // For server-side rendering/ISR, use a new or reuse server instance
  if (typeof window === 'undefined') {
    if (!serverInstance) serverInstance = getApolloClient();
    return serverInstance;
  }
  
  // For client-side, use singleton pattern
  if (!clientInstance) clientInstance = getApolloClient();
  return clientInstance;
};
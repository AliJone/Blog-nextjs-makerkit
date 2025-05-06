# Next.js Blog with Supabase and Apollo Client

This project is a fully-featured blog application built with Next.js, Supabase, and Apollo Client. It leverages the power of a modern monorepo structure, Incremental Static Regeneration (ISR), and GraphQL to create a performant and maintainable blog platform.

## Table of Contents

- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Running Locally](#running-locally)
- [Supabase Integration](#supabase-integration)
  - [Linking to a Supabase Project](#linking-to-a-supabase-project)
  - [Database Migrations](#database-migrations)
- [Authentication](#authentication)
  - [Supabase + Apollo Client Integration](#supabase--apollo-client-integration)
  - [Email OTP Login](#email-otp-login)
- [Technical Implementations](#technical-implementations)
  - [ISR Implementation with getStaticProps](#isr-implementation-with-getstaticprops)
  - [Form Validation with Zod and React Hook Form](#form-validation-with-zod-and-react-hook-form)
  - [Optimistic UI Updates](#optimistic-ui-updates)
  - [Profile Page Implementation](#profile-page-implementation)

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- pnpm (v8 or later)
- Git
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nextjs-blog-makerkit
```

2. Install dependencies:

```bash
pnpm install
```

### Environment Configuration

1. Copy the environment example files:

```bash
cp apps/web/.env.example apps/web/.env.local
```

2. Update the environment variables in `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

## Running Locally

1. Start the Supabase local development environment:

```bash
cd apps/web
pnpm supabase:start
```

2. Run the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Supabase Integration

### Linking to a Supabase Project

To link your local development environment to a Supabase project:

1. Create a new project in the [Supabase Dashboard](https://app.supabase.io/)
2. Retrieve your project credentials from the project settings
3. Set the `SUPABASE_PROJECT_REF` environment variable
4. Run the following command:

```bash
pnpm supabase:deploy
```

### Database Migrations

The project includes migrations for setting up the necessary database tables:

```bash
# Run migrations on the local database
pnpm supabase:reset

# Apply migrations to your remote Supabase project
pnpm supabase:deploy
```

Key migrations include:
- `20250506000001_add_profiles_table.sql` - Creates the profiles table for user information

## Authentication

### Supabase + Apollo Client Integration

The blog uses Supabase for authentication and Apollo Client for data fetching. This integration ensures authenticated GraphQL requests to your Supabase database.

```typescript
// packages/features/blog/src/graphql/provider.tsx
'use client';

import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';
import { getApolloClientInstance } from './client';

export function BlogApolloProvider({ children }: { children: ReactNode }) {
  const client = getApolloClientInstance();
  
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
```

The Apollo Client is configured to include the Supabase auth token in each request:

```typescript
// Configuration in the Apollo Client setup
const authMiddleware = new ApolloLink((operation, forward) => {
  // Get the auth token from Supabase
  const token = supabaseClient.auth.getSession().then(({ data }) => data?.session?.access_token);
  
  // Add the auth token to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }));

  return forward(operation);
});
```

### Email OTP Login

The application implements passwordless authentication using Supabase's email OTP feature:

```typescript
// packages/supabase/src/hooks/use-sign-in-with-otp.ts
import type { SignInWithPasswordlessCredentials } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { useSupabase } from './use-supabase';

/**
 * @name useSignInWithOtp
 * @description Use Supabase to sign in a user with an OTP in a React component
 */
export function useSignInWithOtp() {
  const client = useSupabase();
  const mutationKey = ['auth', 'sign-in-with-otp'];

  const mutationFn = async (credentials: SignInWithPasswordlessCredentials) => {
    const result = await client.auth.signInWithOtp(credentials);

    if (result.error) {
      if (shouldIgnoreError(result.error.message)) {
        console.warn(
          `Ignoring error during development: ${result.error.message}`,
        );

        return {} as never;
      }

      throw result.error.message;
    }

    return result.data;
  };

  return useMutation({
    mutationFn,
    mutationKey,
  });
}
```

To use this hook in a component:

```typescript
function SignInForm() {
  const { mutateAsync, isPending } = useSignInWithOtp();
  
  const handleSubmit = async (email: string) => {
    try {
      await mutateAsync({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      // Show success message
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    // Form implementation
  );
}
```

## Technical Implementations

### ISR Implementation with getStaticProps

The blog uses Incremental Static Regeneration (ISR) to pre-render pages at build time and update them in the background after deployment. This is implemented through a dual rendering approach:

1. **Server Components** fetch initial data for static generation
2. **Client Components** display the static data initially and then update with fresh data

#### Home Page Implementation

```typescript
// apps/web/app/blog/page.tsx - Server Component
import { Suspense } from 'react';
import { BlogClientPage } from './client-page';
import { getApolloClientInstance } from '@kit/blog/graphql/client';
import { GET_POSTS } from '@kit/blog/graphql/operations/queries';

// Set ISR revalidation time
export const revalidate = 60;

// Server component to fetch initial data
async function fetchInitialPosts() {
  const apolloClient = getApolloClientInstance();
  
  try {
    const { data } = await apolloClient.query({
      query: GET_POSTS,
      variables: { first: 5 },
    });
    
    // Transform the data to match the expected structure
    return data?.postsCollection?.edges.map(edge => edge.node) || [];
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
```

The client component uses the initial data and then fetches fresh data with Apollo Client:

```typescript
// apps/web/app/blog/client-page.tsx - Client Component
'use client';

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
  
  // Replace initial static data with fresh data when ready
  useEffect(() => {
    if (freshPosts && freshPosts.length > 0 && !isLoading) {
      setPosts(freshPosts);
      setUseClientData(true);
    }
  }, [freshPosts, isLoading]);
  
  // Rendering logic...
}
```

#### Blog Detail Page with Static Paths

The blog detail page uses `generateStaticParams` to pre-render the first 10 posts:

```typescript
// apps/web/app/blog/[id]/page.tsx - Server Component
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PostDetailClient } from './client-page';
import { getApolloClientInstance } from '@kit/blog/graphql/client';
import { GET_POSTS, GET_POST_BY_ID } from '@kit/blog/graphql/operations/queries';

// Set ISR revalidation time
export const revalidate = 60;

// Generate static paths for first 10 posts
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

// Fetch post data for static generation
async function fetchPost(id: string) {
  const apolloClient = getApolloClientInstance();
  
  try {
    const { data } = await apolloClient.query({
      query: GET_POST_BY_ID,
      variables: { id },
    });
    
    return data?.postsCollection?.edges?.[0]?.node;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  // This data is statically generated and revalidated every 60 seconds
  const initialPost = await fetchPost(params.id);
  
  if (!initialPost) {
    notFound();
  }
  
  return (
    <Suspense fallback={<div>Loading post...</div>}>
      <PostDetailClient initialPost={initialPost} postId={params.id} />
    </Suspense>
  );
}
```

### Form Validation with Zod and React Hook Form

The blog uses Zod for schema validation combined with React Hook Form for handling form state and submissions:

#### Schema Definition with Zod

```typescript
// packages/features/blog/src/schema/post.schema.ts
import { z } from 'zod';

// Define the validation schema with Zod
export const PostSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  body: z.string()
    .min(10, 'Content must be at least 10 characters long')
    .max(50000, 'Content is too long'),
  published: z.boolean().optional().default(true),
});

export type PostFormValues = z.infer<typeof PostSchema>;
```

#### Form Implementation with React Hook Form

```typescript
// packages/features/blog/src/components/post-form.tsx
export function PostForm({
  initialValues = { title: '', body: '', published: true },
  onSubmit,
  isSubmitting,
  submitError,
  mode,
}: PostFormProps) {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostSchema),
    defaultValues: initialValues,
  });

  // Form submission handling
  const handleFormSubmit = async (values: PostFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Your post title" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={15}
                  placeholder="Write your post content here..." 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="mb-6 flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Publish post immediately</FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        {/* Form buttons */}
      </form>
    </Form>
  );
}
```

### Optimistic UI Updates

The blog implements optimistic UI updates when creating or editing posts, providing immediate feedback to users while the server operation completes in the background:

```typescript
// packages/features/blog/src/hooks/use-post.ts
export function useUpdatePost(postId: string | undefined) {
  // Use the actual GraphQL mutation with optimistic UI
  const [updatePostMutation, { loading }] = useMutation<any>(UPDATE_POST, {
    // Add optimistic response for immediate UI feedback
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
```

### Profile Page Implementation

The blog includes a profile page that showcases user information and their posts:

```typescript
// GraphQL query for fetching profile data
export const GET_PROFILE = gql`
  query GetProfile($id: UUID!) {
    profilesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...ProfileFields
        }
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

// Profile mutation for updating user data
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $id: UUID!,
    $display_name: String,
    $username: String,
    $bio: String,
    $website: String,
    $avatar_url: String
  ) {
    updateprofilesCollection(
      set: {
        display_name: $display_name,
        username: $username,
        bio: $bio,
        website: $website,
        avatar_url: $avatar_url
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        ...ProfileFields
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;
```

The profile page uses these queries and mutations to display and update user information, combined with authentication to ensure only the authorized user can edit their profile.

```typescript
// Example usage in a profile page component
function ProfilePage() {
  const { user } = useUser();
  const userId = user?.id;
  
  const { profile, isLoading } = useProfile(userId);
  const { updateProfile, isLoading: isUpdating } = useUpdateProfile();
  
  // Profile form and display logic
  
  return (
    <div>
      <h1>Profile</h1>
      {/* Profile information and form */}
    </div>
  );
}
```

---

This README provides a comprehensive overview of the Next.js blog project with Supabase and Apollo Client integration. The implementation showcases modern web development practices like Incremental Static Regeneration, form validation with Zod, optimistic UI updates, and integration with authentication services.

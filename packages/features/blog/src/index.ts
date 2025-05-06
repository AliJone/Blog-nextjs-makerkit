// Export components
export { default as PostCard } from './components/post-card';
export { default as PostForm } from './components/post-form';
export { default as ProfileForm } from './components/profile-form';

// Export hooks
export { useFetchPost, useUpdatePost } from './hooks/use-post';
export { useFetchPosts, useCreatePost, useDeletePost } from './hooks/use-posts';
export { useUserPosts } from './hooks/use-user-posts';
export { useProfile, useUpdateProfile } from './hooks/use-profile';

// Export types
export type { PostFragment, UserFragment } from './graphql/types';
export type { PostFormValues } from './schema/post.schema';
export { getUserData } from './graphql/types';
export type { Post } from './graphql/types';
export type { PostsResponse, PostResponse } from './graphql/types';

// Export GraphQL operations
export * from './graphql/operations/queries';
export * from './graphql/operations/mutations';

// Export GraphQL client - now works for both client and server components
export { getApolloClient, getApolloClientInstance } from './graphql/client';
export { BlogApolloProvider } from './graphql/provider';

// Export schema
export { PostSchema } from './schema/post.schema';
export type { Post as PostSchemaType } from './schema/post.schema';
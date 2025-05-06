export interface User {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string | null;
  published: boolean;
  user_id: string;
  profile_id: string | null;
  user: User | null;
}

// For backward compatibility
export type PostFragment = Post;
export type UserFragment = User;

export interface Profile {
  id: string;
  profile_id: string;
  bio: string | null;
  website: string | null;
  location: string | null;
  job_title: string | null;
  social_links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  } | null;
  created_at: string;
  updated_at: string | null;
  user?: User | null;
}

// Interface for posts response
export interface PostsResponse {
  postsCollection: {
    edges: {
      node: Post;
    }[];
    pageInfo?: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

// Interface for single post response
export interface PostResponse {
  postsCollection: {
    edges: {
      node: Post;
    }[];
  };
}

// Interface for profile response
export interface ProfileResponse {
  profilesCollection: {
    edges: {
      node: Profile;
    }[];
  };
}

// Interface for create post response
export interface CreatePostResponse {
  insertIntopostsCollection: {
    records: Post[];
  };
}

// Interface for update post response
export interface UpdatePostResponse {
  updatepostsCollection: {
    records: Post[];
  };
}

// Interface for delete post response
export interface DeletePostResponse {
  deleteFrompostsCollection: {
    affectedCount: number;
    records: { id: string }[];
  };
}

// Interface for create profile response
export interface CreateProfileResponse {
  insertIntoprofilesCollection: {
    records: Profile[];
  };
}

// Interface for update profile response
export interface UpdateProfileResponse {
  updateprofilesCollection: {
    records: Profile[];
  };
}

// Interface for delete profile response
export interface DeleteProfileResponse {
  deleteFromprofilesCollection: {
    affectedCount: number;
    records: { id: string }[];
  };
}

// Helper function to extract user data from a post or user object
export function getUserData(input: Post | User | null): User | null {
  if (!input) {
    return null;
  }

  // If it's a Post with a user property
  if ('user' in input && input.user) {
    return {
      id: input.user.id,
      username: input.user.username,
      display_name: input.user.display_name,
      avatar_url: input.user.avatar_url,
    };
  }
  
  // If it's a User object directly (needs to have id and not have other Post-specific properties)
  if ('id' in input && !('title' in input) && !('body' in input)) {
    const user = input as User;
    return {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
    };
  }

  return null;
}
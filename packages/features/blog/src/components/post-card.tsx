'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDate } from '@kit/shared/utils';
import { useUser } from '@kit/supabase/hooks/use-user';
import { useDeletePost } from '../hooks/use-posts';
import type { PostFragment } from '../graphql/types';
import { getUserData } from '../graphql/types';
import { Button } from '@kit/ui/button';

// For backward compatibility
type Post = PostFragment;

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const userQuery = useUser();
  const user = userQuery.data;

  // truncating to 200 charectors 
  const excerpt = post.body.length > 200 
    ? `${post.body.substring(0, 200)}...` 
    : post.body;

  
  const formattedDate = formatDate(post.created_at, { timeStyle: 'short', dateStyle: 'medium' });

  // Get author information with proper handling of GraphQL structure
  const userData = getUserData(post.user);
  const authorName = userData?.display_name || userData?.username || 'Anonymous';
  const authorAvatar = userData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;
  
  // Check if the current user is the author
  const isAuthor = user?.id === post.user_id;
  
  // Handle edit navigation
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/blog/edit/${post.id}`);
  };

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        <Link href={`/blog/${post.id}`} className="block">
          <h2 className="mb-2 text-xl font-bold text-card-foreground">{post.title}</h2>
          
          <div className="mb-4 flex items-center text-muted-foreground">
            <div className="mr-2 h-6 w-6 overflow-hidden rounded-full">
              <Image 
                src={authorAvatar} 
                alt={authorName}
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="mr-2 text-sm">{authorName}</span>
            <span className="text-sm">{formattedDate}</span>
          </div>
          
          <div className="mb-4 text-card-foreground">
            <p>{excerpt}</p>
          </div>
        </Link>
        
        <div className="flex items-center justify-between">
          {isAuthor && (
            <div className="flex space-x-2">
              <Button
                onClick={handleEditClick}
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
            </div>
          )}
          
          <Link 
            href={`/blog/${post.id}`} 
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
          >
            Read more
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
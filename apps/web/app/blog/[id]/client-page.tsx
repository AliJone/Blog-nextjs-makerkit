'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Separator } from '@kit/ui/separator';
import { Heading } from '@kit/ui/heading';
import { Button } from '@kit/ui/button';
import { useFetchPost, useDeletePost, BlogApolloProvider, PostFragment, getUserData } from '@kit/blog';
import { useUser } from '@kit/supabase/hooks/use-user';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';

function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function PostContent({ initialPost, postId }: { initialPost: PostFragment, postId: string }) {

  // the static posts will be rendered when there is nothing 
  const [post, setPost] = useState<PostFragment>(initialPost);
  const [useClientData, setUseClientData] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  const userQuery = useUser();
  const user = userQuery.data;
  
  const { post: freshPost, isLoading, error } = useFetchPost(postId);
  
  const { deletePost } = useDeletePost();
  
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      await deletePost(postId);
      // Redirect to blog list page after successful deletion
      router.push('/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
      setIsDeleting(false);
    }
  };
  
  // I don't like this way of doing it but I tried to do it on initial render but it didn't seem to work so ended up using useRef
  // Replace initial static data with fresh data when ready - using a ref to avoid infinite updates
  const updatedRef = useRef(false);
  
  useEffect(() => {
    // Only update when:
    // 1. We have a post and it's loaded
    // 2. We haven't updated from initial data yet
    if (freshPost && !isLoading && !updatedRef.current) {
      updatedRef.current = true; // Mark as updated
      setPost(freshPost);
      setUseClientData(true);
    }
  }, [freshPost, isLoading]);
  
  
  if (error && useClientData) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <p>Error loading post: {String(error)}</p>
      </div>
    );
  }
  
  const isAuthor = user?.id === post.user_id;
  const userData = getUserData(post.user);
  const authorName = userData?.display_name || userData?.username || 'Anonymous';
  const authorAvatar = userData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;
  const formattedDate = formatDate(post.created_at, { timeStyle: 'short', dateStyle: 'long' });
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/blog"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to all posts
        </Link>
        
        {isAuthor && (
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/blog/edit/${post.id}`}>Edit Post</Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post
                    and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <article className="mx-auto max-w-3xl">
        <Heading level={1} className="mb-4 text-4xl">{post.title}</Heading>
        
        <div className="mb-8 flex items-center text-muted-foreground">
          <div className="mr-2 h-8 w-8 overflow-hidden rounded-full">
            <Image 
              src={authorAvatar} 
              alt={authorName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="mr-2">{authorName}</span>
          <span>·</span>
          <span className="ml-2">{formattedDate}</span>
        </div>
        
        <Separator className="mb-8" />
        
        <div className="prose prose-stone max-w-none dark:prose-invert">
          {post.body.split('\n').map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}

export function PostDetailClient({ initialPost, postId }: { initialPost: PostFragment, postId: string }) {
  return (
    <BlogApolloProvider>
      <PostContent initialPost={initialPost} postId={postId} />
    </BlogApolloProvider>
  );
}
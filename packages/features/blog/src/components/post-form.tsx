'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Checkbox } from '@kit/ui/checkbox';
import { Textarea } from '@kit/ui/textarea';
import { PostSchema, PostFormValues } from '../schema/post.schema';

interface PostFormProps {
  initialValues?: {
    title: string;
    body: string;
    published: boolean;
  };
  onSubmit: (values: PostFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string;
  mode: 'create' | 'edit';
}

export function PostForm({
  initialValues = { title: '', body: '', published: true },
  onSubmit,
  isSubmitting,
  submitError,
  mode,
}: PostFormProps) {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostSchema),
    defaultValues: initialValues,
  });

  // Get the current values for preview
  const currentValues = form.watch();

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.back();
    }
  };

  const handleFormSubmit = async (values: PostFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-card p-6 shadow-md">
      <div className="mb-6 flex justify-between border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-card-foreground">
          {mode === 'create' ? 'Create New Post' : 'Edit Post'}
        </h1>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            onClick={() => setPreviewMode(false)}
            variant={!previewMode ? "secondary" : "ghost"}
            size="sm"
          >
            Edit
          </Button>
          <Button
            type="button"
            onClick={() => setPreviewMode(true)}
            variant={previewMode ? "secondary" : "ghost"}
            size="sm"
            disabled={!currentValues.title || !currentValues.body}
          >
            Preview
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="preview-mode">
          <div className="mb-6">
            <h2 className="mb-4 text-3xl font-bold text-card-foreground">{currentValues.title}</h2>
          </div>
          <div className="prose max-w-none whitespace-pre-wrap">
            {currentValues.body}
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => setPreviewMode(false)}
              variant="outline"
            >
              Back to Editing
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(handleFormSubmit)}
              disabled={isSubmitting}
              variant="default"
            >
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create Post'
                : 'Update Post'}
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            {submitError && (
              <div className="mb-4 rounded-md bg-destructive/10 p-4 text-destructive">
                <p>{submitError}</p>
              </div>
            )}

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

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
              >
                {isSubmitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                  ? 'Create Post'
                  : 'Update Post'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

export default PostForm;
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from 'react-i18next';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@kit/ui/alert';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

import { ProfileSchema, type ProfileFormValues } from '../../schema/profile.schema';

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => Promise<unknown>;
  isSubmitting?: boolean;
  submitError?: string;
}

export function ProfileForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
}: ProfileFormProps) {
  const [formError, setFormError] = useState<string | null>(submitError || null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      bio: '',
      website: '',
      location: '',
      job_title: '',
      social_links: {
        twitter: '',
        github: '',
        linkedin: '',
      },
      ...defaultValues,
    },
  });

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      setFormError(null);
      setFormSuccess(false);
      
      await onSubmit(values);
      
      setFormSuccess(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  };

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      {formSuccess && (
        <Alert variant="default" className="border-green-500 bg-green-50 text-green-700">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            <Trans i18nKey="account:profileUpdatedSuccessfully" />
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="account:profileBio" />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="h-32"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Job Title */}
          <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="account:profileJobTitle" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Software Engineer"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="account:profileLocation" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="San Francisco, CA"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="account:profileWebsite" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 font-medium">
                <Trans i18nKey="account:profileSocialLinks" />
              </h3>
              
              {/* Twitter */}
              <FormField
                control={form.control}
                name="social_links.twitter"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://twitter.com/username"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GitHub */}
              <FormField
                control={form.control}
                name="social_links.github"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/username"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LinkedIn */}
              <FormField
                control={form.control}
                name="social_links.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting}>
            <Trans i18nKey="account:saveChanges" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
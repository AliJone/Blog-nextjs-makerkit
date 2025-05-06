'use server';

import { revalidatePath } from 'next/cache';


export async function createPost(formData: { 
  title: string; 
  body: string; 
  published: boolean;
  user_id: string;
}) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...formData,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    revalidatePath('/blog');
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updatePost(
  id: string,
  formData: { title: string; body: string; published: boolean }
) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    revalidatePath(`/blog/${id}`);
    revalidatePath('/blog');
    
    return data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

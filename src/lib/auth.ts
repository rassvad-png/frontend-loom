import { supabase } from '@/lib/supabaseClient';

export const authClient = {
  // Update user email
  async updateUserEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
  },

  // Update user password
  async updateUserPassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  // Upload avatar to storage
  async uploadAvatar(file: File | Blob, userId: string): Promise<string> {
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'webp';
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }
};

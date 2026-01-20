import { supabase } from './supabase';

/**
 * Profile service
 * Handles user profile operations
 */
export const profileService = {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    // #region agent log
    // #endregion
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // #region agent log
    // #endregion

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Update or create user profile
   */
  async updateProfile(userId, updates) {
    // Try update first
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    // If no rows found, insert instead
    if (updateError && (updateError.code === 'PGRST116' || updateError.message?.includes('No rows'))) {
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, ...updates })
        .select()
        .single();

      if (insertError) throw insertError;
      return insertData;
    }

    if (updateError) throw updateError;
    return updateData;
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    await this.updateProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  },
};

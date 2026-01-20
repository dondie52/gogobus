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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'profileService.js:12',message:'getProfile called',data:{userId:userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'profileService.js:19',message:'getProfile result',data:{userId:userId,hasData:!!data,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,role:data?.role,email:data?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
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

import { supabase } from '@/lib/supabaseClient';
import { ApiClient, App, AppTranslation, Profile, DevAccount, Category, DeveloperApp, AppStats } from './types';

export class SupabaseApiClient implements ApiClient {
  // Apps
  async getApps(limit: number = 10): Promise<App[]> {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .limit(limit);

    if (error) throw error;
    
    // Map Supabase data to App interface
    return (data || []).map((item: any) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description,
      fullDescription: item.description,
      icon: item.icon_url || '/placeholder.svg',
      category: item.categories?.[0] || 'App',
      rating: item.rating || 0,
      installs: item.installs || 0,
      screenshots: item.screenshots || [],
      installUrl: item.install_url,
      verified: item.verified || false
    }));
  }

  async getApp(slug: string): Promise<App | null> {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    // Map Supabase data to App interface
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      fullDescription: data.description,
      icon: data.icon_url || '/placeholder.svg',
      category: data.categories?.[0] || 'App',
      rating: data.rating || 0,
      installs: data.installs || 0,
      screenshots: data.screenshots || [],
      installUrl: data.install_url,
      verified: data.verified || false
    };
  }

  async getAppTranslations(appIds: string[], language: string): Promise<AppTranslation[]> {
    const { data, error } = await supabase
      .from('app_translations')
      .select('*')
      .in('app_id', appIds)
      .eq('lang', language);

    if (error) throw error;
    return data || [];
  }

  // Profile
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    return data;
  }

  async updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Dev Account
  async getDevAccount(userId: string): Promise<DevAccount | null> {
    const { data, error } = await supabase
      .from('dev_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    return data;
  }

  async createDevAccount(devAccount: Omit<DevAccount, 'id' | 'created_at' | 'updated_at'>): Promise<DevAccount> {
    const { data, error } = await supabase
      .from('dev_accounts')
      .insert(devAccount)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDevAccount(devAccount: Partial<DevAccount>): Promise<DevAccount> {
    const { data, error } = await supabase
      .from('dev_accounts')
      .update(devAccount)
      .eq('id', devAccount.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Developer Apps
  async getDeveloperApps(devAccountId: string): Promise<DeveloperApp[]> {
    const { data, error } = await supabase
      .from('apps')
      .select('id, slug, name, icon_url, rating, installs, categories, verified')
      .eq('dev_account_id', devAccountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createApp(app: Omit<App, 'id'> & { dev_account_id: string }): Promise<App> {
    const { data, error } = await supabase
      .from('apps')
      .insert({
        slug: app.slug,
        name: app.name,
        dev_account_id: app.dev_account_id,
        categories: [app.category],
        manifest_url: app.installUrl || null,
        install_url: app.installUrl || null,
        verified: false
      })
      .select()
      .single();

    if (error) throw error;

    // Map to App interface
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      fullDescription: data.description,
      icon: data.icon_url || '/placeholder.svg',
      category: data.categories?.[0] || 'App',
      rating: data.rating || 0,
      installs: data.installs || 0,
      screenshots: data.screenshots || [],
      installUrl: data.install_url,
      verified: data.verified || false
    };
  }

  async updateApp(appId: string, app: Partial<App>): Promise<App> {
    const updateData: any = {};
    
    if (app.slug) updateData.slug = app.slug;
    if (app.name) updateData.name = app.name;
    if (app.category) updateData.categories = [app.category];
    if (app.installUrl) {
      updateData.manifest_url = app.installUrl;
      updateData.install_url = app.installUrl;
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('apps')
      .update(updateData)
      .eq('id', appId)
      .select()
      .single();

    if (error) throw error;

    // Map to App interface
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      fullDescription: data.description,
      icon: data.icon_url || '/placeholder.svg',
      category: data.categories?.[0] || 'App',
      rating: data.rating || 0,
      installs: data.installs || 0,
      screenshots: data.screenshots || [],
      installUrl: data.install_url,
      verified: data.verified || false
    };
  }

  async deleteApp(appId: string): Promise<void> {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', appId);

    if (error) throw error;
  }

  async publishApp(appId: string): Promise<void> {
    const { error } = await supabase
      .from('apps')
      .update({ verified: true })
      .eq('id', appId);

    if (error) throw error;
  }

  async unpublishApp(appId: string): Promise<void> {
    const { error } = await supabase
      .from('apps')
      .update({ verified: false })
      .eq('id', appId);

    if (error) throw error;
  }

  async getAppStats(appId: string): Promise<AppStats> {
    // Load analytics
    const { data: analytics } = await supabase
      .from('analytics')
      .select('event')
      .eq('app_id', appId);

    // Load likes count
    const { count: likesCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId);

    // Load comments count
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId);

    // Load app rating
    const { data: appData } = await supabase
      .from('apps')
      .select('rating')
      .eq('id', appId)
      .single();

    const views = analytics?.filter(a => a.event === 'view').length || 0;
    const installs = analytics?.filter(a => a.event === 'install').length || 0;

    return {
      views,
      installs,
      likes: likesCount || 0,
      comments: commentsCount || 0,
      rating: appData?.rating || 0
    };
  }

  // App Translations
  async createAppTranslation(translation: Omit<AppTranslation, 'id' | 'created_at' | 'updated_at'>): Promise<AppTranslation> {
    const { data, error } = await supabase
      .from('app_translations')
      .insert(translation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAppTranslations(appId: string, language: string, translation: Partial<AppTranslation>): Promise<void> {
    const { error } = await supabase
      .from('app_translations')
      .upsert({
        app_id: appId,
        lang: language,
        ...translation,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('slug');

    if (error) throw error;
    return data || [];
  }

  // Analytics
  async incrementViews(appId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_views', { app_id: appId });
    if (error) throw error;
  }

  async incrementInstalls(appId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_installs', { app_id: appId });
    if (error) throw error;
  }

  // Auth operations
  async updateUserEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
  }

  async updateUserPassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  // Storage operations
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
}

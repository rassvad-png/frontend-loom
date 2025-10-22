// API Types
export interface App {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  icon: string;
  category: string;
  rating: number;
  installs: number;
  screenshots: string[];
  installUrl?: string;
  tagline?: string;
  whatsNew?: string;
  verified?: boolean;
}

export interface AppTranslation {
  id: string;
  app_id: string;
  lang: string;
  tagline?: string;
  description?: string;
  whats_new?: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  display_name: string | null;
  avatar: string | null;
  favorite_categories: string[];
  country: string | null;
  language: string | null;
  theme: string | null;
}

export interface DevAccount {
  id: string;
  user_id: string;
  org_name: string;
  website: string;
  contact_email: string;
  github_url: string;
  legal_address: string;
  tax_identifier: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface DeveloperApp {
  id: string;
  slug: string;
  name: string | null;
  icon_url: string | null;
  rating: number;
  installs: number;
  categories: string[];
  verified: boolean;
}

export interface AppStats {
  views: number;
  installs: number;
  likes: number;
  comments: number;
  rating: number;
}

// API Client Interface
export interface ApiClient {
  // Apps
  getApps(limit?: number): Promise<App[]>;
  getApp(slug: string): Promise<App | null>;
  getAppTranslations(appIds: string[], language: string): Promise<AppTranslation[]>;
  
  // Developer Apps
  getDeveloperApps(devAccountId: string): Promise<DeveloperApp[]>;
  createApp(app: Omit<App, 'id'> & { dev_account_id: string }): Promise<App>;
  updateApp(appId: string, app: Partial<App>): Promise<App>;
  deleteApp(appId: string): Promise<void>;
  publishApp(appId: string): Promise<void>;
  unpublishApp(appId: string): Promise<void>;
  getAppStats(appId: string): Promise<AppStats>;
  
  // App Translations
  createAppTranslation(translation: Omit<AppTranslation, 'id' | 'created_at' | 'updated_at'>): Promise<AppTranslation>;
  updateAppTranslations(appId: string, language: string, translation: Partial<AppTranslation>): Promise<void>;
  
  // Profile
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Dev Account
  getDevAccount(userId: string): Promise<DevAccount | null>;
  createDevAccount(devAccount: Omit<DevAccount, 'id' | 'created_at' | 'updated_at'>): Promise<DevAccount>;
  updateDevAccount(devAccount: Partial<DevAccount>): Promise<DevAccount>;
  
  // Analytics
  incrementViews(appId: string): Promise<void>;
  incrementInstalls(appId: string): Promise<void>;
  
  // Auth operations
  updateUserEmail(email: string): Promise<void>;
  updateUserPassword(password: string): Promise<void>;
  
  // Storage operations
  uploadAvatar(file: File | Blob, userId: string): Promise<string>;
}

// Common Types
export type TLanguage = 'ru' | 'en';

// Database Types
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
}

export interface DevAccount {
  id: string;
  user_id: string;
  org_name: string | null;
  website: string | null;
  contact_email: string | null;
  github_url: string | null;
  legal_address: string | null;
  tax_identifier: string | null;
  phone: string | null;
  status: string;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
}

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

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface DevAccountFormData {
  orgName: string;
  website: string;
  contactEmail: string;
  githubUrl: string;
  legalAddress: string;
  taxIdentifier: string;
  phone: string;
}

// Apollo Cache Types
export interface ProfileCacheData {
  profilesCollection?: {
    edges?: Array<{
      node?: Profile;
    }>;
  };
}

export interface DevAccountCacheData {
  dev_accountsCollection?: {
    edges?: Array<{
      node?: DevAccount;
    }>;
  };
}

export interface AppsCacheData {
  appsCollection?: {
    edges?: Array<{
      node?: App;
    }>;
  };
}

export interface AppTranslationsCacheData {
  app_translationsCollection?: {
    edges?: Array<{
      node?: AppTranslation;
    }>;
  };
}

export interface CategoriesCacheData {
  categoriesCollection?: {
    edges?: Array<{
      node?: Category;
    }>;
  };
}

// Types
export type TLanguage = 'ru' | 'en';

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

export interface DevAccountFormData {
  orgName: string;
  website: string;
  contactEmail: string;
  githubUrl: string;
  legalAddress: string;
  taxIdentifier: string;
  phone: string;
}

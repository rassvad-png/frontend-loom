import { useQuery } from '@apollo/client/react';
import { 
  GET_PROFILE, 
  GET_DEV_ACCOUNT, 
  GET_APPS, 
  GET_APP, 
  GET_APP_TRANSLATIONS, 
  GET_CATEGORIES, 
  GET_DEVELOPER_APPS 
} from './queries';
import { useUserLanguage } from '../hooks';

// Profile query hook
export const useProfileQuery = (userId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_PROFILE, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
  });

  return {
    profile: (data as any)?.profilesCollection?.edges?.[0]?.node || null,
    loading,
    error,
    refetch,
  };
};

// Dev Account query hook
export const useDevAccountQuery = (userId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_DEV_ACCOUNT, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
  });

  return {
    devAccount: (data as any)?.dev_accountsCollection?.edges?.[0]?.node || null,
    loading,
    error,
    refetch,
  };
};

// Apps query hook
export const useAppsQuery = (limit?: number) => {
  const { data, loading, error } = useQuery(GET_APPS, {
    variables: { limit: limit || 5 },
    errorPolicy: 'all',
  });

  return {
    apps: (data as any)?.appsCollection?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
  };
};

// Single App query hook
export const useAppQuery = (slug: string) => {
  const { data, loading, error } = useQuery(GET_APP, {
    variables: { slug },
    skip: !slug,
    errorPolicy: 'all',
  });

  return {
    app: (data as any)?.appsCollection?.edges?.[0]?.node || null,
    loading,
    error,
  };
};

// App Translations query hook
export const useAppTranslationsQuery = (appIds: string[]) => {
  const userLanguage = useUserLanguage();
  
  const { data, loading, error } = useQuery(GET_APP_TRANSLATIONS, {
    variables: { 
      appIds: appIds.length > 0 ? appIds : ['00000000-0000-0000-0000-000000000000'],
      language: userLanguage 
    },
    skip: appIds.length === 0,
    errorPolicy: 'all',
  });

  return {
    translations: (data as any)?.app_translationsCollection?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
  };
};

// Categories query hook
export const useCategoriesQuery = () => {
  const { data, loading, error } = useQuery(GET_CATEGORIES, {
    errorPolicy: 'all',
  });

  return {
    categories: (data as any)?.categoriesCollection?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
  };
};

// Developer Apps query hook
export const useDeveloperAppsQuery = (devAccountId: string) => {
  const { data, loading, error } = useQuery(GET_DEVELOPER_APPS, {
    variables: { devAccountId },
    skip: !devAccountId,
    errorPolicy: 'all',
  });

  return {
    apps: (data as any)?.appsCollection?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
  };
};

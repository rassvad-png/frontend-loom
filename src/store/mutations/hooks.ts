import { useMutation, useQuery } from '@apollo/client/react';
import { 
  UPDATE_PROFILE, 
  CREATE_DEV_ACCOUNT, 
  CREATE_APP_TRANSLATION, 
  UPDATE_APP_TRANSLATIONS, 
  INCREMENT_VIEWS, 
  INCREMENT_INSTALLS,
  CREATE_APP,
  UPDATE_APP,
  DELETE_APP,
  CHECK_APP_SLUG
} from './mutations';

// Profile mutations
export const useUpdateProfileMutation = () => {
  const [updateProfileMutation, { loading, error }] = useMutation(UPDATE_PROFILE);

  const updateProfile = async (userId: string, updates: any) => {
    const result = await updateProfileMutation({
      variables: { userId, updates },
    });
    return (result.data as any)?.updateprofilesCollection?.records?.[0];
  };

  return {
    updateProfile,
    loading,
    error,
  };
};

// Dev Account mutations
export const useCreateDevAccountMutation = () => {
  const [createDevAccountMutation, { loading, error }] = useMutation(CREATE_DEV_ACCOUNT);

  const createDevAccount = async (devAccount: any) => {
    const result = await createDevAccountMutation({
      variables: { devAccount },
    });
    return (result.data as any)?.insertIntodev_accountsCollection?.records?.[0];
  };

  return {
    createDevAccount,
    loading,
    error,
  };
};

// App Translation mutations
export const useCreateAppTranslationMutation = () => {
  const [createAppTranslationMutation, { loading, error }] = useMutation(CREATE_APP_TRANSLATION);

  const createAppTranslation = async (translation: any) => {
    const result = await createAppTranslationMutation({
      variables: { translation },
    });
    return (result.data as any)?.insertIntoapp_translationsCollection?.records?.[0];
  };

  return {
    createAppTranslation,
    loading,
    error,
  };
};

export const useUpdateAppTranslationsMutation = () => {
  const [updateAppTranslationsMutation, { loading, error }] = useMutation(UPDATE_APP_TRANSLATIONS);

  const updateAppTranslations = async (appId: string, language: string, updates: any) => {
    const result = await updateAppTranslationsMutation({
      variables: { appId, language, updates },
    });
    return (result.data as any)?.updateApp_translationsCollection?.records?.[0];
  };

  return {
    updateAppTranslations,
    loading,
    error,
  };
};

// Analytics mutations
export const useIncrementViewsMutation = () => {
  const [incrementViewsMutation, { loading, error }] = useMutation(INCREMENT_VIEWS, {
    fetchPolicy: 'no-cache',
  });

  const incrementViews = async (appId: string) => {
    const result = await incrementViewsMutation({
      variables: { appId },
    });
    return (result.data as any)?.increment_views;
  };

  return {
    incrementViews,
    loading,
    error,
  };
};

export const useIncrementInstallsMutation = () => {
  const [incrementInstallsMutation, { loading, error }] = useMutation(INCREMENT_INSTALLS, {
    fetchPolicy: 'no-cache',
  });

  const incrementInstalls = async (appId: string) => {
    const result = await incrementInstallsMutation({
      variables: { appId },
    });
    return (result.data as any)?.increment_installs;
  };

  return {
    incrementInstalls,
    loading,
    error,
  };
};

// App mutations
export const useCreateAppMutation = () => {
  const [createAppMutation, { loading, error }] = useMutation(CREATE_APP);

  const createApp = async (app: any) => {
    const result = await createAppMutation({
      variables: { app },
    });
    return (result.data as any)?.insertIntoappsCollection?.records?.[0];
  };

  return {
    createApp,
    loading,
    error,
  };
};

export const useUpdateAppMutation = () => {
  const [updateAppMutation, { loading, error }] = useMutation(UPDATE_APP);

  const updateApp = async (appId: string, updates: any) => {
    const result = await updateAppMutation({
      variables: { appId, updates },
    });
    return (result.data as any)?.updateappsCollection?.records?.[0];
  };

  return {
    updateApp,
    loading,
    error,
  };
};

export const useDeleteAppMutation = () => {
  const [deleteAppMutation, { loading, error }] = useMutation(DELETE_APP);

  const deleteApp = async (appId: string) => {
    const result = await deleteAppMutation({
      variables: { appId },
    });
    return (result.data as any)?.deleteFromappsCollection?.affectedCount;
  };

  return {
    deleteApp,
    loading,
    error,
  };
};

export const useCheckAppSlug = (slug: string) => {
  const { data, loading, error } = useQuery<any>(CHECK_APP_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const isAvailable = !(data as any)?.appsCollection?.edges?.length;

  return {
    isAvailable,
    loading,
    error,
  };
};

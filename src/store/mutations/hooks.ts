import { useMutation } from '@apollo/client/react';
import { 
  UPDATE_PROFILE, 
  CREATE_DEV_ACCOUNT, 
  CREATE_APP_TRANSLATION, 
  UPDATE_APP_TRANSLATIONS, 
  INCREMENT_VIEWS, 
  INCREMENT_INSTALLS 
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

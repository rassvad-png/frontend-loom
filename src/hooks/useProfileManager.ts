import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';
import { 
  useSetProfile, 
  useSetProfileLoading, 
  useSetUser,
  useSetLanguage 
} from '@/store/hooks';

export const useProfileManager = () => {
  const { user } = useAuth();
  const setProfile = useSetProfile();
  const setProfileLoading = useSetProfileLoading();
  const setUser = useSetUser();
  const setLanguage = useSetLanguage();

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setProfileLoading(true);
    try {
      const profile = await apiClient.getProfile(user.id);
      
      if (profile) {
        setProfile(profile);
        
        // Sync language from DB to Jotai atom
        const dbLanguage = profile.language || 'en';
        setLanguage(dbLanguage as 'ru' | 'en');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [user, setProfileLoading, setProfile, setLanguage]);

  useEffect(() => {
    if (user) {
      setUser(user);
      loadProfile();
    } else {
      setUser(null);
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user, setUser, setProfile, setProfileLoading, loadProfile]);

  return {
    loadProfile
  };
};

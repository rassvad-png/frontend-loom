import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/lib/api';
import { AppTranslation } from '@/lib/api/types';

export const useAppTranslations = (appIds: string[]) => {
  const { i18n } = useTranslation();
  const [translations, setTranslations] = useState<AppTranslation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTranslations = useCallback(async (language?: string) => {
    if (appIds.length === 0) return;
    
    setLoading(true);
    try {
      const currentLanguage = language || i18n.language;
      const translations = await apiClient.getAppTranslations(appIds, currentLanguage);
      setTranslations(translations);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  }, [appIds, i18n.language]);

  // Load translations on mount and when appIds change
  useEffect(() => {
    loadTranslations();
  }, [appIds.join(',')]); // Use join to avoid array reference issues

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      loadTranslations(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, loadTranslations]);

  return { translations, loading, reloadTranslations: loadTranslations };
};

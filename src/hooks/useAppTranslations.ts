import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppTranslationsQuery } from '@/store';
import type { AppTranslation } from '@/types';

export const useAppTranslations = (appIds: string[]) => {
  const { i18n } = useTranslation();
  const [translations, setTranslations] = useState<AppTranslation[]>([]);
  const [loading, setLoading] = useState(false);

  const { translations: data, loading: queryLoading } = useAppTranslationsQuery(appIds);

  const loadTranslations = useCallback(async (language?: string) => {
    if (appIds.length === 0) return;
    
    setLoading(true);
    try {
      // Translations are now loaded via GraphQL query
      setTranslations(data || []);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  }, [appIds, data]);

  // Update translations when GraphQL data changes
  useEffect(() => {
    if (data) {
      setTranslations(data);
    }
  }, [data]);

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

  return { 
    translations, 
    loading: loading || queryLoading, 
    reloadTranslations: loadTranslations 
  };
};

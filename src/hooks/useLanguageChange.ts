import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguageChange = (callback: () => void) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleLanguageChange = () => {
      callback();
    };

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, callback]);
};

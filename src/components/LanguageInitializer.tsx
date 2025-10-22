import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserLanguage } from '@/store/hooks';

export const LanguageInitializer = () => {
  const { i18n } = useTranslation();
  const userLanguage = useUserLanguage();

  useEffect(() => {
    // Get user language and set it in i18n
    const currentLanguage = i18n.language;
    
    if (userLanguage !== currentLanguage) {
      i18n.changeLanguage(userLanguage);
    }
  }, [i18n, userLanguage]);

  return null; // This component doesn't render anything
};

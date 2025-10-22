import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { LanguageAtom, ThemeAtom, UserLanguageAtom, UserThemeAtom } from '../atoms';

// Language hooks
export const useLanguage = () => useAtom(LanguageAtom);
export const useSetLanguage = () => useSetAtom(LanguageAtom);
export const useLanguageValue = () => useAtomValue(LanguageAtom);

// Theme hooks
export const useTheme = () => useAtom(ThemeAtom);
export const useSetTheme = () => useSetAtom(ThemeAtom);
export const useThemeValue = () => useAtomValue(ThemeAtom);

// Derived hooks
export const useUserLanguage = () => useAtomValue(UserLanguageAtom);
export const useUserTheme = () => useAtomValue(UserThemeAtom);

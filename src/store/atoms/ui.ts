import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { TLanguage } from '../types';

// Language atom with localStorage persistence
export const LanguageAtom = atomWithStorage<TLanguage>('language', 'en', undefined, {
  getOnInit: true,
});

// Theme atom with localStorage persistence
export const ThemeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light', undefined, {
  getOnInit: true,
});

// Derived atom for user language from profile
export const UserLanguageAtom = atom(
  (get) => {
    const language = get(LanguageAtom);
    return language || 'en';
  }
);

// Derived atom for user theme
export const UserThemeAtom = atom(
  (get) => {
    const theme = get(ThemeAtom);
    return theme || 'light';
  }
);

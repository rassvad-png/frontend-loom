import { atom } from 'jotai';
import { Profile } from '../types';

// Profile atom
export const ProfileAtom = atom<Profile | null, [Profile | null], void>(
  null,
  (get, set, newProfile) => {
    set(ProfileAtom, newProfile);
  }
);

// Profile loading state  
export const ProfileLoadingAtom = atom<boolean, [boolean], void>(
  true,
  (get, set, newLoading) => {
    set(ProfileLoadingAtom, newLoading);
  }
);

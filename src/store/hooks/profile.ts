import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { ProfileAtom, ProfileLoadingAtom } from '../atoms';

// Profile hooks
export const useProfile = () => useAtom(ProfileAtom);
export const useSetProfile = () => useSetAtom(ProfileAtom);
export const useProfileValue = () => useAtomValue(ProfileAtom);

// Profile loading hooks
export const useProfileLoading = () => useAtom(ProfileLoadingAtom);
export const useSetProfileLoading = () => useSetAtom(ProfileLoadingAtom);
export const useProfileLoadingValue = () => useAtomValue(ProfileLoadingAtom);

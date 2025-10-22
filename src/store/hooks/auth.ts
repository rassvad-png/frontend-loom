import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { UserAtom, IsAuthenticatedAtom } from '../atoms';

// User hooks
export const useUser = () => useAtom(UserAtom);
export const useSetUser = () => useSetAtom(UserAtom);
export const useUserValue = () => useAtomValue(UserAtom);

// Authentication hooks
export const useIsAuthenticated = () => useAtomValue(IsAuthenticatedAtom);

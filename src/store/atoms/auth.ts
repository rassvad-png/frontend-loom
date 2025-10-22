import { atom } from 'jotai';

// User atom (from auth)
export const UserAtom = atom<any, [any], void>(
  null,
  (get, set, newUser) => {
    set(UserAtom, newUser);
  }
);

// Derived atom for authentication status
export const IsAuthenticatedAtom = atom(
  (get) => {
    const user = get(UserAtom);
    return !!user;
  }
);

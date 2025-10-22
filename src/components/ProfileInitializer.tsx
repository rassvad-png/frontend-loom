import { useProfileManager } from '@/hooks/useProfileManager';

export const ProfileInitializer = () => {
  useProfileManager();
  return null; // This component doesn't render anything
};

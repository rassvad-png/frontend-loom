import { useIncrementViewsMutation, useIncrementInstallsMutation } from '@/store/mutations';

export const useAnalytics = () => {
  const { incrementViews } = useIncrementViewsMutation();
  const { incrementInstalls } = useIncrementInstallsMutation();

  const logEvent = async (
    appId: string,
    event: 'view' | 'install' | 'click',
    meta?: Record<string, any>
  ) => {
    try {
      // Update counters on apps table
      if (event === 'view') {
        await incrementViews(appId);
      } else if (event === 'install') {
        await incrementInstalls(appId);
      }

      return true;
    } catch (err) {
      console.error('[Analytics] Error:', err);
      return false;
    }
  };

  return { logEvent };
};

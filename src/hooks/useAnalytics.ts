import { apiClient } from "@/lib/api";

export const useAnalytics = () => {
  const logEvent = async (
    appId: string,
    event: 'view' | 'install' | 'click',
    meta?: Record<string, any>
  ) => {
    try {
      // Update counters on apps table
      if (event === 'view') {
        await apiClient.incrementViews(appId);
      } else if (event === 'install') {
        await apiClient.incrementInstalls(appId);
      }

      return true;
    } catch (err) {
      console.error('[Analytics] Error:', err);
      return false;
    }
  };

  return { logEvent };
};

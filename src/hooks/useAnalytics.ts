import { supabase } from "@/lib/supabaseClient";

export const useAnalytics = () => {
  const logEvent = async (
    appId: string,
    event: 'view' | 'install' | 'click',
    meta?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase
        .from('analytics')
        .insert({
          app_id: appId,
          user_id: null, // TODO: Add auth.uid() when auth is implemented
          event,
          meta: meta || {}
        });

      if (error) {
        console.error('[Analytics] Error logging event:', error);
        return false;
      }

      // Also update counters on apps table
      if (event === 'view') {
        await supabase.rpc('increment_views', { app_id: appId });
      } else if (event === 'install') {
        await supabase.rpc('increment_installs', { app_id: appId });
      }

      return true;
    } catch (err) {
      console.error('[Analytics] Error:', err);
      return false;
    }
  };

  return { logEvent };
};

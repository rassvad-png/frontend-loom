import { SupabaseApiClient } from './supabase';

// Export types
export * from './types';

// Export API client instance
export const apiClient = new SupabaseApiClient();

// Export class for testing or custom instances
export { SupabaseApiClient };

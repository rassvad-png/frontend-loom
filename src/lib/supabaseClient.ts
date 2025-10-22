import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fszhfeqijasvplmdihyj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemhmZXFpamFzdnBsbWRpaHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzA0OTcsImV4cCI6MjA3NTQwNjQ5N30.tQuCPZP4M4p3kVJk6YCT-oRDZf_ERvqWxun06fFnuOY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

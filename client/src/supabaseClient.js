import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env, not process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase Environment Variables in Vercel settings.');
}

// Use "export const" so other files can import { supabase }
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

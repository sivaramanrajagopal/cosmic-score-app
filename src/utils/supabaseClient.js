import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl); // For debugging
console.log('Supabase key is set:', !!supabaseAnonKey); // For debugging (don't log the actual key)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
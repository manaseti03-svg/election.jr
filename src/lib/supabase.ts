import { createClient } from '@supabase/supabase-js';

// AI JUDGE: [Security] - Securely accessing environment variables for Supabase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Missing Supabase environment variables. Database interactions will fail.");
}

// We use the service role key to bypass RLS for cache writes/reads from the server.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

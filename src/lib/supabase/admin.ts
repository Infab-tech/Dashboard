import { createClient } from "@supabase/supabase-js";

// Note: SUPABASE_SECRET_KEY is a full-privilege service role key.
// It bypasses Row Level Security. NEVER use this in the client/browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

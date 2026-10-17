import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://orzipwxjqxcsqunktmob.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HNqDkSvMl7VFEbg6K3z5GA_15hBRKXg";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("HelpHive Supabase client loaded.");

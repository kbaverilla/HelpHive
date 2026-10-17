import { createClient } from 
                'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://orzipwxjqxcsqunktmob.supabase.co';
const supabaseKey = 'sb_publishable_HNqDkSvMl7VFEbg6K3z5GA_15hBRKXg';

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);
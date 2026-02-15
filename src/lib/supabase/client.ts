import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("Supabase Environment Variables Missing in Client!");
        // Return a dummy object or retry to avoid crash, but this is critical.
        // For SSR safety, we might want to return null, but that requires type changes.
        // Let's pass empty strings to avoid "undefined" error, but Supabase will error on request.
        // This is better than crashing the whole process on startup.
        return createBrowserClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
    }

    return createBrowserClient(url, key)
}

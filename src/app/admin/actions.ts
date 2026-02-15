"use server";

import { createClient } from "@supabase/supabase-js";

export async function getAdminStats() {
    // Use service role ONLY on server-side
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // Parallel fetching for stats
    const [
        { count: userCount },
        { count: pageCount },
        { count: subCount },
        { count: qrScanCount }
    ] = await Promise.all([
        supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('love_pages').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('qr_scans').select('*', { count: 'exact', head: true })
    ]);

    return {
        userCount: userCount || 0,
        pageCount: pageCount || 0,
        subCount: subCount || 0,
        qrScanCount: qrScanCount || 0
    };
}

export async function getAdminUsers() {
    // Use service role ONLY on server-side
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { data: users } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    return users || [];
}

"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Admin Client
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

export async function revokePremium(userId: string) {
    try {
        // Verify Requester is Admin
        const authClient = await createAuthClient();
        const { data: { user: requester } } = await authClient.auth.getUser();

        if (!requester) return { error: "Unauthorized" };

        const { data: adminRole } = await supabaseAdmin
            .from('admin_roles')
            .select('role')
            .eq('user_id', requester.id)
            .single();

        const isOwner = requester.email === 'moizkiani@loveylink.com';

        if (!adminRole && !isOwner) {
            return { error: "Forbidden" };
        }

        // Proceed to Revoke
        console.log(`[Admin] Revoking premium for user ${userId} by ${requester.email}`);

        // 1. Expire Subscription
        const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'expired', current_period_end: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('status', 'active');

        if (subError) {
            console.error("Revoke Sub Error:", subError);
            return { error: "Failed to update subscription" };
        }

        // 2. Update User Profile
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({ subscription_status: 'expired' })
            .eq('id', userId);

        if (userError) {
            console.error("Revoke User Error:", userError);
            // Non-critical if sub is expired, but good to keep in sync
        }

        revalidatePath('/admin/users');
        return { success: true };

    } catch (error: any) {
        console.error("Revoke Exception:", error);
        return { error: error.message };
    }
}

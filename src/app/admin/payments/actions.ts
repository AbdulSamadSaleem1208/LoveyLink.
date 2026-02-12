"use server";

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client with Service Role Key for privileged operations
const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

/**
 * Verifies that the current user is authenticated and has an admin role.
 * Throws an error if not authorized.
 */
async function verifyAdmin() {
    const supabase = await createClient();

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized: Please log in");
    }

    // 2. Check Admin Role
    const { data: adminRole, error: roleError } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    // Hardcoded bypass for the owner
    const isOwner = user.email === 'moizkiani@loveylink.com';

    if ((roleError || !adminRole || !['admin', 'super_admin'].includes(adminRole.role)) && !isOwner) {
        throw new Error("Forbidden: Access denied");
    }

    return user;
}

export async function approvePayment(paymentId: string) {
    try {
        console.log(`Processing approval for payment: ${paymentId}`);

        // Step 1: Verify Admin Access
        await verifyAdmin();

        // Step 2: Prevent Double Approval & Fetch Payment
        const { data: payment, error: fetchError } = await supabaseAdmin
            .from('payment_requests')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (fetchError || !payment) {
            throw new Error("Payment request not found");
        }

        if (payment.status !== 'pending') {
            // If already approved, log and proceed to structure check (idempotency)
            console.log(`Payment is ${payment.status}, ensuring user status is active...`);
            if (payment.status === 'rejected') throw new Error(`Payment is already ${payment.status}`);
        } else {
            // Step 3: Update Payment Status
            const { error: updatePaymentError } = await supabaseAdmin
                .from('payment_requests')
                .update({
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentId);

            if (updatePaymentError) throw new Error(`Failed to update payment: ${updatePaymentError.message}`);
        }

        // Step 4: Handle Subscription (Manual Upsert)
        const manualSubscriptionId = `manual_easypaisa_${paymentId}`;
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30); // Add 30 days

        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('user_id', payment.user_id)
            .maybeSingle();

        const subscriptionData = {
            user_id: payment.user_id,
            status: 'active',
            plan_id: 'monthly_pkr_1000',
            current_period_end: currentPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
            // Only set stripe_subscription_id on insert to avoid unique constraint if we are updating by ID
            ...(existingSub ? {} : { stripe_subscription_id: manualSubscriptionId })
        };

        if (existingSub) {
            const { error: upError } = await supabaseAdmin
                .from('subscriptions')
                .update(subscriptionData)
                .eq('id', existingSub.id);
            if (upError) console.error("Subscription update failed:", upError);
        } else {
            const { error: insError } = await supabaseAdmin
                .from('subscriptions')
                .insert(subscriptionData);
            if (insError) console.error("Subscription insert failed:", insError);
        }

        // Step 5: Update User Status (Manual Upsert to bypass schema cache error)

        // Fetch user email
        const { data: { user: targetUser }, error: userError } = await supabaseAdmin.auth.admin.getUserById(payment.user_id);

        if (userError || !targetUser) {
            console.error("Critical: Could not find auth user for payment:", payment.user_id);
        }

        console.log(`Updating public.users for ${payment.user_id} with status 'active'...`);

        // Check if user exists in public.users
        const { data: publicUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', payment.user_id)
            .maybeSingle();

        if (checkError) console.error("Error checking public user:", checkError);

        let updateUserError = null;

        if (publicUser) {
            // Update
            const { error } = await supabaseAdmin
                .from('users')
                .update({
                    subscription_status: 'active',
                    subscription_id: existingSub?.id || manualSubscriptionId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', payment.user_id);
            updateUserError = error;
        } else {
            // Insert
            const { error } = await supabaseAdmin
                .from('users')
                .insert({
                    id: payment.user_id,
                    email: targetUser?.email || 'unknown@email.com',
                    subscription_status: 'active',
                    subscription_id: existingSub?.id || manualSubscriptionId,
                    updated_at: new Date().toISOString()
                });
            updateUserError = error;
        }

        if (updateUserError) {
            console.warn("WARNING: Failed to update public.users status (Schema Cache Error likely):", updateUserError);
            // Do NOT throw here. We will rely on subscriptions table for IsPremium check.
        } else {
            console.log("Successfully updated public.users status to active.");
        }

        // B. Auth Metadata
        await supabaseAdmin.auth.admin.updateUserById(
            payment.user_id,
            { user_metadata: { show_premium_welcome: true } }
        );

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Approve Payment Error:", error);
        return { error: error.message };
    }
}

export async function rejectPayment(paymentId: string) {
    try {
        console.log(`Rejecting payment: ${paymentId}`);

        await verifyAdmin();

        const { error } = await supabaseAdmin
            .from('payment_requests')
            .update({
                status: 'rejected',
                updated_at: new Date().toISOString()
            })
            .eq('id', paymentId);

        if (error) throw error;

        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error: any) {
        console.error("Reject Payment Error:", error);
        return { error: error.message };
    }
}

export async function getPaymentRequests() {
    try {
        await verifyAdmin();

        // 1. Fetch Payments
        const { data: payments, error: paymentsError } = await supabaseAdmin
            .from('payment_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;

        if (!payments || payments.length === 0) {
            return { data: [] };
        }

        // 2. Fetch Users via Auth Admin API (Bypass public.users table issues)
        const userIds = Array.from(new Set(payments.map((p: any) => p.user_id)));

        const userMap = new Map();

        await Promise.all(userIds.map(async (uid: any) => {
            const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(uid);
            if (!error && user) {
                userMap.set(uid, {
                    email: user.email,
                    full_name: user.user_metadata?.full_name || 'Unknown'
                });
            }
        }));

        // 3. Join in memory (userMap is already populated above)
        const joinedData = payments.map((p: any) => ({
            ...p,
            users: userMap.get(p.user_id) || { email: 'Unknown', full_name: 'Unknown' }
        }));

        return { data: joinedData };
    } catch (error: any) {
        console.error("Fetch Payments Error:", error);
        return { error: error.message };
    }
}

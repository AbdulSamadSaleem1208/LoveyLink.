"use server";

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import * as fs from 'fs';
import * as path from 'path';

function logDebug(message: string) {
    try {
        const logPath = path.resolve('debug_log.txt');
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write log", e);
    }
}

export async function checkSubscriptionStatus() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Auth error in checkSubscriptionStatus:", authError);
            return { isPremium: false, error: "Not logged in" };
        }

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

        // Use Admin Client to bypass RLS and get accurate status
        // 1. Check subscriptions table (Primary Source of Truth)
        const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        if (sub) {
            logDebug(`[CheckSubscription] Found active subscription in 'subscriptions' table for ${user.id}`);
            return { isPremium: true };
        }

        // 2. Fallback: Check users table (Legacy/Denormalized)
        const { data: userRef, error } = await supabaseAdmin
            .from('users')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

        logDebug(`[CheckSubscription] User: ${user.id}, Status: ${userRef?.subscription_status}, Error: ${error?.message}`);

        // 3. Tertiary Fallback: Check payment_requests table (Stable table)
        logDebug(`[CheckSubscription] Attempting Tertiary Fallback for ${user.id}...`);
        const { data: payment } = await supabaseAdmin
            .from('payment_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .limit(1)
            .maybeSingle();

        if (payment) {
            logDebug(`[CheckSubscription] Found approved payment request for ${user.id}. Fallback Premium Granted.`);
            return { isPremium: true };
        } else {
            logDebug(`[CheckSubscription] No approved payment found for ${user.id} in fallback.`);
        }

        if (error) {
            logDebug(`Error fetching subscription status: ${JSON.stringify(error)}`);
            // If error is "PGRST116" (no rows), it means user record missing.
            return { isPremium: false, error: error.message };
        }

        const isActive = userRef?.subscription_status === 'active';
        console.log(`[CheckSubscription] Final Verdict: ${isActive}`);

        return { isPremium: isActive };
    } catch (error) {
        console.error("Unexpected error checking subscription:", error);
        return { isPremium: false, error: "Internal Server Error" };
    }
}

export async function refreshSubscription() {
    try {
        logDebug("Starting refreshSubscription...");
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Not logged in" };
        logDebug(`refreshSubscription for user: ${user.id}`);

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

        // 1. Check for valid approved payment in payment_requests (Manual Easypaisa)
        const { data: payment, error: paymentError } = await supabaseAdmin
            .from('payment_requests')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false }) // Get most recent
            .limit(1)
            .single();

        if (paymentError || !payment) {
            logDebug(`No approved payment found: ${JSON.stringify(paymentError)}`);
            return { success: false, error: "No approved payment record found." };
        }
        logDebug(`Found approved payment: ${payment.id}`);

        // 1b. Upsert Subscription (Critical for Dashboard check)
        const manualSubscriptionId = `manual_easypaisa_${payment.id}`;
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30); // Add 30 days

        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        const subscriptionData = {
            user_id: user.id,
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
            if (upError) logDebug(`Subscription update failed: ${JSON.stringify(upError)}`);
            else logDebug(`Subscription updated: ${existingSub.id}`);
        } else {
            const { error: insError } = await supabaseAdmin
                .from('subscriptions')
                .insert(subscriptionData);
            if (insError) logDebug(`Subscription insert failed: ${JSON.stringify(insError)}`);
            else logDebug("Subscription inserted");
        }

        // 2. Force update user status (Manual Upsert to bypass schema cache error)
        // Check if user exists in public.users
        const { data: publicUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (checkError) logDebug(`Error checking public user: ${JSON.stringify(checkError)}`);

        let updateError = null;

        if (publicUser) {
            // Update
            const { error } = await supabaseAdmin
                .from('users')
                .update({
                    subscription_status: 'active',
                    subscription_id: payment.id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
            updateError = error;
        } else {
            // Insert
            const { error } = await supabaseAdmin
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    subscription_status: 'active',
                    subscription_id: payment.id,
                    updated_at: new Date().toISOString()
                });
            updateError = error;
        }

        if (updateError) {
            logDebug(`WARNING: Failed to refresh public.users status: ${JSON.stringify(updateError)}`);
            // Do not return error here, as we have a valid payment and subscription check will pass via subscriptions table or payment check
            return { success: true };
        }

        logDebug("Successfully refreshed user status.");
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        logDebug(`Exception in refreshSubscription: ${JSON.stringify(error)}`);
        return { success: false, error: "System error" };
    }
}

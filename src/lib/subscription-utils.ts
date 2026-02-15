"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Subscription utility functions for managing user subscriptions
 * Uses service role client to bypass RLS
 */

const getAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};

/**
 * Check and expire all subscriptions that have passed their current_period_end
 * This can be called periodically or on-demand
 */
export async function checkAndExpireSubscriptions() {
    try {
        const supabase = getAdminClient();

        // Call the database function to expire old subscriptions
        const { data, error } = await supabase.rpc('expire_old_subscriptions');

        if (error) {
            console.error('[SubscriptionUtils] Error expiring subscriptions:', error);
            return { success: false, error: error.message };
        }

        const expiredCount = data?.[0]?.expired_count || 0;
        console.log(`[SubscriptionUtils] Expired ${expiredCount} subscriptions`);

        return { success: true, expiredCount };
    } catch (error: any) {
        console.error('[SubscriptionUtils] Exception in checkAndExpireSubscriptions:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Expire a specific user's subscription
 * @param userId - The user ID whose subscription should be expired
 */
export async function expireUserSubscription(userId: string) {
    try {
        const supabase = getAdminClient();

        // Call the database function to expire the user's subscription
        const { data, error } = await supabase.rpc('expire_user_subscription', {
            target_user_id: userId
        });

        if (error) {
            console.error(`[SubscriptionUtils] Error expiring subscription for user ${userId}:`, error);
            return { success: false, error: error.message };
        }

        if (!data) {
            console.log(`[SubscriptionUtils] No active subscription found for user ${userId}`);
            return { success: false, error: 'No active subscription found' };
        }

        console.log(`[SubscriptionUtils] Successfully expired subscription for user ${userId}`);
        return { success: true };
    } catch (error: any) {
        console.error('[SubscriptionUtils] Exception in expireUserSubscription:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get the current subscription status for a user
 * @param userId - The user ID to check
 */
export async function getSubscriptionStatus(userId: string) {
    try {
        const supabase = getAdminClient();

        // Check subscriptions table first (source of truth)
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('status, current_period_end, plan_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (subError) {
            console.error(`[SubscriptionUtils] Error fetching subscription for ${userId}:`, subError);
            return { isPremium: false, error: subError.message };
        }

        if (!subscription) {
            // No subscription record - check payment_requests as fallback
            const { data: payment } = await supabase
                .from('payment_requests')
                .select('id, created_at')
                .eq('user_id', userId)
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (payment) {
                // Check if payment is within 30 days
                const paymentDate = new Date(payment.created_at);
                const expiryDate = new Date(paymentDate);
                expiryDate.setDate(expiryDate.getDate() + 30);

                const isValid = expiryDate > new Date();

                return {
                    isPremium: isValid,
                    status: isValid ? 'active' : 'expired',
                    expiryDate: expiryDate.toISOString(),
                    source: 'payment_requests'
                };
            }

            return { isPremium: false, status: 'free' };
        }

        // Check if subscription is expired
        const isActive = subscription.status === 'active';
        const isPastDue = subscription.current_period_end &&
            new Date(subscription.current_period_end) < new Date();

        return {
            isPremium: isActive && !isPastDue,
            status: subscription.status,
            expiryDate: subscription.current_period_end,
            planId: subscription.plan_id,
            source: 'subscriptions'
        };
    } catch (error: any) {
        console.error('[SubscriptionUtils] Exception in getSubscriptionStatus:', error);
        return { isPremium: false, error: error.message };
    }
}

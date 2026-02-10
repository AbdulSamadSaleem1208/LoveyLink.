"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client with Service Role Key
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

export async function approvePayment(paymentId: string) {
    try {
        console.log(`Approving payment: ${paymentId}`);

        // 1. Get the payment request
        const { data: payment, error: fetchError } = await supabaseAdmin
            .from('payment_requests')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (fetchError || !payment) {
            throw new Error("Payment request not found");
        }

        // 2. Update payment status to 'approved'
        const { error: updatePaymentError } = await supabaseAdmin
            .from('payment_requests')
            .update({ status: 'approved' })
            .eq('id', paymentId);

        if (updatePaymentError) throw updatePaymentError;

        // 3. Update User Subscription Status
        const { error: updateUserError } = await supabaseAdmin
            .from('users')
            .update({
                subscription_status: 'active',
                subscription_id: 'manual_easypaisa_lifetime' // Marking as lifetime/manual
            })
            .eq('id', payment.user_id);

        if (updateUserError) throw updateUserError;

        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error: any) {
        console.error("Approve Payment Error:", error);
        return { error: error.message };
    }
}

export async function rejectPayment(paymentId: string) {
    try {
        console.log(`Rejecting payment: ${paymentId}`);

        const { error } = await supabaseAdmin
            .from('payment_requests')
            .update({ status: 'rejected' })
            .eq('id', paymentId);

        if (error) throw error;

        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error: any) {
        console.error("Reject Payment Error:", error);
        return { error: error.message };
    }
}

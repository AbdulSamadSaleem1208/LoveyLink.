import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    // Await headers() to get the headers object
    const headerPayload = await headers();
    const signature = headerPayload.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = await createClient();

    // Handle events
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            // Logic to update user subscription status if needed, 
            // mainly relying on customer.subscription.created/updated
            break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;

            // Find user by stripe customer id or metadata
            // Note: We need to ensure we can map customer -> user.
            // Best to store userId in subscription metadata or look up user by stripe_customer_id

            const customerId = subscription.customer as string;

            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (user) {
                await supabase.from('subscriptions').upsert({
                    user_id: user.id,
                    stripe_subscription_id: subscription.id,
                    status: subscription.status,
                    plan_id: subscription.items.data[0]?.price.id,
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
                }, { onConflict: 'stripe_subscription_id' });

                // Update user status
                await supabase.from('users').update({
                    subscription_status: subscription.status === 'active' ? 'active' : 'free'
                }).eq('id', user.id);
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (user) {
                await supabase.from('subscriptions').update({
                    status: 'canceled'
                }).eq('stripe_subscription_id', subscription.id);

                await supabase.from('users').update({
                    subscription_status: 'free'
                }).eq('id', user.id);
            }
            break;
        }
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            // Clean currency amount (PKR 100000 -> 1000.00)
            // Store in payments table
            break;
        }
    }

    return new NextResponse(null, { status: 200 });
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get or create customer
        let customerId = user.user_metadata?.stripe_customer_id;

        // Retrieve user record to check if customer_id exists in DB if not in metadata
        if (!customerId) {
            const { data: userRecord } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single();
            customerId = userRecord?.stripe_customer_id;
        }

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabaseUserId: user.id
                }
            });
            customerId = customer.id;

            // Save to Supabase
            await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price_data: {
                        currency: 'pkr',
                        product_data: {
                            name: 'Love Link Premium',
                            description: 'Unlimited Love Pages, Custom QR Codes, and Advanced Analytics.',
                        },
                        unit_amount: 100000, // 1000.00 PKR (Stripe uses smallest currency unit)
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
            metadata: {
                userId: user.id
            }
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

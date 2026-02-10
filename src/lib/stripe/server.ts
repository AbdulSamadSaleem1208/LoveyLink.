import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.error("CRITICAL ERROR: STRIPE_SECRET_KEY is missing in environment variables.");
}

const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();

export const stripe = new Stripe(stripeKey, {
    // apiVersion: '2025-01-27.acacia',
    appInfo: {
        name: 'Love Link SaaS',
        version: '0.1.0'
    },
    typescript: true,
});

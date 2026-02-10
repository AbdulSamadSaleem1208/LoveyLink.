
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { stripe } from './src/lib/stripe/server';

async function testStripe() {
    console.log("Testing Stripe Connection...");
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("ERROR: STRIPE_SECRET_KEY is missing from environment variables.");
        return;
    }
    try {
        const products = await stripe.products.list({ limit: 1 });
        console.log("Stripe Connection Successful!");
        console.log("Found products:", products.data.length);
    } catch (error: any) {
        console.error("Stripe Connection Failed:", error.message);
    }
}

testStripe();

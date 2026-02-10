
import dotenv from 'dotenv';
import Stripe from 'stripe';
import path from 'path';

// Force load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

async function testStripe() {
    const key = process.env.STRIPE_SECRET_KEY;

    console.log("--- DEBUG INFO ---");
    if (!key) {
        console.error("ERROR: STRIPE_SECRET_KEY is undefined in process.env");
        return;
    }

    const trimmedKey = key.trim();
    console.log(`Key present: Yes`);
    console.log(`Key length: ${key.length}`);
    console.log(`Trimmed length: ${trimmedKey.length}`);
    console.log(`Starts with 'sk_test_': ${trimmedKey.startsWith('sk_test_')}`);
    // Show first 8 chars to verify structure without leaking full key
    console.log(`Key Preview: ${trimmedKey.substring(0, 8)}...`);

    const stripe = new Stripe(trimmedKey, {
        typescript: true,
    });

    console.log("Attempting to list products...");
    try {
        const products = await stripe.products.list({ limit: 1 });
        console.log("SUCCESS: Connection established!");
        console.log(`Found ${products.data.length} products.`);
    } catch (error: any) {
        console.error("FAILURE: Stripe API Error");
        console.error(`Type: ${error.type}`);
        console.error(`Message: ${error.message}`);
    }
}

testStripe();

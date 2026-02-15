const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkPublicUsers() {
    console.log("Checking public.users table...");
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
            console.error("Missing credentials");
            return;
        }

        const supabaseAdmin = createClient(url, serviceKey);

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Error accessing public.users:", error);
        } else {
            console.log("Success! public.users exists. Rows found:", data.length);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

checkPublicUsers();

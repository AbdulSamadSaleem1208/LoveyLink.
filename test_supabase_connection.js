const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log("Testing Supabase Connection...");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("URL:", url);
    console.log("Anon Key Present:", !!anonKey);
    console.log("Service Key:", serviceKey ? serviceKey.substring(0, 10) + "..." : "MISSING");

    if (!url || !anonKey) {
        console.error("Missing URL or Anon Key");
        return;
    }

    try {
        const supabase = createClient(url, anonKey);
        const { data, error } = await supabase.from('love_pages').select('count').limit(1);

        if (error) {
            console.error("Anon Client Error:", error);
        } else {
            console.log("Anon Client Success: Connected!");
        }
    } catch (e) {
        console.error("Anon Client Exception:", e);
    }

    if (serviceKey) {
        try {
            const supabaseAdmin = createClient(url, serviceKey);
            // Try to list users (requires admin)
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });

            if (error) {
                console.error("Admin Client Error:", error);
            } else {
                console.log("Admin Client Success: Listed users!");
            }
        } catch (e) {
            console.error("Admin Client Exception:", e);
        }
    }
}

testConnection();

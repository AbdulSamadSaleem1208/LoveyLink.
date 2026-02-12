const { Client } = require('pg');

const connectionString = "postgresql://postgres:samadsamadnuttertools302@db.mjgfdhdvxghylazwszzg.supabase.co:5432/postgres";

async function fix() {
    console.log("Connecting to DB...");
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } }); // SSL required for Supabase

    try {
        await client.connect();
        console.log("Connected. Reloading schema cache...");
        await client.query("NOTIFY pgrst, 'reload config'");
        console.log("Schema cache reloaded successfully.");
    } catch (e) {
        console.error("DB Error:", e);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Now trigger the seed
    console.log("Triggering seed endpoint...");
    try {
        const res = await fetch('http://localhost:3000/api/seed');
        if (res.ok) {
            console.log("Seed successful!");
            const text = await res.text();
            console.log(text);
        } else {
            console.error("Seed failed:", res.status, res.statusText);
            const text = await res.text();
            console.error(text);
            process.exit(1);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
        process.exit(1);
    }
}

fix();

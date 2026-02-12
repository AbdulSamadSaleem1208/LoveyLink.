
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
    const email = 'moizkiani@heartzuu.com';
    const password = 'Moiz1234';
    const role = 'super_admin'; // 'admin' or 'super_admin'

    console.log(`Seeding admin user: ${email}`);

    // 1. Create or Get User
    let userId;
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("Error listing users:", listError);
        return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
        console.log('User already exists, updating password...');
        userId = existingUser.id;
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password: password });
        if (updateError) console.error('Error updating password:', updateError);
    } else {
        console.log('Creating new user...');
        // Create the user with explicit confirmed status
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Moiz Kiani' }
        });
        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        userId = newUser.user.id;
    }

    // 2. Assign Admin Role
    console.log('Assigning admin role to user ID:', userId);

    // NOTE: explicit schema usage 'public' just in case
    const { error: roleError } = await supabase
        .from('admin_roles')
        .upsert({ user_id: userId, role: role }, { onConflict: 'user_id' });

    if (roleError) {
        console.error('Error assigning role:', roleError);
        // Fallback: try raw query if RPC or other methods were available (but standard client should work)
        console.log("Tip: Ensure the 'admin_roles' table exists and has appropriate RLS/Policies for Service Role (usually bypasses RLS).");
    } else {
        console.log('Admin role assigned successfully.');
    }
}

seedAdmin();

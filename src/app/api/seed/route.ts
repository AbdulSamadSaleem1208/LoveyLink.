import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const email = 'moizkiani@loveylink.com';
    const password = 'Moiz1234';
    const role = 'super_admin';

    try {
        console.log("Starting seed process...");

        // Debug: List tables to see if admin_roles is visible
        // We can't list tables easily via JS client without specific permissions or RPC.
        // Instead, let's try to just select from it first to see if that works.
        const { error: selectError } = await supabaseAdmin.from('admin_roles').select('count').limit(1);
        if (selectError) {
            console.error("Debug Select Error:", selectError);
            // If we can't see the table, we can't insert. 
            // BUT, sometimes 'schema cache' error is due to the client not knowing the schema exists at init.
            // It might be a timing issue or the table was created but not exposed to the API.
            // We will try to rely on 'upsert' which acts as an INSERT.
        }

        let userId;

        // 1. Create or Get User
        // This part works fine usually
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            userId = existingUser.id;
            console.log('User exists. Updating password...');
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
            if (updateError) throw updateError;
        } else {
            console.log('Creating user...');
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: 'Moiz Kiani' }
            });
            if (createError) throw createError;
            userId = newUser.user.id;
        }

        // 2. Assign Role
        console.log(`Assigning role ${role} to ${userId}...`);

        // RETRY MECHANISM: explicit schema
        const { error: roleError } = await supabaseAdmin
            .from('admin_roles')
            .upsert({ user_id: userId, role: role }, { onConflict: 'user_id' });

        if (roleError) {
            console.error("Role Assignment Error:", roleError);
            throw roleError;
        }

        return NextResponse.json({ success: true, message: `Admin ${email} configured successfully.` });
    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error
        }, { status: 500 });
    }
}

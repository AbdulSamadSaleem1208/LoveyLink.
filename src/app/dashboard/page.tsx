import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Plus, Heart, Sparkles, MoreVertical, Trash2, Eye, QrCode as QrIcon, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import WelcomeConfetti from "@/components/dashboard/WelcomeConfetti";
import RefreshSubscriptionButton from "@/components/dashboard/RefreshSubscriptionButton";

export default async function Dashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Initialize Admin Client for robust data fetching (bypass RLS)
    const supabaseAdmin = createSupabaseAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { data: lovePages } = await supabase
        .from('love_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Check subscription status from SUBSCRIPTIONS table (Source of Truth)
    // We bypass public.users because of schema cache issues on update
    console.log(`[Dashboard] Checking subscription for user ${user.id}`);

    // We can't import logDebug easily here if it's not a server component compatible export or path alias issue.
    // Instead, let's just use console.log and trust the user will run it.
    // Actually, I can import logs from actions.ts carefully or just copy the logging logic.
    // Let's copy the logging logic to be safe and immediate.

    const fs = require('fs');
    const path = require('path');
    const logPath = path.resolve('debug_dashboard.txt');
    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Dashboard User: ${user.id}\n`);
    } catch (e) { }

    const { data: sub, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('status, id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Sub result: ${JSON.stringify(sub)} Error: ${JSON.stringify(subError)}\n`);
    } catch (e) { }

    let isPremium = !!sub;

    if (!isPremium) {
        // Fallback: Check payment_requests directly
        const { data: payment } = await supabaseAdmin
            .from('payment_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .limit(1)
            .maybeSingle();

        if (payment) {
            console.log(`[Dashboard] Fallback Premium Granted via payment_requests for ${user.id}`);
            isPremium = true;
        }
    }

    // Check admin role
    const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    // Check for welcome flag in metadata
    const showWelcome = user.user_metadata?.show_premium_welcome;

    if (showWelcome) {
        // Clear the flag immediately so it doesn't show again
        await supabase.auth.updateUser({
            data: { show_premium_welcome: null }
        });
    }

    const isAdmin = !!adminRole || user.email === 'moizkiani@loveylink.com';

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 relative">
            {showWelcome && <WelcomeConfetti />}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Love Pages</h1>
                        <p className="text-gray-400">Manage and create your special declarations.</p>
                    </div>
                    <div className="flex gap-4">
                        {/* Admin Dashboard Button */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center px-4 py-2 bg-red-600/20 text-red-500 border border-red-600/30 rounded-xl hover:bg-red-600/30 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Admin Panel
                            </Link>
                        )}

                        {isPremium ? (
                            <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl">
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 font-bold">Premium Active</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <RefreshSubscriptionButton />
                                <Link
                                    href="/pricing"
                                    className="flex items-center px-4 py-2 bg-background-card border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4 mr-2 text-gray-400" />
                                    Upgrade to Premium
                                </Link>
                            </div>
                        )}
                        <Link
                            href="/create"
                            className="flex items-center px-6 py-2 bg-button-gradient text-white rounded-xl shadow-lg shadow-red-900/40 hover:opacity-90 transition-all transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Page
                        </Link>
                    </div>
                </div>

                {lovePages && lovePages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lovePages.map((page) => (
                            <div key={page.id} className="bg-background-card border border-white/10 rounded-2xl p-6 shadow-sm hover:border-red-primary/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-red-primary/10 rounded-full flex items-center justify-center text-red-primary group-hover:bg-red-primary group-hover:text-white transition-colors">
                                        <Heart className="w-6 h-6 fill-current" />
                                    </div>
                                    {page.published ? (
                                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                                            Published
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/20">
                                            Draft
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{page.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">For {page.recipient_name}</p>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                    <Link href={`/lp/${page.slug}`} className="flex-1 text-center text-sm font-medium text-gray-300 hover:text-white py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                        View
                                    </Link>
                                    <Link href={`/dashboard/success/${page.id}`} className="flex-1 text-center text-sm font-medium text-gray-300 hover:text-white py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                        QR Code
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-background-card border border-white/10 rounded-2xl p-12 text-center text-white">
                        <div className="mx-auto h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-700 group-hover:border-red-primary/50 transition-colors">
                            <Heart className="h-10 w-10 text-red-primary animate-pulse" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No pages yet</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">Start creating your first romantic page to share with your loved one. It only takes a few minutes!</p>
                        <Link
                            href="/create"
                            className="inline-flex items-center px-6 py-3 bg-button-gradient text-white rounded-xl shadow-lg hover:opacity-90 transition-all font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create My First Page
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

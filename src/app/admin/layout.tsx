import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, LayoutDashboard, LogOut } from "lucide-react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check admin role
    const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    // Hardcoded bypass for the owner
    const isOwner = user.email === 'moizkiani@loveylink.com';

    if (!adminRole && !isOwner) {
        redirect("/dashboard"); // Not an admin
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white min-h-screen flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-xl font-bold font-serif text-red-400">Admin Panel</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg text-gray-200 hover:text-white hover:bg-gray-700 transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Overview
                    </Link>
                    <Link href="/admin/users" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <Users className="w-5 h-5 mr-3" />
                        Users
                    </Link>
                    <Link href="/admin/payments" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <p className="text-xl mr-3">💰</p>
                        Payments
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800 space-y-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Exit to App
                    </Link>
                    <AdminSignOutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

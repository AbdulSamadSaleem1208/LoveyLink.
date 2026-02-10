import { createClient } from "@/lib/supabase/server";
import { Users, CreditCard, Heart, QrCode } from "lucide-react";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Parallel fetching for stats
    const [
        { count: userCount },
        { count: pageCount },
        { count: subCount },
        { count: qrScanCount }
    ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('love_pages').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('qr_scans').select('*', { count: 'exact', head: true })
    ]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">System Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={userCount || 0}
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={subCount || 0}
                    icon={<CreditCard className="w-6 h-6 text-green-500" />}
                    bg="bg-green-50"
                />
                <StatCard
                    title="Love Pages Created"
                    value={pageCount || 0}
                    icon={<Heart className="w-6 h-6 text-red-500" />}
                    bg="bg-red-50"
                />
                <StatCard
                    title="Total QR Scans"
                    value={qrScanCount || 0}
                    icon={<QrCode className="w-6 h-6 text-purple-500" />}
                    bg="bg-purple-50"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <p className="text-gray-500">Log visualization would go here...</p>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, bg }: { title: string, value: number, icon: React.ReactNode, bg: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
            <div className={`p-4 rounded-full ${bg} mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}

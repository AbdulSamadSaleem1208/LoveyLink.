import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import QRDisplay from "@/components/qr/QRDisplay";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";

type Props = {
    params: Promise<{ id: string }>
}

export default async function SuccessPage({ params }: Props) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: page } = await supabase
        .from('love_pages')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (!page) notFound();

    // Determine the base URL
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            siteUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else if (process.env.VERCEL_URL) {
            siteUrl = `https://${process.env.VERCEL_URL}`;
        } else {
            // Use production domain as fallback instead of localhost
            siteUrl = "https://loveylink.net";
        }
    }

    // If strictly localhost (dev mode), try to use LAN IP for mobile testing
    if (siteUrl.includes("localhost")) {
        try {
            const { networkInterfaces } = require('os');
            const nets = networkInterfaces();
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    if (net.family === 'IPv4' && !net.internal) {
                        siteUrl = siteUrl.replace("localhost", net.address);
                        break;
                    }
                }
            }
        } catch (e) {
            console.warn("Could not resolve LAN IP:", e);
        }
    }

    const publicUrl = `${siteUrl}/lp/${page.slug}`;

    // Log QR creation if not exists (Server side logic)
    const { data: qr } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('page_id', page.id)
        .maybeSingle();

    if (!qr) {
        await supabase.from('qr_codes').insert({
            page_id: page.id,
            qr_data: publicUrl
        });
    }

    return (
        <div className="min-h-screen bg-background-blush flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-red-50 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-primary" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Published Successfully!</h1>
                <p className="text-text-muted mb-8">
                    Your love page representing <span className="font-semibold text-red-primary">{page.title}</span> is now live.
                </p>

                <QRDisplay url={publicUrl} title={page.title} message={page.message} />

                <div className="mt-10 border-t border-gray-100 pt-8">
                    <Link href="/dashboard" className="text-text-muted hover:text-gray-900 flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

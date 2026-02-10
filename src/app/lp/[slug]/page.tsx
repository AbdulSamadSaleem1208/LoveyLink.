import { createClient } from "@/lib/supabase/client"; // Use client for now or server? Server is better for SEO
import { createClient as createServerClient } from "@/lib/supabase/server";
import LovePageRenderer from "@/components/love-page/LovePageRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force dynamic since we use params and DB
export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const supabase = await createServerClient();

    const { data: page } = await supabase
        .from('love_pages')
        .select('title, recipient_name')
        .eq('slug', slug)
        .single();

    if (!page) return { title: 'Love Page Not Found' };

    return {
        title: `${page.title} - For ${page.recipient_name}`,
        description: `A special love page dedicated to ${page.recipient_name}.`,
    };
}

export default async function PublicLovePage({ params }: Props) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const supabase = await createServerClient();

    // Fetch page data
    const { data: page, error } = await supabase
        .from('love_pages')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !page || !page.published) {
        notFound();
    }

    // Record page view (non-blocking)
    // We can do this via a useEffect in a client component or here server-side if strict
    // But doing it here might be tricky with async if we don't await. 
    // Better to just fire and forget or use client side analytics.
    // For now, let's keep it simple.

    return <LovePageRenderer data={page} />;
}

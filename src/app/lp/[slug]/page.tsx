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
    try {
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
    } catch (error) {
        console.error("Metadata generation error:", error);
        return { title: 'Love Link' };
    }
}

export default async function PublicLovePage({ params }: Props) {
    try {
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
            console.error("Page fetch error or not found:", error); // Log error for debugging
            notFound();
        }

        return <LovePageRenderer data={page} />;
    } catch (error) {
        console.error("Public Page Error:", error);
        notFound();
    }
}

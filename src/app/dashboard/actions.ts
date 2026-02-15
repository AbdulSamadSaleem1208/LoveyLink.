"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteLovePage(pageId: string) {
    const start = Date.now();
    console.log(`[Delete] Starting delete for ${pageId}`);

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log(`[Delete] Unauthorized attempt`);
            return { error: "Unauthorized" };
        }
        console.log(`[Delete] Auth check took ${Date.now() - start}ms`);

        const dbStart = Date.now();
        const { error } = await supabase
            .from('love_pages')
            .delete()
            .eq('id', pageId)
            .eq('user_id', user.id); // RLS enforcement by checking user_id

        console.log(`[Delete] DB operation took ${Date.now() - dbStart}ms`);

        if (error) {
            console.error("Delete Page Error:", error);
            return { error: "Failed to delete page" };
        }

        const revalidateStart = Date.now();
        revalidatePath('/dashboard');
        console.log(`[Delete] Revalidate took ${Date.now() - revalidateStart}ms`);

        return { success: true };
    } catch (error) {
        console.error("Delete Page Exception:", error);
        return { error: "An unexpected error occurred" };
    }
}

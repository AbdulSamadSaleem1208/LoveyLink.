"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

// Helper to get the absolute site URL
const getSiteUrl = async () => {
    let url = process.env.NEXT_PUBLIC_SITE_URL;

    if (!url) {
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else if (process.env.VERCEL_URL) {
            url = `https://${process.env.VERCEL_URL}`;
        }
    }

    if (!url) {
        const reqHeaders = await headers();
        const origin = reqHeaders.get("origin");
        if (origin) return origin;
        url = "http://localhost:3000";
    }

    return url;
};

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const origin = await getSiteUrl();

    console.log("Signup triggered. Redirect URL:", `${origin}/auth/callback`);

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        full_name: formData.get("full_name") as string,
    };

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: data.full_name,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
        redirect("/dashboard");
    }

    return { success: "Check your email to confirm your account." };
}

export async function resendVerificationEmail(email: string) {
    console.log("Resend Verification Email Triggered for:", email);
    const supabase = await createClient();
    const origin = await getSiteUrl();

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error("Supabase Resend Error:", error.message);
        return { error: error.message };
    }

    console.log("Supabase Resend Success (No error returned).");
    return { success: "Verification email sent!" };
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

export async function forgotPassword(data: { email: string }) {
    try {
        const supabase = await createClient();
        const origin = await getSiteUrl();
        const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent('/update-password')}`;

        console.log("Forgot Password Request:", data.email);
        console.log("Resolved Origin:", origin);
        console.log("Redirect URL:", redirectUrl);

        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
            redirectTo: redirectUrl,
        });

        if (error) {
            console.error("Supabase Reset Error:", error);
            return { error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error("Unexpected Error in forgotPassword:", err);
        return { error: "Unexpected server error. Check logs." };
    }
}

export async function updatePassword(password: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    return { success: true };
}

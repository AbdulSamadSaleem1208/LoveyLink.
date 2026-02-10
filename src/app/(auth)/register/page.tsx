"use client";

import { signup } from "@/app/auth/actions";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        setUserEmail(formData.get("email") as string);

        const result = await signup(formData);

        setLoading(false);
        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success) {
            setSuccess(true);
            toast.success(result.success);
        }
    };

    const handleResend = async () => {
        if (!userEmail) return;
        setResending(true);
        const { resendVerificationEmail } = await import("@/app/auth/actions");
        const result = await resendVerificationEmail(userEmail);

        setResending(false);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Verification email sent!");
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4">
                <div className="max-w-md w-full bg-background-card rounded-2xl shadow-xl p-8 border border-white/10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                            <Heart className="h-8 w-8 text-green-500 fill-green-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
                    <p className="text-gray-400 mb-8">
                        We've sent a verification link to <strong>{userEmail}</strong>. Please click the link to activate your account.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors border-green-500/20"
                        >
                            Return to Login
                        </Link>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-sm text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-4 disabled:opacity-50"
                        >
                            {resending ? "Sending..." : "Didn't receive it? Resend Email"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Heart className="h-12 w-12 text-red-primary fill-red-primary animate-pulse" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-red-primary hover:text-red-accent transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-background-card py-8 px-4 shadow-xl border border-white/10 sm:rounded-xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm placeholder-gray-500 text-white bg-black/50 focus:outline-none focus:ring-red-primary focus:border-red-primary sm:text-sm transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm placeholder-gray-500 text-white bg-black/50 focus:outline-none focus:ring-red-primary focus:border-red-primary sm:text-sm transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm placeholder-gray-500 text-white bg-black/50 focus:outline-none focus:ring-red-primary focus:border-red-primary sm:text-sm transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-button-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-all transform hover:scale-[1.02]"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign up"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-background-card text-gray-400">
                                    Trusted by 10,000+ couples
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

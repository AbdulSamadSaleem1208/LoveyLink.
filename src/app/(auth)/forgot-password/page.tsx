"use client";

import { useState } from "react";
import { forgotPassword } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { BackButton } from "@/components/ui/back-button";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const result = await forgotPassword({ email });
            if (result?.error) {
                toast.error(result.error);
                setErrorMsg(result.error);
            } else {
                toast.success("Password reset link sent to your email!");
            }
        } catch (error) {
            console.error("Client Submit Error:", error);
            toast.error("Something went wrong. Please try again.");
            setErrorMsg("Network or client error occurring.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 relative">
            <div className="absolute top-4 left-4">
                <BackButton className="text-gray-600 hover:text-gray-900" />
            </div>
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    {errorMsg && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 text-center">
                            {errorMsg}
                        </div>
                    )}
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email-address" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

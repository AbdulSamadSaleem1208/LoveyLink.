"use client";


import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Authentication Error
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    There was a problem signing you in.
                </p>
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center font-mono break-all">
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-background-card py-8 px-4 shadow-xl border border-white/10 sm:rounded-xl sm:px-10 text-center">
                    <p className="text-gray-300 mb-6">
                        Please try signing in again properly.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/login"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-button-gradient hover:opacity-90 transition-all transform hover:scale-[1.02]"
                        >
                            Back to Login
                        </Link>
                        <Link
                            href="/"
                            className="w-full flex justify-center py-3 px-4 border border-white/10 rounded-lg shadow-sm text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}

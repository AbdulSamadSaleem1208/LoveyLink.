"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WelcomeConfetti() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="bg-gradient-to-br from-red-900/90 to-black border border-red-500/50 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 animate-in fade-in zoom-in duration-500 relative z-10">
                <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-white mb-2">Congratulations!</h2>
                <p className="text-gray-200 text-lg mb-6">
                    Your payment has been approved! You now have access to all <span className="text-red-400 font-bold">Premium Features</span>.
                </p>
                <button
                    className="bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors pointer-events-auto"
                    onClick={() => {
                        router.refresh(); // Refresh to update UI state
                        // Ideally we'd also close this modal, but the refresh + server-side flag clearing should handle it.
                        // However, server-side clearing happens on render. 
                        // To be smoother, we might want to just hide it locally or reload.
                        window.location.reload();
                    }}
                >
                    Start Creating
                </button>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { refreshSubscription } from "@/app/actions";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RefreshSubscriptionButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const result = await refreshSubscription();
            if (result.success) {
                toast.success("Subscription status updated!");
                router.refresh(); // Refresh server components
            } else {
                toast.error(result.error || "Could not verify subscription.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
            title="Refresh Status if payment not showing"
        >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Checking..." : "Restore Purchase"}
        </button>
    );
}

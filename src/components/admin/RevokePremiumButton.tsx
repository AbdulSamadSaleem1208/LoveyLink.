"use client";

import { useState } from "react";
import { revokePremium } from "@/app/admin/users/actions";
import { toast } from "sonner";
import { Loader2, UserX } from "lucide-react";

export default function RevokePremiumButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);

    const handleRevoke = async () => {
        if (!confirm("Are you sure you want to revoke premium access for this user?")) {
            return;
        }

        setLoading(true);
        const result = await revokePremium(userId);

        setLoading(false);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Premium revoked successfully");
        }
    };

    return (
        <button
            onClick={handleRevoke}
            disabled={loading}
            className="text-red-600 hover:text-red-900 ml-4 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
            title="Revoke Premium"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-4 h-4" />}
            Revoke
        </button>
    );
}

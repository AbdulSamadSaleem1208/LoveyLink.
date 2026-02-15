"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteLovePage } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeletePageButton({ pageId }: { pageId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget; // Capture immediately to avoid null after await

        if (!confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
            return;
        }

        setLoading(true);

        try {
            const result = await deleteLovePage(pageId);

            if (result?.error) {
                toast.error(result.error);
                setLoading(false);
            } else {
                toast.success("Page deleted successfully");

                // Optimistic UI: Hide the card immediately
                const card = button.closest('.group');
                if (card) {
                    (card as HTMLElement).style.display = 'none';
                }

                router.refresh();
                setLoading(false);
            }
        } catch (error) {
            console.error("Client Delete Error:", error);
            toast.error("Failed to connect to server");
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-600/80 text-gray-300 hover:text-white rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete this page"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </button>
    );
}

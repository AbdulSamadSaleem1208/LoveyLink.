"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminSignOutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Failed to sign out");
        } else {
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-left"
        >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
        </button>
    );
}

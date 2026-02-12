"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

interface BackButtonProps {
    label?: string;
    className?: string;
}

export function BackButton({ label = "Go Back", className = "" }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            onClick={() => router.back()}
            className={`flex items-center gap-2 hover:bg-transparent hover:text-primary pl-0 ${className}`}
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}

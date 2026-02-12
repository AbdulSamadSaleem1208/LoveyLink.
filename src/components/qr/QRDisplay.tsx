"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2, Download, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function QRDisplay({ url, title, message }: { url: string, title: string, message?: string }) {
    const [qrSrc, setQrSrc] = useState<string>("");
    const [mode, setMode] = useState<'link' | 'text'>('link');

    useEffect(() => {
        const data = mode === 'link' ? url : (message || "No message provided");

        QRCode.toDataURL(data, {
            width: 400,
            margin: 2,
            color: {
                dark: "#9B1C1C", // Red primary
                light: "#FFF1F2", // Blush background
            },
            errorCorrectionLevel: 'H'
        }).then(setQrSrc);
    }, [url, mode, message]);

    const handleShare = async () => {
        const data = mode === 'link' ? url : (message || "No message provided");
        const shareData = {
            title: title,
            text: mode === 'link' ? `Check out this Love Page: ${title}` : message,
            url: mode === 'link' ? url : undefined
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(data);
                toast.success(mode === 'link' ? "Link copied to clipboard!" : "Message copied to clipboard!");
            } else {
                throw new Error("Clipboard API not available");
            }
        } catch (err) {
            console.error("Error sharing/copying:", err);
            // Fallback using execCommand
            try {
                const textArea = document.createElement("textarea");
                textArea.value = data;
                // Avoid scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        toast.success(mode === 'link' ? "Link copied to clipboard!" : "Message copied to clipboard!");
                    } else {
                        toast.error("Failed to copy to clipboard");
                    }
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                    toast.error("Failed to copy to clipboard");
                }
                document.body.removeChild(textArea);
            } catch (fallbackError) {
                console.error("Fallback clipboard failed:", fallbackError);
                toast.error("Could not share or copy link");
            }
        }
    };

    if (!qrSrc) return <Loader2 className="animate-spin h-8 w-8 text-red-primary" />;

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-red-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt={`QR Code for ${title}`} className="w-64 h-64 md:w-80 md:h-80" />
            </div>

            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setMode('link')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'link' ? 'bg-white shadow text-red-primary' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Link to Page
                </button>
                <button
                    onClick={() => setMode('text')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'text' ? 'bg-white shadow text-red-primary' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Message Only
                </button>
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors"
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </button>

                <a
                    href={qrSrc}
                    download={`love-page-qr-${title}-${mode}.png`}
                    className="flex items-center px-4 py-2 bg-red-primary text-white rounded-full text-sm font-medium hover:bg-red-accent transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                </a>
                {mode === 'link' && (
                    <Link
                        href={url}
                        target="_blank"
                        className="flex items-center px-4 py-2 border border-red-200 text-red-primary rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Page
                    </Link>
                )}
            </div>

            <p className="text-xs text-gray-400 max-w-xs text-center">
                {mode === 'link'
                    ? "Scans directly to your Love Page with music & photos."
                    : "Scans as plain text. The user will see your message immediately."}
            </p>
        </div>
    );
}

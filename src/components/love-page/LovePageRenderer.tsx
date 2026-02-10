"use client";

import { motion } from "framer-motion";
import { Heart, Music } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// Types matching DB schema approximately
export interface LovePageData {
    title: string;
    recipient_name: string;
    sender_name: string;
    message: string;
    images: string[];
    music_url?: string;
    theme_config?: {
        primaryColor?: string;
        backgroundColor?: string;
        fontFamily?: string;
        effects?: string[]; // 'hearts', 'sparkles'
    };
}

export default function LovePageRenderer({ data, preview = false }: { data: LovePageData; preview?: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (data.music_url && !preview) {
            // Auto-play might be blocked by browsers, show UI to play
        }
    }, [data.music_url, preview]);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const bgColor = data.theme_config?.backgroundColor || "#FFF1F2"; // Default blush
    const primaryColor = data.theme_config?.primaryColor || "#9B1C1C"; // Default red

    return (
        <div
            className="min-h-screen w-full overflow-x-hidden flex flex-col items-center py-12 px-4 relative"
            style={{
                backgroundColor: bgColor,
                fontFamily: data.theme_config?.fontFamily || 'var(--font-outfit)'
            }}
        >
            {/* Background Effects (Simplified for now) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Creating some floating hearts manually or via loop could go here */}
            </div>

            {/* Music Player Control */}
            {data.music_url && (
                <div className="fixed top-4 right-4 z-50">
                    <button
                        onClick={toggleMusic}
                        className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-red-100 hover:scale-110 transition-transform"
                        style={{ color: primaryColor }}
                    >
                        <Music className={`h-6 w-6 ${isPlaying ? 'animate-spin' : ''}`} />
                    </button>
                    <audio ref={audioRef} src={data.music_url} loop />
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center z-10 max-w-4xl w-full"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="inline-block mb-6"
                >
                    <Heart className="h-20 w-20 mx-auto drop-shadow-lg animate-pulse" style={{ fill: primaryColor, color: primaryColor }} />
                </motion.div>

                <h1 className="text-4xl md:text-7xl font-bold mb-6 drop-shadow-sm" style={{ color: primaryColor }}>
                    {data.title || "My Love Page"}
                </h1>

                <div className="mb-12">
                    <p className="text-xl md:text-2xl text-gray-700 font-light">To my dearest,</p>
                    <h2 className="text-3xl md:text-5xl font-serif mt-2 mb-4" style={{ color: primaryColor }}>
                        {data.recipient_name || "Recipient Name"}
                    </h2>
                </div>
            </motion.div>

            {/* Photo Gallery */}
            {data.images && data.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mb-16 z-10">
                    {data.images.map((img, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-300"
                        >
                            <Image
                                src={img}
                                alt={`Love memory ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Love Note */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/60 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-lg max-w-2xl w-full border border-red-50 text-center z-10 mx-auto"
            >
                <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-gray-800 font-serif italic">
                    "{data.message || "Write your beautiful message here..."}"
                </p>

                <div className="mt-8 pt-8 border-t border-red-100">
                    <p className="text-gray-500 text-sm uppercase tracking-widest">With all my love</p>
                    <p className="text-2xl font-bold mt-2" style={{ color: primaryColor }}>
                        {data.sender_name || "Your Name"}
                    </p>
                </div>
            </motion.div>

            {/* Footer for the page */}
            <div className="mt-20 text-center text-gray-500 text-sm z-10 pb-10">
                <p>Created with <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> using Love Link</p>
            </div>
        </div>
    );
}

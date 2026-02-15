"use client";

import React, { Component, ErrorInfo, Suspense } from 'react';
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import ReactPlayer to ensure client-side only
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Props {
    url: string;
    playing: boolean;
    onToggle?: () => void;
    onError?: (error: any) => void;
    onAutoPlayBlocked?: () => void;
    onPlayStart?: () => void;
}

interface State {
    hasError: boolean;
}

class PlayerErrorBoundary extends Component<{ children: React.ReactNode, fallback: React.ReactNode }, State> {
    constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("SafeReactPlayer caught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export default function SafeReactPlayer({ url, playing, onToggle, onAutoPlayBlocked, onPlayStart }: Props) {
    const [isReady, setIsReady] = React.useState(false);
    const [playAttempted, setPlayAttempted] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(true); // Start muted to bypass auto-play restrictions
    const [hasStartedPlaying, setHasStartedPlaying] = React.useState(false);

    if (!url) return null;

    // Reset ready state when url changes
    React.useEffect(() => {
        console.log("[SafeReactPlayer] URL changed:", url);
        setIsReady(false);
        setPlayAttempted(false);
        setIsMuted(true);
        setHasStartedPlaying(false);
    }, [url]);

    // Auto-unmute after playback starts (bypass auto-play restrictions)
    React.useEffect(() => {
        if (hasStartedPlaying && isMuted) {
            console.log("[SafeReactPlayer] Playback started, scheduling unmute in 300ms");
            const unmuteTimer = setTimeout(() => {
                console.log("[SafeReactPlayer] Auto-unmuting player");
                setIsMuted(false);
            }, 300);
            return () => clearTimeout(unmuteTimer);
        }
    }, [hasStartedPlaying, isMuted]);

    // Log playing state changes
    React.useEffect(() => {
        console.log("[SafeReactPlayer] Playing state changed:", playing, "Ready:", isReady, "Muted:", isMuted);
    }, [playing, isReady, isMuted]);

    return (
        <PlayerErrorBoundary fallback={<div className="hidden">Player Error</div>}>
            <div style={{ position: 'fixed', top: 0, left: '-10000px', width: '320px', height: '240px', visibility: 'hidden', pointerEvents: 'none' }}>
                <ReactPlayer
                    url={url}
                    playing={playing && isReady}
                    loop={true}
                    width="100%"
                    height="100%"
                    volume={isMuted ? 0 : 0.8}
                    muted={isMuted}
                    playsinline={true}
                    config={{
                        youtube: {
                            playerVars: {
                                origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                                playsinline: 1,
                                autoplay: 1,
                                mute: isMuted ? 1 : 0
                            }
                        }
                    }}
                    onReady={() => {
                        console.log("Player Ready");
                        setIsReady(true);
                    }}
                    onStart={() => {
                        console.log("Player Started");
                        setPlayAttempted(true);
                        setHasStartedPlaying(true);
                        if (onPlayStart) onPlayStart();
                    }}
                    onPlay={() => {
                        console.log("Player Playing");
                        setPlayAttempted(true);
                        if (onPlayStart) {
                            onPlayStart(); // Notify parent that music started
                        }
                    }}
                    onPause={() => {
                        // If we tried to play but got paused immediately, auto-play might be blocked
                        if (playing && !playAttempted && onAutoPlayBlocked) {
                            console.log("Auto-play might be blocked");
                            onAutoPlayBlocked();
                        }
                    }}
                    onError={(e: any) => {
                        console.error("Internal Player Error:", e);
                        // Check if it's an auto-play error
                        if (e && (e.type === 'autoplayblocked' || e.message?.includes('autoplay'))) {
                            if (onAutoPlayBlocked) {
                                onAutoPlayBlocked();
                            }
                        }
                        if (onToggle && playing) onToggle();
                    }}
                />
            </div>
        </PlayerErrorBoundary>
    );
}

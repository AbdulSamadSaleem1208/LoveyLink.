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

export default function SafeReactPlayer({ url, playing, onToggle }: Props) {
    const [isReady, setIsReady] = React.useState(false);

    if (!url) return null;

    // Reset ready state when url changes
    React.useEffect(() => {
        setIsReady(false);
    }, [url]);

    return (
        <PlayerErrorBoundary fallback={<div className="hidden">Player Error</div>}>
            <div style={{ position: 'fixed', top: 0, left: '-10000px', width: '320px', height: '240px', visibility: 'hidden', pointerEvents: 'none' }}>
                <ReactPlayer
                    url={url}
                    playing={playing && isReady}
                    loop={true}
                    width="100%"
                    height="100%"
                    volume={0.8}
                    playsinline={true}
                    config={{
                        youtube: {
                            playerVars: {
                                origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                                playsinline: 1
                            }
                        }
                    }}
                    onReady={() => {
                        console.log("Player Ready");
                        setIsReady(true);
                    }}
                    onStart={() => console.log("Player Started")}
                    onPlay={() => console.log("Player Playing")}
                    onError={(e: any) => {
                        console.error("Internal Player Error:", e);
                        if (onToggle && playing) onToggle();
                    }}
                />
            </div>
        </PlayerErrorBoundary>
    );
}

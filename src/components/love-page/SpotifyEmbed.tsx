"use client";

import { useEffect, useState } from "react";

interface Props {
    url: string;
}

export default function SpotifyEmbed({ url }: Props) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Don't render on server or if no URL
    if (!hasMounted || !url) return null;

    return (
        <div className="w-full max-w-md mx-auto">
            <iframe
                src={url}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '12px' }}
            />
        </div>
    );
}

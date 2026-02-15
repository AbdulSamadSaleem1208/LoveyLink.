"use client";

import { useState, useEffect } from "react";
import { checkSubscriptionStatus } from "@/app/actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Upload, Music, ArrowRight, ArrowLeft, Loader2, Play, Pause } from "lucide-react";
import LovePageRenderer from "@/components/love-page/LovePageRenderer";
import { toast } from "sonner";
import Link from "next/link";

interface LovePageData {
    title: string;
    sender_name: string;
    recipient_name: string;
    message: string;
    theme: string;
    images: string[];
    music_url: string;
}

// Force dynamic rendering - prevent static generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function CreateLovePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<LovePageData>({
        title: "",
        sender_name: "",
        recipient_name: "",
        message: "",
        theme: "#E11D48",
        images: [],
        music_url: ""
    });

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to create a page");
                router.push("/login");
            }
        };
        checkUser();
    }, [router]);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newImages: string[] = [];
        const supabase = createClient();

        try {
            const uploadPromises = files.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('love-page-assets')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('love-page-assets')
                    .getPublicUrl(filePath);

                return publicUrl;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
            toast.success("Images uploaded successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading images");
        } finally {
            setUploading(false);
        }
    };

    const handlePublish = async () => {
        setPublishing(true);
        const supabase = createClient();

        try {
            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error("Auth error:", authError);
                toast.error("You must be logged in to publish");
                // Save state to localstorage here if needed
                router.push("/login");
                return;
            }

            // Check Subscription Status (Server-Side)
            const { isPremium } = await checkSubscriptionStatus();

            if (!isPremium) {
                toast.error("Upgrade to Premium to publish & unlock QR code");
                // Optional: redirect to pricing after a short delay
                setTimeout(() => router.push("/pricing"), 1500);
                return;
            }



            // Create unique slug
            const slug = `${formData.recipient_name}-${Math.random().toString(36).substring(2, 7)}`.toLowerCase().replace(/\s+/g, '-');

            // Convert Spotify URL to embed format if needed
            let musicUrl = formData.music_url;
            if (musicUrl) {
                const trackMatch = musicUrl.match(/track\/([a-zA-Z0-9]+)/);
                if (trackMatch && !musicUrl.includes('/embed/')) {
                    musicUrl = `https://open.spotify.com/embed/track/${trackMatch[1]}`;
                }
            }

            const payload = {
                user_id: user.id,
                slug: slug,
                title: formData.title,
                recipient_name: formData.recipient_name,
                sender_name: formData.sender_name,
                message: formData.message,
                images: formData.images,
                music_url: musicUrl,
                theme_config: {
                    primaryColor: formData.theme,
                    backgroundColor: "#000000",
                    fontFamily: "var(--font-outfit)",
                },
                published: true
            };

            console.log("Publishing payload:", payload);

            const { data, error } = await supabase
                .from('love_pages')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error("Supabase insert error:", error);
                toast.error(`Failed to publish: ${error.message}`);
                throw error;
            }

            toast.success("Love Page Created!");
            router.push(`/dashboard/success/${data.id}`);
        } catch (error) {
            console.error("Publishing exception:", error);
            toast.error("An unexpected error occurred while publishing");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col text-white">
            {/* Wizard Header */}
            <div className="bg-black/80 backdrop-blur-md border-b border-white/10 py-4 px-6 fixed top-16 w-full z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-bold text-white">Create Love Page</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-2 w-8 rounded-full transition-colors ${step >= i ? 'bg-red-primary' : 'bg-gray-800'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow pt-32 pb-24 px-4 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">The Basics</h2>
                                    <p className="text-gray-400">Ideally, who is this page for?</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Page Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="block w-full px-4 py-3 bg-background-card border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-primary focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. For My Love"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                                            <input
                                                type="text"
                                                value={formData.sender_name}
                                                onChange={e => setFormData({ ...formData, sender_name: e.target.value })}
                                                className="block w-full px-4 py-3 bg-background-card border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-primary focus:border-transparent outline-none transition-all"
                                                placeholder="Note"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Their Name</label>
                                            <input
                                                type="text"
                                                value={formData.recipient_name}
                                                onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                                                className="block w-full px-4 py-3 bg-background-card border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-primary focus:border-transparent outline-none transition-all"
                                                placeholder="Juliet"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Your Message</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            rows={4}
                                            className="block w-full px-4 py-3 bg-background-card border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-primary focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Write something from your heart..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Memories</h2>
                                    <p className="text-gray-400">Upload a special photo for the cover.</p>
                                </div>

                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-full max-w-sm">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-2xl cursor-pointer bg-background-card hover:bg-white/5 transition-colors relative overflow-hidden group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {uploading ? (
                                                    <Loader2 className="w-8 h-8 text-red-primary animate-spin" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-white transition-colors" />
                                                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-white">Click to upload</span></p>
                                                        <p className="text-xs text-gray-500">PNG, JPG or GIF (Max 5)</p>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>

                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={img} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                                        className="absolute top-1 right-1 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Set the Mood</h2>
                                    <p className="text-gray-400">Choose a theme color and background music.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Theme Color</label>
                                    <div className="flex flex-wrap gap-4 justify-center">
                                        {['#E11D48', '#DB2777', '#9333EA', '#2563EB', '#059669', '#000000'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, theme: color })}
                                                className={`w-12 h-12 rounded-full border-2 transition-all transform hover:scale-110 ${formData.theme === color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Spotify Track URL (Optional)</label>
                                    <div className="relative">
                                        <Music className="absolute top-3 left-3 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={formData.music_url}
                                            onChange={e => setFormData({ ...formData, music_url: e.target.value })}
                                            className="block w-full pl-10 pr-4 py-3 bg-background-card border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-primary focus:border-transparent outline-none transition-all"
                                            placeholder="https://open.spotify.com/track/..."
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Paste a Spotify track link to add background music</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-[600px] border border-white/10 rounded-2xl overflow-hidden bg-black relative"
                            >
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur px-4 py-1 rounded-full text-xs text-white border border-white/10">
                                    Preview Mode
                                </div>
                                <LovePageRenderer
                                    data={{
                                        title: formData.title,
                                        sender_name: formData.sender_name,
                                        recipient_name: formData.recipient_name,
                                        message: formData.message,
                                        images: formData.images,
                                        music_url: formData.music_url,
                                        theme_config: {
                                            primaryColor: formData.theme,
                                            backgroundColor: "#000000",
                                            fontFamily: "var(--font-outfit)",
                                        }
                                    }}
                                    preview={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-black border-t border-white/10 py-4 px-6 fixed bottom-0 w-full z-40">
                <div className="max-w-4xl mx-auto flex justify-between">
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            className="px-6 py-2 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors font-medium"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            className="px-8 py-2 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors font-bold shadow-lg"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="px-8 py-2 bg-gradient-to-r from-red-primary to-pink-hot text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-red-900/50 flex items-center"
                        >
                            {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Page"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

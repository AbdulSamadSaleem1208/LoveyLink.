"use client";

import { Mail, MessageCircle, Heart, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [copied, setCopied] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("samadkayani302@gmail.com");
        setCopied(true);
        toast.success("Email address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="bg-background-card border-b border-white/10 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Heart className="h-12 w-12 text-red-primary fill-current mx-auto mb-6 animate-pulse" />
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
                    <p className="text-xl text-gray-400">
                        Have questions or need support? We're here to help!
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-background-card border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-primary to-pink-600"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Whether you have a question about our features, pricing, or need help with your Love Page, feel free to reach out.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-red-primary/10 p-3 rounded-lg">
                                        <Mail className="h-6 w-6 text-red-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Email Us</h3>
                                        <p className="text-gray-400 mt-1">Our friendly team is here to help.</p>
                                        <button
                                            onClick={handleCopyEmail}
                                            className="text-red-primary font-medium hover:underline mt-1 flex items-center gap-2 group"
                                        >
                                            samadkayani302@gmail.com
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-red-primary/10 p-3 rounded-lg">
                                        <MessageCircle className="h-6 w-6 text-red-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Live Chat</h3>
                                        <p className="text-gray-400 mt-1">Available via WhatsApp support (coming soon).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-red-primary focus:ring-red-primary outline-none transition-colors"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-red-primary focus:ring-red-primary outline-none transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        className="mt-1 block w-full rounded-lg bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-red-primary focus:ring-red-primary outline-none transition-colors"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <p className="text-sm text-gray-400 text-center mb-2">
                                        To send us a message, please copy our email address and use your preferred email client.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleCopyEmail}
                                        className="w-full flex items-center justify-center gap-2 bg-button-gradient text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-red-900/20"
                                    >
                                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                        {copied ? "Address Copied!" : "Copy Email Address"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

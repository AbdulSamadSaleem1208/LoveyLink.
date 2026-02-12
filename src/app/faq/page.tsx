"use client";

import { Heart, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
// Since this is a server component by default, we need to mark it as client for interactivity if we use useState
// Or we can make a simple client wrapper. For simplicity, let's make the whole page a client component for the accordion.

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-xl bg-background-card overflow-hidden transition-all duration-300 hover:border-red-primary/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
            >
                <span className="font-semibold text-white text-lg">{question}</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-red-primary" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                        {answer}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    const faqs = [
        {
            question: "How does LoveyLink work?",
            answer: "It's simple! You choose a template, customize it with your own photos, messages, and music, and we generate a unique web page for you. You can then share this page with your loved one via a direct link or a custom QR code."
        },
        {
            question: "Is it free to use?",
            answer: "We offer both free and premium plans. You can create a beautiful basic page for free. Our premium plans unlock more customization options, more photos, and special animations to make your surprise even better."
        },
        {
            question: "Can I edit my page after publishing?",
            answer: "Yes! You can edit your page at any time from your dashboard. Changes are updated instantly."
        },
        {
            question: "How long does my page last?",
            answer: "Your page will be online forever! We believe love should be eternal, so we don't delete your pages unless you ask us to."
        },
        {
            question: "Can I add music to my page?",
            answer: "Absolutely! You can add a link to your favorite song (YouTube, Spotify, etc.) and it will play when your loved one opens the page."
        },
        {
            question: "How do I get my QR code?",
            answer: "Once you publish your page, a unique QR code is automatically generated for you. You can download it from your dashboard or the success page."
        }
    ];

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="bg-background-card border-b border-white/10 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Heart className="h-12 w-12 text-red-primary fill-current mx-auto mb-6 animate-pulse" />
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
                    <p className="text-xl text-gray-400">
                        Everything you need to know about creating the perfect surprise.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}

                <div className="text-center mt-12 pt-8 border-t border-white/10">
                    <p className="text-gray-400 mb-4">Still have questions?</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-lg text-white bg-button-gradient hover:opacity-90 shadow-lg shadow-red-900/30 transition-all transform hover:scale-105"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}

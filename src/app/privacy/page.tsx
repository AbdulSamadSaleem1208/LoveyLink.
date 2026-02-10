import { Heart } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-black text-white min-h-screen">
            <div className="bg-background-card border-b border-white/10 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Heart className="h-12 w-12 text-red-primary fill-current mx-auto mb-6 animate-pulse" />
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-xl text-gray-400">
                        We value your trust and are committed to protecting your personal information.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        We collect information you provide directly to us when you create an account, create a Love Page, or communicate with us. This may include:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                        <li>Your name and email address.</li>
                        <li>Photos and messages you upload to your Love Pages.</li>
                        <li>Payment information (processed securely by our payment providers).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                        <li>Provide, maintain, and improve our services.</li>
                        <li>Process your transactions and unexpected orders.</li>
                        <li>Send you technical notices, updates, and support messages.</li>
                        <li>Respond to your comments and questions.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. Sharing of Information</h2>
                    <p className="text-gray-300 leading-relaxed">
                        We do not share your personal information with third parties except as described in this policy (e.g., with payment processors) or with your consent. Your Love Pages are public if you choose to share them via link or QR code.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                    <p className="text-gray-300 leading-relaxed">
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                    <p className="text-gray-300 leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at:{" "}
                        <a href="mailto:samadkayani302@gmail.com" className="text-red-primary hover:underline">
                            samadkayani302@gmail.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}

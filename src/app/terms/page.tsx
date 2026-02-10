import { Heart } from "lucide-react";

export default function TermsOfUsePage() {
    return (
        <div className="bg-black text-white min-h-screen">
            <div className="bg-background-card border-b border-white/10 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Heart className="h-12 w-12 text-red-primary fill-current mx-auto mb-6 animate-pulse" />
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Use</h1>
                    <p className="text-xl text-gray-400">
                        Please read these terms carefully before using Heartzzu.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-300 leading-relaxed">
                        By accessing or using our website and services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Permission is granted to temporarily download one copy of the materials (information or software) on Heartzzu's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                        <li>modify or copy the materials;</li>
                        <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                        <li>attempt to decompile or reverse engineer any software contained on Heartzzu's website;</li>
                        <li>remove any copyright or other proprietary notations from the materials; or</li>
                        <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. User Content</h2>
                    <p className="text-gray-300 leading-relaxed">
                        You retain ownership of any content (text, images, music) you upload to Heartzzu. However, by uploading content, you grant Heartzzu a license to host, store, and display your content as necessary to provide the service. You are solely responsible for the content you upload and must ensure you have the necessary rights to use it.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
                    <p className="text-gray-300 leading-relaxed">
                        In no event shall Heartzzu or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Heartzzu's website.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Governing Law</h2>
                    <p className="text-gray-300 leading-relaxed">
                        These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Contact</h2>
                    <p className="text-gray-300 leading-relaxed">
                        If you have any questions about these Terms, please contact us at:{" "}
                        <a href="mailto:samadkayani302@gmail.com" className="text-red-primary hover:underline">
                            samadkayani302@gmail.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}

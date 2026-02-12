import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 text-gray-400">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0 group">
                        <Heart className="h-6 w-6 text-red-primary fill-current drop-shadow-[0_0_5px_rgba(255,0,51,0.5)] group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-xl text-white group-hover:text-red-primary transition-colors">LoveyLink.</span>
                    </div>

                    <div className="flex space-x-8">
                        <Link href="/privacy" className="hover:text-white text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-white text-sm transition-colors">
                            Terms of Use
                        </Link>
                        <Link href="/contact" className="hover:text-white text-sm transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} LoveyLink. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

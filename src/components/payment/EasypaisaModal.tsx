"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface EasypaisaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EasypaisaModal({ isOpen, onClose }: EasypaisaModalProps) {
    const [trxId, setTrxId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const ACCOUNT_NUMBER = "03325188814";
    const ACCOUNT_TITLE = "ABDUL MUIZ SALEEM";

    const handleCopy = () => {
        navigator.clipboard.writeText(ACCOUNT_NUMBER);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Account number copied!");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trxId) {
            toast.error("Please enter the Transaction ID");
            return;
        }

        setSubmitting(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("You must be logged in");
                return;
            }

            const { error } = await supabase.from('payment_requests').insert({
                user_id: user.id,
                amount: 1000,
                trx_id: trxId,
                status: 'pending',
                payment_method: 'easypaisa_manual'
            });

            if (error) throw error;

            toast.success("Payment submitted for verification!");
            onClose();
            // Optional: Redirect to a status page or refresh
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to submit payment");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-green-500 mb-2">Easypaisa Payment</h2>
                    <p className="text-gray-400">Send <span className="text-white font-bold">PKR 1000</span> to activate Premium.</p>
                </div>

                <div className="bg-black/50 rounded-xl p-4 mb-6 border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Send Money To</p>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-mono text-white tracking-wider">{ACCOUNT_NUMBER}</span>
                        <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Copy Account Number">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                    </div>
                    <p className="text-sm text-gray-300 border-t border-white/10 pt-2 mt-2">
                        Title: <span className="font-semibold text-white">{ACCOUNT_TITLE}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Transaction ID (TRX ID)
                        </label>
                        <input
                            type="text"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="e.g. 84219XXXXXX"
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-green-500/50 outline-none transition-all font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Found in the SMS/App receipt from Easypaisa.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Payment"}
                    </button>
                </form>
            </div>
        </div>
    );
}

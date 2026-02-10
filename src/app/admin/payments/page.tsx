"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PaymentRequest {
    id: string;
    user_id: string;
    amount: number;
    trx_id: string;
    status: string;
    created_at: string;
    users: {
        email: string;
        full_name: string;
    };
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('payment_requests')
            .select(`
                *,
                users (
                    email,
                    full_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Failed to fetch payments");
        } else {
            setPayments((data as any) || []);
        }
        setLoading(false);
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id);
        const supabase = createClient();

        try {
            // Update request status
            const status = action === 'approve' ? 'approved' : 'rejected';
            const { error: updateError } = await supabase
                .from('payment_requests')
                .update({ status })
                .eq('id', id);

            if (updateError) throw updateError;

            if (action === 'approve') {
                // Find the user ID from the payment request
                const payment = payments.find(p => p.id === id);
                if (payment) {
                    // Update user subscription status
                    const { error: subError } = await supabase
                        .from('users')
                        .update({
                            subscription_status: 'active',
                            subscription_id: 'manual_easypaisa'
                        })
                        .eq('id', payment.user_id);

                    if (subError) throw subError;
                }
            }

            toast.success(`Payment ${status} successfully`);
            fetchPayments(); // Refresh list
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Payment Approvals (Easypaisa)</h1>

            <div className="bg-background-card rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">TRX ID</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No checks found.
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{payment.users?.full_name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{payment.users?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-yellow-400">{payment.trx_id}</td>
                                    <td className="px-6 py-4">PKR {payment.amount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {payment.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleAction(payment.id, 'approve')}
                                                    disabled={!!processingId}
                                                    className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20"
                                                    title="Approve"
                                                >
                                                    {processingId === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(payment.id, 'reject')}
                                                    disabled={!!processingId}
                                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

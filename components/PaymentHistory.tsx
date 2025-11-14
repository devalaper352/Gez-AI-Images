import React from 'react';
import type { PaymentRequest } from '../types';
import { PaymentHistoryIcon } from './icons/PaymentHistoryIcon';

interface PaymentHistoryProps {
    paymentHistory: PaymentRequest[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ paymentHistory }) => {
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="py-16">
            <div className="max-w-xl mx-auto text-center mb-12">
                <div className="inline-block p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full mb-4 border border-light-border dark:border-dark-border">
                    <PaymentHistoryIcon className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Payment History</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    A record of all your credit purchase requests.
                </p>
            </div>
            <div className="max-w-5xl mx-auto bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-light-bg dark:bg-dark-bg">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Credits</th>
                                <th className="p-3">Amount Paid</th>
                                <th className="p-3">Method</th>
                                <th className="p-3">TID</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map(req => (
                                <tr key={req.id} className="border-t border-light-border dark:border-dark-border">
                                    <td className="p-3 whitespace-nowrap text-light-text-secondary dark:text-dark-text-secondary">{formatDate(req.timestamp)}</td>
                                    <td className="p-3 font-semibold text-yellow-500">+{req.planCredits}</td>
                                    <td className="p-3 font-medium">₹{req.finalPrice}</td>
                                    <td className="p-3">{req.paymentMethod}</td>
                                    <td className="p-3 font-mono text-xs">{req.transactionId}</td>
                                    <td className="p-3">
                                        <div className="relative group">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                                req.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                                req.status === 'approved' ? 'bg-green-200 text-green-800' :
                                                'bg-red-200 text-red-800'
                                            }`}>{req.status}</span>
                                            {req.status === 'rejected' && req.rejectionReason && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-black/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Reason: {req.rejectionReason}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
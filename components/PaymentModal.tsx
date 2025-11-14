
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import type { CreditPlan, PaymentRequest } from '../types';
import { EasypaisaIcon } from './icons/EasypaisaIcon';
import { JazzcashIcon } from './icons/JazzcashIcon';
import { UPIIcon } from './icons/UPIIcon';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: CreditPlan;
    onPaymentRequest: (plan: CreditPlan, paymentMethod: PaymentRequest['paymentMethod'], userAccountNumber: string, transactionId: string) => void;
}

type PaymentMethod = PaymentRequest['paymentMethod'];
type PaymentStep = 'form' | 'success';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onPaymentRequest }) => {
    const [step, setStep] = useState<PaymentStep>('form');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
    const [userAccountNumber, setUserAccountNumber] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [formError, setFormError] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStep('form');
            setUserAccountNumber('');
            setTransactionId('');
            setFormError('');
            setSelectedMethod('UPI');
        }
    }, [isOpen]);

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!userAccountNumber.trim() || !transactionId.trim()) {
            setFormError("Please enter your payment account number and Transaction ID.");
            return;
        }

        onPaymentRequest(plan, selectedMethod, userAccountNumber, transactionId);
        setStep('success');
    };
    
    const renderContent = () => {
        switch (step) {
            case 'success':
                 return (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                             <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="mt-4 text-xl font-semibold">Request Submitted!</p>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Your request is pending approval. Credits will be added to your account once the admin verifies your payment.
                        </p>
                         <button
                            onClick={onClose}
                            className="mt-6 w-full py-2.5 font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 transition-opacity"
                        >
                            Close
                        </button>
                    </div>
                );
            case 'form':
            default:
                return (
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                        <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-center">
                            <p className="text-sm">You are purchasing</p>
                            <p className="text-2xl font-bold text-purple-500">{plan.credits} Credits</p>
                            <p className="text-lg font-semibold">Total Amount: ₹{plan.price}</p>
                        </div>
                        
                        <div className="p-3 text-xs text-center rounded-lg bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
                             🔒 Admin’s account number is private. After sending payment, please submit your details below for verification.
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">1. Select Your Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                               <PaymentMethodButton icon={UPIIcon} label="UPI" isSelected={selectedMethod === 'UPI'} onClick={() => setSelectedMethod('UPI')} />
                               <PaymentMethodButton icon={EasypaisaIcon} label="Easypaisa" isSelected={selectedMethod === 'Easypaisa'} onClick={() => setSelectedMethod('Easypaisa')} />
                               <PaymentMethodButton icon={JazzcashIcon} label="Jazzcash" isSelected={selectedMethod === 'Jazzcash'} onClick={() => setSelectedMethod('Jazzcash')} />
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-medium mb-2">2. Enter Your Payment Details</label>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={userAccountNumber}
                                    onChange={e => setUserAccountNumber(e.target.value)}
                                    placeholder="Your Account Number (from which you paid)"
                                    required
                                    className="w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={e => setTransactionId(e.target.value)}
                                    placeholder="Transaction ID (TID)"
                                    required
                                    className="w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>

                        {formError && <p className="text-red-500 text-xs text-center">{formError}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all active:scale-95"
                        >
                            Submit Request for Approval
                        </button>
                    </form>
                );
        }
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buy Credits (Manual Approval)">
            {renderContent()}
        </Modal>
    );
};

const PaymentMethodButton = ({ icon: Icon, label, isSelected, onClick }: { icon: React.FC<any>, label: string, isSelected: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-light-border dark:border-dark-border hover:border-purple-400/50'}`}>
        <Icon className="w-8 h-8 mb-1"/>
        <span className="text-xs font-semibold">{label}</span>
    </button>
);

export default PaymentModal;

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import type { User } from '../types';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onModify: (userId: string, amount: number) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onModify }) => {
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount(0);
            setError('');
        }
    }, [isOpen, user]);

    if (!user) return null;

    const handleAdd = () => {
        if (amount <= 0) {
            setError("Please enter a positive number of credits to add.");
            return;
        }
        setError('');
        onModify(user.id, amount);
    };

    const handleRemove = () => {
        if (amount <= 0) {
            setError("Please enter a positive number of credits to remove.");
            return;
        }
        if (user.credits < amount) {
            setError("Cannot remove more credits than the user currently has.");
            return;
        }
        setError('');
        onModify(user.id, -amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Modify Credits for ${user.fullName}`}>
            <div className="space-y-4">
                <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                    <p className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary">Current Balance</p>
                    <p className="text-2xl font-bold text-center">{user.credits} Credits</p>
                </div>

                <div>
                    <label htmlFor="credit-amount" className="block text-sm font-medium mb-1">Amount to Add/Remove</label>
                    <input
                        id="credit-amount"
                        type="number"
                        min="0"
                        value={amount === 0 ? '' : amount}
                        onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="e.g., 50"
                        className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                
                <div className="flex gap-4">
                    <button
                        onClick={handleRemove}
                        className="w-full py-2.5 font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-opacity"
                        disabled={!amount}
                    >
                        Remove Credits
                    </button>
                    <button
                        onClick={handleAdd}
                        className="w-full py-2.5 font-semibold rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-opacity"
                        disabled={!amount}
                    >
                        Add Credits
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditUserModal;
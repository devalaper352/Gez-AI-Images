
import React, { useState } from 'react';
import Modal from './Modal';
import * as authService from '../services/authService';
import type { User } from '../types';

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignup: (user: User) => void;
    onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSignup, onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = authService.signup(fullName, email, password);
            onSignup(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sign Up for Free">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="signup-fullname">Full Name</label>
                    <input
                        type="text"
                        id="signup-fullname"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                        className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="signup-email">Email</label>
                    <input
                        type="email"
                        id="signup-email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="signup-password">Password</label>
                    <input
                        type="password"
                        id="signup-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
                <p className="text-center text-sm">
                    Already have an account?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="font-semibold hover:underline">
                        Log in
                    </button>
                </p>
            </form>
        </Modal>
    );
};

export default SignupModal;

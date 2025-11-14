import React, { useState } from 'react';
import Modal from './Modal';
import * as authService from '../services/authService';
import type { User } from '../types';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User) => void;
    onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = authService.login(email, password);
            onLogin(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log In">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="login-email">Email</label>
                    <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    {isLoading ? 'Logging in...' : 'Log In'}
                </button>
                <p className="text-center text-sm">
                    Don't have an account?{' '}
                    <button type="button" onClick={onSwitchToSignup} className="font-semibold hover:underline">
                        Sign up
                    </button>
                </p>
            </form>
        </Modal>
    );
};

export default LoginModal;

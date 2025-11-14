
import React, { useState } from 'react';
import { MailIcon } from './icons/MailIcon';

interface ContactUsProps {
    onContactSubmit: (email: string, message: string) => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ onContactSubmit }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !message.trim()) {
            setError('Please fill out both fields.');
            return;
        }
        onContactSubmit(email, message);
        setIsSubmitted(true);
        setEmail('');
        setMessage('');
    };

    return (
        <div id="contact-us" className="py-16">
            <div className="max-w-xl mx-auto text-center mb-12">
                 <div className="inline-block p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full mb-4 border border-light-border dark:border-dark-border">
                    <MailIcon className="w-8 h-8 text-purple-500" />
                 </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Contact Us</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    Have questions or feedback? We'd love to hear from you.
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                {isSubmitted ? (
                    <div className="p-8 text-center bg-green-500/10 text-green-700 dark:text-green-300 rounded-lg">
                        <h3 className="text-xl font-semibold">Thank You!</h3>
                        <p>Your message has been sent. We will get back to you shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border space-y-6">
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium mb-2">Your Email</label>
                            <input
                                type="email"
                                id="contact-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="block text-sm font-medium mb-2">Message</label>
                            <textarea
                                id="contact-message"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                placeholder="Your message..."
                                className="w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" className="w-full py-3 font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all">
                            Send Message
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactUs;

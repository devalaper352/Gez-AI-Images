import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm modal-enter"
            onClick={onClose}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full max-w-md p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-xl border border-light-border dark:border-dark-border modal-content-enter"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
                    <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;

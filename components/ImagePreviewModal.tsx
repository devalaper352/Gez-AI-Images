
import React from 'react';
import Modal from './Modal';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: GeneratedImage | null;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, image }) => {
    if (!image) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${image.base64}`;
        link.download = `${image.prompt.substring(0, 30).replace(/\s/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Image Preview">
            <div className="space-y-4">
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
                    <img
                        src={`data:image/png;base64,${image.base64}`}
                        alt={image.prompt}
                        className="w-full h-auto object-contain max-h-[70vh]"
                    />
                </div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary p-2 bg-light-bg dark:bg-dark-bg rounded-md">
                    <strong>Prompt:</strong> {image.prompt}
                </p>
                <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-2.5 font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 transition-opacity"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download Image</span>
                </button>
            </div>
        </Modal>
    );
};

export default ImagePreviewModal;

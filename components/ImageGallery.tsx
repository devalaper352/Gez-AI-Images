

import React from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { EyeIcon } from './icons/EyeIcon';

interface ImageGalleryProps {
    images: GeneratedImage[];
    isLoading: boolean;
    onEnhance: (image: GeneratedImage) => void;
    onPreview: (image: GeneratedImage) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, isLoading, onEnhance, onPreview }) => {
    const handleDownload = (base64: string, prompt: string) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64}`;
        link.download = `${prompt.substring(0, 30).replace(/\s/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const SkeletonCard = () => (
        <div className="aspect-square bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shimmer border border-light-border dark:border-dark-border" />
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg">
                <p className="text-light-text-secondary dark:text-dark-text-secondary">Your generated images will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map(image => (
                <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-light-border dark:border-dark-border shadow-lg">
                    <div className="w-full h-full">
                        <img
                            src={`data:image/png;base64,${image.base64}`}
                            alt={image.prompt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <div className="flex items-center gap-3">
                             <button
                                onClick={() => onPreview(image)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all scale-90 group-hover:scale-100"
                                aria-label="Preview Image"
                            >
                                <EyeIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => handleDownload(image.base64, image.prompt)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all scale-90 group-hover:scale-100"
                                aria-label="Download Image"
                            >
                                <DownloadIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => onEnhance(image)}
                                disabled={image.isEnhancing}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all scale-90 group-hover:scale-100 disabled:opacity-50 disabled:animate-pulse"
                                aria-label="Enhance Image"
                            >
                                <MagicWandIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                     {image.isEnhancing && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="mt-2 text-sm">Enhancing...</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;
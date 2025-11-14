
import React from 'react';
import type { GenerationHistoryItem, GeneratedImage } from '../types';
import { RetryIcon } from './icons/RetryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';

interface HistoryProps {
    history: GenerationHistoryItem[];
    onDelete: (historyId: string) => void;
    onRegenerate: (prompt: string, numImages: number, aspectRatio: '1:1' | '16:9') => void;
    onPreview: (image: GeneratedImage) => void;
}

const History: React.FC<HistoryProps> = ({ history, onDelete, onRegenerate, onPreview }) => {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="py-16">
            <div className="max-w-xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Generation History</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    Review, re-create, or delete your past generations.
                </p>
            </div>
            <div className="space-y-8 max-w-5xl mx-auto">
                {history.map(item => (
                    <div key={item.id} className="p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                            <div>
                                <p className="font-semibold">{item.prompt}</p>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    {formatDate(item.timestamp)} &middot; {item.images.length} image(s) &middot; {item.aspectRatio}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => onRegenerate(item.prompt, item.images.length, item.aspectRatio)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-all hover:scale-105 active:scale-95"
                                    aria-label="Re-generate"
                                >
                                    <RetryIcon className="w-4 h-4" />
                                    <span>Re-generate</span>
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full border border-light-border dark:border-dark-border text-red-500 hover:bg-red-500/10 transition-all hover:scale-110 active:scale-95"
                                    aria-label="Delete history item"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {item.images.map(image => (
                                <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-light-border dark:border-dark-border">
                                    <img
                                        src={`data:image/png;base64,${image.base64}`}
                                        alt={item.prompt}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                                        <button
                                            onClick={() => onPreview({ id: image.id, base64: image.base64, prompt: item.prompt })}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
                                            aria-label="Preview Image"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;

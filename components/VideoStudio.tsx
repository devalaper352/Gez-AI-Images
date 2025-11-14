import React, { useState, useEffect, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import type { User, VideoGenerationHistoryItem } from '../types';
import { VideoIcon } from './icons/VideoIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface VideoStudioProps {
    user: User | null;
    onGenerateVideo: (prompt: string) => Promise<any>;
    onUpdateHistory: (operationId: string, status: 'completed' | 'failed', data: { videoUrl?: string, failureReason?: string }) => void;
    onDeleteHistory: (historyId: string) => void;
}

const POLLING_INTERVAL = 10000; // 10 seconds

const VideoStudio: React.FC<VideoStudioProps> = ({ user, onGenerateVideo, onUpdateHistory, onDeleteHistory }) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [isCheckingKey, setIsCheckingKey] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [generatingItems, setGeneratingItems] = useState<Set<string>>(new Set());
    const pollingTimers = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            } else {
                // Fallback for environments where aistudio is not available
                setApiKeySelected(!!process.env.API_KEY);
            }
            setIsCheckingKey(false);
        };
        checkKey();
    }, []);
    
    // Polling logic for pending videos on component mount
    useEffect(() => {
        if (user?.videoHistory) {
            const pendingVideos = user.videoHistory.filter(v => v.status === 'pending');
            pendingVideos.forEach(video => {
                if (!pollingTimers.current.has(video.operationId)) {
                    startPolling(video.operationId, 0); // Start immediately
                }
            });
        }
        // Cleanup timers on unmount
        return () => {
            pollingTimers.current.forEach(timerId => clearInterval(timerId));
        };
    }, [user?.videoHistory]);
    
    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            // Assume success and optimistically update UI
            setApiKeySelected(true);
            setIsCheckingKey(false);
        } catch (e) {
            console.error("Failed to open API key selection:", e);
            setError("Could not open the API key selection dialog.");
        }
    };
    
    const startPolling = (operationId: string, delay: number = POLLING_INTERVAL) => {
        const checkStatus = async () => {
            try {
                const operation = await geminiService.checkVideoGenerationStatus({ name: operationId });
                if (operation.done) {
                    stopPolling(operationId);
                    if (operation.response) {
                        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                        const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                        onUpdateHistory(operationId, 'completed', { videoUrl: finalUrl });
                    } else {
                        const failureReason = operation.error?.message || "Generation failed for an unknown reason.";
                        onUpdateHistory(operationId, 'failed', { failureReason });
                    }
                }
            } catch (e) {
                console.error("Polling failed:", e);
                stopPolling(operationId);
                onUpdateHistory(operationId, 'failed', { failureReason: (e as Error).message });
            }
        };

        const timerId = window.setTimeout(() => {
            checkStatus(); // Initial check
            const intervalId = window.setInterval(checkStatus, POLLING_INTERVAL);
            pollingTimers.current.set(operationId, intervalId);
        }, delay);
    };

    const stopPolling = (operationId: string) => {
        if (pollingTimers.current.has(operationId)) {
            clearInterval(pollingTimers.current.get(operationId));
            pollingTimers.current.delete(operationId);
        }
        setGeneratingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(operationId);
            return newSet;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || generatingItems.size > 0) return;
        setError(null);
        
        try {
            const operation = await onGenerateVideo(prompt);
            setGeneratingItems(prev => new Set(prev).add(operation.name));
            startPolling(operation.name);
            setPrompt('');
        } catch (e) {
            const err = e as Error;
            setError(err.message);
            // If the error is API key related, prompt the user to select a new one
            if (err.message.includes("API Key")) {
                setApiKeySelected(false);
            }
        }
    };
    
    if (isCheckingKey) {
        return <div className="text-center p-8">Checking API Key status...</div>;
    }

    if (!apiKeySelected) {
        return (
            <div className="py-16 text-center">
                 <div className="max-w-xl mx-auto p-8 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
                    <VideoIcon className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                    <h3 className="text-xl font-bold">API Key Required for Video Generation</h3>
                    <p className="text-sm mt-2 mb-4 text-light-text-secondary dark:text-dark-text-secondary">
                        The Veo model requires you to select your own API key for billing purposes. This is a one-time setup.
                    </p>
                    <button onClick={handleSelectKey} className="px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors">
                        Select API Key
                    </button>
                    <p className="text-xs mt-3">
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:underline text-light-text-secondary dark:text-dark-text-secondary">
                            Learn more about billing for Google AI models.
                        </a>
                    </p>
                </div>
            </div>
        );
    }
    
    const isGenerating = generatingItems.size > 0;

    return (
        <div>
            <div className="max-w-xl mx-auto text-center mb-12">
                 <div className="inline-block p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full mb-4 border border-light-border dark:border-dark-border">
                    <VideoIcon className="w-8 h-8 text-purple-500" />
                 </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Video Studio</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    Bring your ideas to life. Generate short, high-quality videos from a simple text prompt.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-light-bg-secondary dark:bg-dark-bg-secondary p-2 rounded-full border border-light-border dark:border-dark-border shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A majestic lion roaring on a cliff at sunrise"
                        className="w-full p-2 sm:p-3 text-base bg-transparent focus:outline-none text-center sm:text-left"
                        aria-label="Video generation prompt"
                    />
                    <button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full sm:w-auto px-6 py-3 text-base font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Video'}
                    </button>
                </div>
                {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
                {isGenerating && (
                    <div className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary mt-4">
                        <p>Video generation can take a few minutes. You can leave this page and your video will appear in your history once completed.</p>
                    </div>
                )}
            </form>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-center mb-8">Your Video History</h3>
                <div className="space-y-6 max-w-4xl mx-auto">
                    {user && user.videoHistory.length > 0 ? (
                        user.videoHistory.map(item => (
                            <VideoHistoryItem 
                                key={item.id} 
                                item={item} 
                                onDelete={onDeleteHistory}
                                isGenerating={generatingItems.has(item.operationId)}
                             />
                        ))
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">Your generated videos will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Fix: Define props interface and use React.FC for VideoHistoryItem component to fix TypeScript error.
interface VideoHistoryItemProps {
    item: VideoGenerationHistoryItem;
    onDelete: (id: string) => void;
    isGenerating: boolean;
}

const VideoHistoryItem: React.FC<VideoHistoryItemProps> = ({ item, onDelete, isGenerating }) => {
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getStatusIndicator = () => {
        switch(item.status) {
            case 'completed': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-200 text-green-800">Completed</span>
            case 'failed': return <span className="px-2 py-0.5 text-xs rounded-full bg-red-200 text-red-800">Failed</span>
            case 'pending':
            default: return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-200 text-yellow-800 flex items-center gap-1.5"><svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> In Progress</span>
        }
    }
    
    return (
        <div className="p-4 sm:p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                     <p className="font-semibold">{item.prompt}</p>
                     <div className="flex items-center gap-2 flex-shrink-0">
                        {item.status === 'completed' && item.videoUrl && (
                            <a href={item.videoUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-all" aria-label="Download Video"><DownloadIcon className="w-4 h-4"/></a>
                        )}
                        <button onClick={() => onDelete(item.id)} className="flex items-center justify-center w-8 h-8 rounded-full border border-light-border dark:border-dark-border text-red-500 hover:bg-red-500/10 transition-all" aria-label="Delete video"><TrashIcon className="w-4 h-4"/></button>
                     </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    <span>{formatDate(item.timestamp)}</span>
                    &middot;
                    {getStatusIndicator()}
                </div>
                 {item.status === 'failed' && <p className="text-xs text-red-500 mt-2">Reason: {item.failureReason}</p>}
            </div>
            <div className="w-full md:w-64 aspect-video bg-light-bg dark:bg-dark-bg rounded-md border border-light-border dark:border-dark-border flex-shrink-0">
                {item.status === 'completed' && item.videoUrl ? (
                    <video src={item.videoUrl} controls className="w-full h-full object-cover rounded-md" />
                ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        {item.status === 'pending' && <p className="text-sm font-medium">Processing...</p>}
                        {item.status === 'failed' && <p className="text-sm font-medium text-red-500">Generation Failed</p>}
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                             {isGenerating ? "We're working on it. This can take a few minutes." : "Your video will be available here once ready."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VideoStudio;
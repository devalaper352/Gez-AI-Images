
import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SearchIcon } from './icons/SearchIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { ZapIcon } from './icons/ZapIcon';
import type { ChatMessage, User } from '../types';
import { Content } from '@google/genai';

interface ChatBotProps {
    user: User | null;
    onSendMessage: (message: string, history: Content[], mode: 'fast' | 'search' | 'thinking') => Promise<{ text: string; sources: {title: string, uri: string}[] }>;
    onSaveSession: (messages: ChatMessage[]) => void;
}

type ChatMode = 'fast' | 'search' | 'thinking';

const ChatBot: React.FC<ChatBotProps> = ({ user, onSendMessage, onSaveSession }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<ChatMode>('fast');
    
    // State and refs for auto-saving
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<number | null>(null);
    const messagesSinceLastSave = useRef(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    // Load existing chat or set intro message when chat opens
    useEffect(() => {
        if (isOpen) {
            if (user && user.chatHistory.length > 0 && user.chatHistory[0].messages.length > 0) {
                setMessages(user.chatHistory[0].messages);
            } else {
                setMessages([{
                    id: `bot_intro_${Date.now()}`,
                    sender: 'bot',
                    text: "Hello! I'm your AI assistant. How can I help you today? You can switch my modes for different tasks."
                }]);
            }
            messagesSinceLastSave.current = 0;
        }
    }, [isOpen, user]);

    // Auto-save logic: Saves the session every 30 seconds or after every 5 messages.
    useEffect(() => {
        if (!isOpen || !user || messages.length <= 1) return;

        // This effect runs every time `messages` changes.
        // We increment a counter for each new message.
        messagesSinceLastSave.current++;

        const performSave = () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (messagesSinceLastSave.current === 0) return;

            setIsSaving(true);
            onSaveSession(messages);
            messagesSinceLastSave.current = 0; // Reset counter after saving
            
            setTimeout(() => setIsSaving(false), 1000); // Display indicator for 1s
        };

        // Always clear the previous timeout to reset the 30s timer
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        if (messagesSinceLastSave.current >= 5) {
            performSave(); // Save immediately if message count is met
        } else {
            // Set a new 30-second timer
            saveTimeoutRef.current = window.setTimeout(performSave, 30000);
        }

        // Cleanup timer on unmount or re-render
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [messages, isOpen, user, onSaveSession]);

    const handleSend = async () => {
        if (!currentMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            sender: 'user',
            text: currentMessage.trim()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);
        setError(null);

        // Convert ChatMessage[] to Content[] for the API
        const history: Content[] = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        try {
            const response = await onSendMessage(userMessage.text, history, mode);
            const botMessage: ChatMessage = {
                id: `bot_${Date.now()}`,
                sender: 'bot',
                text: response.text,
                sources: response.sources.length > 0 ? response.sources : undefined,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        // Trigger a final save on close if there are unsaved messages
        if (user && messages.length > 1 && messagesSinceLastSave.current > 0) {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            onSaveSession(messages);
        }
        setIsOpen(false);
    };


    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all scale-100 hover:scale-110 active:scale-95"
                aria-label="Open AI Assistant"
            >
                <ChatBubbleIcon className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-5 right-5 w-[calc(100%-2.5rem)] max-w-lg h-[70vh] max-h-[600px] flex flex-col bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border border-light-border dark:border-dark-border z-[100] transition-all duration-300 scale-100 origin-bottom-right">
             {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold">AI Assistant</h3>
                    {isSaving && <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary animate-pulse">Saving...</span>}
                </div>
                <button
                    onClick={handleClose}
                    className="p-1 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                    aria-label="Close chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>
            
             {/* Mode Toggles */}
            <div className="flex-shrink-0 flex justify-around p-2 border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50">
                <ModeButton label="Fast" icon={ZapIcon} isActive={mode === 'fast'} onClick={() => setMode('fast')} />
                <ModeButton label="Search" icon={SearchIcon} isActive={mode === 'search'} onClick={() => setMode('search')} />
                <ModeButton label="Thinking" icon={BrainCircuitIcon} isActive={mode === 'thinking'} onClick={() => setMode('thinking')} />
            </div>

            {/* Message Area */}
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-purple-600 dark:text-purple-300"/></div>}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-light-bg dark:bg-dark-bg rounded-bl-lg'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-purple-500/50 dark:border-purple-400/30">
                                        <h4 className="text-xs font-semibold mb-1">Sources:</h4>
                                        <div className="flex flex-col gap-1.5">
                                            {msg.sources.map((source, index) => (
                                                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-800 dark:text-purple-300 hover:underline truncate block">
                                                    {source.title}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex gap-2.5 justify-start">
                             <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-purple-600 dark:text-purple-300"/></div>
                             <div className="max-w-xs p-3 rounded-2xl bg-light-bg dark:bg-dark-bg rounded-bl-lg flex items-center gap-2">
                                <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-xs text-center text-red-500">{error}</p>}
                </div>
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 bg-light-bg dark:bg-dark-bg p-1.5 rounded-full border border-light-border dark:border-dark-border focus-within:ring-2 focus-within:ring-purple-500">
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="w-full bg-transparent p-2 text-sm focus:outline-none"
                    />
                    <button onClick={handleSend} disabled={isLoading || !currentMessage.trim()} className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 transition-all">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ModeButton = ({ label, icon: Icon, isActive, onClick }: { label: string, icon: React.FC<any>, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
            isActive ? 'bg-purple-600 text-white' : 'bg-transparent text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'
        }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);


export default ChatBot;
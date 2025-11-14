
import React, { useState, forwardRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeroProps {
    onGenerate: (prompt: string, numImages: number, aspectRatio: '1:1' | '16:9') => void;
    isLoading: boolean;
}

const Hero = forwardRef<HTMLDivElement, HeroProps>(({ onGenerate, isLoading }, ref) => {
    const [prompt, setPrompt] = useState('');
    const [numImages, setNumImages] = useState(1);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9'>('1:1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt, numImages, aspectRatio);
        }
    };

    return (
        <div ref={ref} className="text-center py-16 sm:py-24">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                <span className="block">Create Stunning AI Images</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animated-gradient">in Seconds.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
                Turn your imagination into reality. Describe any image, and our AI will bring it to life with breathtaking quality.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-light-bg-secondary dark:bg-dark-bg-secondary p-2 rounded-full border border-light-border dark:border-dark-border shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                    <SparklesIcon className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary hidden sm:block ml-2" />
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., An astronaut riding a horse on Mars, cinematic"
                        className="w-full p-2 sm:p-3 text-base bg-transparent focus:outline-none text-center sm:text-left"
                        aria-label="Image generation prompt"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full sm:w-auto px-6 py-3 text-base font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg dark:hover:shadow-white/10"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                    <div>
                        <label htmlFor="num-images" className="block font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">Number of Images</label>
                        <select 
                            id="num-images" 
                            value={numImages} 
                            onChange={(e) => setNumImages(parseInt(e.target.value))}
                            className="w-full p-2.5 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        >
                            <option value="1">1 Image</option>
                            <option value="2">2 Images</option>
                            <option value="3">3 Images</option>
                            <option value="4">4 Images</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="aspect-ratio" className="block font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">Aspect Ratio</label>
                        <select 
                            id="aspect-ratio" 
                            value={aspectRatio} 
                            onChange={(e) => setAspectRatio(e.target.value as '1:1' | '16:9')}
                            className="w-full p-2.5 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        >
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Landscape (16:9)</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
});

export default Hero;
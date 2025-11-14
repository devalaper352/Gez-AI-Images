
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface ImageEnhancerProps {
    onEditImage: (file: File, prompt: string) => Promise<string>;
}

const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ onEditImage }) => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setOriginalImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImagePreview(reader.result as string);
                setEditedImage(null); // Reset edited image when new one is uploaded
            };
            reader.readAsDataURL(file);
        } else {
            setError("Please upload a valid image file.");
        }
    };

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileChange(event.dataTransfer.files[0]);
        }
    }, []);

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleEdit = async () => {
        if (!originalImage || !prompt.trim()) {
            setError("Please upload an image and provide a prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const resultBase64 = await onEditImage(originalImage, prompt);
            setEditedImage(resultBase64);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to edit image.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!editedImage) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${editedImage}`;
        link.download = `edited_${originalImage?.name || 'image'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div id="image-studio" className="py-16">
            <div className="max-w-xl mx-auto text-center mb-12">
                 <div className="inline-block p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full mb-4 border border-light-border dark:border-dark-border">
                    <PhotoIcon className="w-8 h-8 text-purple-500" />
                 </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Image Studio</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    Upload your own photo and transform it with AI. Change styles, add elements, and more.
                </p>
            </div>
            
            <div className="max-w-5xl mx-auto p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
                {!originalImagePreview ? (
                    <div 
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        className="relative block w-full border-2 border-dashed border-light-border dark:border-dark-border rounded-lg p-12 text-center hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    >
                        <UploadIcon className="mx-auto h-12 w-12 text-light-text-secondary dark:text-dark-text-secondary" />
                        <span className="mt-2 block text-sm font-medium text-light-text dark:text-dark-text">
                            Drag & drop an image, or click to upload
                        </span>
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} accept="image/*" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <p className="font-semibold mb-2">Your Image</p>
                            <img src={originalImagePreview} alt="Original" className="rounded-lg w-full aspect-square object-cover border border-light-border dark:border-dark-border" />
                             <button onClick={() => { setOriginalImage(null); setOriginalImagePreview(null); }} className="text-sm mt-2 text-light-text-secondary dark:text-dark-text-secondary hover:underline">
                                Upload a different image
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-prompt" className="block font-semibold mb-2">Describe the changes</label>
                                <textarea
                                    id="edit-prompt"
                                    rows={3}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., Change the background to a futuristic city, cyberpunk style"
                                    className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <button 
                                onClick={handleEdit}
                                disabled={isLoading}
                                className="w-full py-3 font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? 'Transforming...' : 'Transform Image'}
                            </button>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            
                            {editedImage && (
                                <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                                    <p className="font-semibold">Result</p>
                                    <img src={`data:image/png;base64,${editedImage}`} alt="Edited" className="rounded-lg w-full aspect-square object-cover border border-light-border dark:border-dark-border" />
                                    <button
                                        onClick={handleDownload}
                                        className="w-full py-3 font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90"
                                    >
                                        Download Result
                                    </button>
                                </div>
                            )}
                            {isLoading && !editedImage && (
                                 <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                                     <p className="font-semibold">Result</p>
                                     <div className="w-full aspect-square rounded-lg bg-light-bg dark:bg-dark-bg shimmer"/>
                                 </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEnhancer;

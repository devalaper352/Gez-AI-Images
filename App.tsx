

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ImageGallery from './components/ImageGallery';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import AdminPanel from './components/AdminPanel';
import ImagePreviewModal from './components/ImagePreviewModal';
import ImageEnhancer from './components/ImageEnhancer';
import RewardModal from './components/RewardModal';
import ChatBot from './components/ChatBot';
import ContactUs from './components/ContactUs';
import PaymentModal from './components/PaymentModal';
import PaymentHistory from './components/PaymentHistory';
import Updates from './components/Updates';
import VideoStudio from './components/VideoStudio';


import * as geminiService from './services/geminiService';
import * as authService from './services/authService';
import type { User, GeneratedImage, RewardSettings, FeatureFlags, SocialMediaSettings, ChatMessage, ChatSession, CreditPlan, PaymentRequest, VideoGenerationHistoryItem, AdPlacement } from './types';
import { CREDIT_COST_PER_IMAGE, CREDIT_COST_PER_CHAT_MESSAGE, CONTACT_EMAIL, CREDIT_COST_PER_VIDEO_GENERATION } from './constants';
import { Content } from '@google/genai';

const AdRenderer: React.FC<{ ad: AdPlacement | undefined, className?: string }> = ({ ad, className }) => {
    if (!ad || !ad.isEnabled) {
        return null;
    }

    const adContent = () => {
        if (ad.type === 'google' && ad.content.script) {
            return <div dangerouslySetInnerHTML={{ __html: ad.content.script }} />;
        }
        if (ad.type === 'custom' && ad.content.imageUrl) {
            const img = <img src={ad.content.imageUrl} alt={ad.name} className="w-full h-auto" />;
            if (ad.content.linkUrl) {
                return <a href={ad.content.linkUrl} target="_blank" rel="sponsored noopener noreferrer">{img}</a>;
            }
            return img;
        }
        return null;
    };

    return (
        <div className={`ad-placement ad-placement-${ad.position} ${className || ''}`}>
            {adContent()}
        </div>
    );
};

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setSignupModalOpen] = useState(false);
    const [isAdminView, setIsAdminView] = useState(false);
    const [isRewardModalOpen, setRewardModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    
    const [rewardSettings, setRewardSettings] = useState(() => authService.getRewardSettings());
    const [featureFlags, setFeatureFlags] = useState(() => authService.getFeatureFlags());
    const [socialMediaSettings, setSocialMediaSettings] = useState(() => authService.getSocialMediaSettings());
    const [paymentSettings, setPaymentSettings] = useState(() => authService.getPaymentSettings());
    const [creditPlans, setCreditPlans] = useState(() => authService.getCreditPlans());
    const [ads, setAds] = useState<AdPlacement[]>([]);

    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<CreditPlan | null>(null);

    const [rewardStatus, setRewardStatus] = useState({ availableReward: 0, dayOfCycle: 0, nextClaimAvailableAt: null as string | null });

    const heroRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            setTheme(storedTheme);
        } else {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (user) {
            const status = authService.getRewardStatus(user);
            setRewardStatus({ availableReward: status.availableReward, dayOfCycle: status.dayOfCycle, nextClaimAvailableAt: status.nextClaimAvailableAt });
        }
    }, [user]);

    useEffect(() => {
        if (!isAdminView) {
            setRewardSettings(authService.getRewardSettings());
            setFeatureFlags(authService.getFeatureFlags());
            setSocialMediaSettings(authService.getSocialMediaSettings());
            setPaymentSettings(authService.getPaymentSettings());
            setCreditPlans(authService.getCreditPlans());
            setAds(authService.getAds());
        }
    }, [isAdminView]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const handleLogout = () => {
        setUser(null);
        setIsAdminView(false);
    };

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        setLoginModalOpen(false);
        setSignupModalOpen(false);
    };

    const handleClaimReward = (): number => {
        if (!user) return 0;
        try {
            const status = authService.getRewardStatus(user);
            if (status.availableReward > 0) {
                const updatedUser = authService.claimReward(user.id);
                setUser(updatedUser);
                return status.availableReward;
            }
            return 0;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to claim reward.");
            return 0;
        }
    };

    const handlePurchase = (plan: CreditPlan) => {
        if (!user) {
            setLoginModalOpen(true);
            return;
        }
        setSelectedPlan(plan);
        setPaymentModalOpen(true);
    };

    const handlePaymentRequest = (plan: CreditPlan, paymentMethod: PaymentRequest['paymentMethod'], userAccountNumber: string, transactionId: string) => {
        if(!user) return;
        try {
            const updatedUser = authService.createPaymentRequest(user.id, plan, paymentMethod, userAccountNumber, transactionId);
            setUser(updatedUser);
            // The modal will close itself after a delay, so we don't close it here immediately
        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment request failed.");
        }
    };

    const handleGenerate = async (prompt: string, numImages: number, aspectRatio: '1:1' | '16:9') => {
        if (!user) {
            setLoginModalOpen(true);
            return;
        }

        if (user.credits < CREDIT_COST_PER_IMAGE * numImages) {
            setError(`You need at least ${CREDIT_COST_PER_IMAGE * numImages} credits to generate ${numImages} images. You have ${user.credits}.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const updatedUser = authService.deductCredits(user.id, CREDIT_COST_PER_IMAGE * numImages);
            setUser(updatedUser);
            authService.logActivity(user.id, 'generate', `Generated ${numImages} image(s) with prompt: "${prompt.substring(0, 50)}..."`);
            
            const base64Images = await geminiService.generateImagesFromPrompt(prompt, numImages, aspectRatio);
            
            const newImages = base64Images.map((base64, i) => ({
                id: `gen_${Date.now()}_${i}`,
                base64,
                prompt
            }));

            setGeneratedImages(newImages);

            const userWithHistory = authService.addImageToHistory(user.id, prompt, newImages, aspectRatio);
            setUser(userWithHistory);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            // Refund credits on failure
            const refundedUser = authService.getUserById(user.id);
            if(refundedUser) {
                refundedUser.credits += CREDIT_COST_PER_IMAGE * numImages;
                authService.updateUser(refundedUser);
                setUser(refundedUser);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnhance = async (imageToEnhance: GeneratedImage) => {
        if (!user) {
            setLoginModalOpen(true);
            return;
        }
        if (user.credits < CREDIT_COST_PER_IMAGE) {
            setError(`You need at least ${CREDIT_COST_PER_IMAGE} credits to enhance an image.`);
            return;
        }

        setGeneratedImages(prev => prev.map(img => img.id === imageToEnhance.id ? { ...img, isEnhancing: true } : img));
        setError(null);

        try {
            const updatedUser = authService.deductCredits(user.id, CREDIT_COST_PER_IMAGE);
            setUser(updatedUser);
            authService.logActivity(user.id, 'enhance', `Enhanced an image.`);
            
            const enhancedBase64 = await geminiService.enhanceImage(imageToEnhance.base64, imageToEnhance.prompt);
            setGeneratedImages(prev => prev.map(img => img.id === imageToEnhance.id ? { ...imageToEnhance, base64: enhancedBase64, isEnhancing: false } : img));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during enhancement.');
             // Refund credits on failure
             const refundedUser = authService.getUserById(user.id);
             if(refundedUser) {
                 refundedUser.credits += CREDIT_COST_PER_IMAGE;
                 authService.updateUser(refundedUser);
                 setUser(refundedUser);
             }
             setGeneratedImages(prev => prev.map(img => img.id === imageToEnhance.id ? { ...img, isEnhancing: false } : img));
        }
    };
    
    const handleImageEdit = async (file: File, prompt: string): Promise<string> => {
        if (!user) {
            setLoginModalOpen(true);
            throw new Error("You must be logged in to edit images.");
        }
        if (user.credits < CREDIT_COST_PER_IMAGE) {
            throw new Error(`You need at least ${CREDIT_COST_PER_IMAGE} credits.`);
        }

        try {
            const updatedUser = authService.deductCredits(user.id, CREDIT_COST_PER_IMAGE);
            setUser(updatedUser);
            authService.logActivity(user.id, 'edit', `Edited an uploaded image with prompt: "${prompt.substring(0, 50)}..."`);
            const resultBase64 = await geminiService.editImage(file, prompt);
            return resultBase64;
        } catch (error) {
            // Refund credits on failure
            const refundedUser = authService.getUserById(user.id);
            if(refundedUser) {
                refundedUser.credits += CREDIT_COST_PER_IMAGE;
                authService.updateUser(refundedUser);
                setUser(refundedUser);
            }
            throw error; // Re-throw to be caught in the component
        }
    };
    
    const handleGenerateVideo = async (prompt: string): Promise<any> => {
        if (!user) {
            setLoginModalOpen(true);
            throw new Error("You must be logged in to generate videos.");
        }
        if (user.credits < CREDIT_COST_PER_VIDEO_GENERATION) {
            throw new Error(`You need at least ${CREDIT_COST_PER_VIDEO_GENERATION} credits to generate a video. You have ${user.credits}.`);
        }

        try {
            const updatedUser = authService.deductCredits(user.id, CREDIT_COST_PER_VIDEO_GENERATION);
            setUser(updatedUser);
            authService.logActivity(user.id, 'video_generate', `Started video generation for prompt: "${prompt.substring(0, 50)}..."`);
            const operation = await geminiService.generateVideo(prompt);
            
            const userWithHistory = authService.addVideoToHistory(user.id, prompt, operation.name);
            setUser(userWithHistory);

            return operation;
        } catch (error) {
            // Refund credits on failure
             const refundedUser = authService.getUserById(user.id);
            if(refundedUser) {
                refundedUser.credits += CREDIT_COST_PER_VIDEO_GENERATION;
                authService.updateUser(refundedUser);
                setUser(refundedUser);
            }
            throw error; // Re-throw to be caught in the component
        }
    };

    const handleUpdateVideoHistory = (operationId: string, status: 'completed' | 'failed', data: { videoUrl?: string; failureReason?: string }) => {
        if (!user) return;
        const updatedUser = authService.updateVideoInHistory(user.id, operationId, status, data);
        setUser(updatedUser);
    };

    const handleDeleteVideoHistory = (historyId: string) => {
        if (!user) return;
        const updatedUser = authService.deleteVideoFromHistory(user.id, historyId);
        setUser(updatedUser);
    };


    const handleSendMessage = async (message: string, history: Content[], mode: 'fast' | 'search' | 'thinking') => {
        if (!user) {
            setLoginModalOpen(true);
            throw new Error("You must be logged in to use the chatbot.");
        }
        if (user.credits < CREDIT_COST_PER_CHAT_MESSAGE) {
            throw new Error(`You need at least ${CREDIT_COST_PER_CHAT_MESSAGE} credit to send a message. You have ${user.credits}.`);
        }
        try {
            const updatedUser = authService.deductCredits(user.id, CREDIT_COST_PER_CHAT_MESSAGE);
            setUser(updatedUser);
            authService.logActivity(user.id, 'chatbot_message', `Sent message in ${mode} mode: "${message.substring(0, 50)}..."`);
            const result = await geminiService.sendMessageToChatbot(message, history, mode);
            return result;
        } catch (error) {
            // Refund credits on failure
            const refundedUser = authService.getUserById(user.id);
            if(refundedUser) {
                refundedUser.credits += CREDIT_COST_PER_CHAT_MESSAGE;
                authService.updateUser(refundedUser);
                setUser(refundedUser);
            }
            throw error;
        }
    };

    const handleSaveChatSession = (messages: ChatMessage[]) => {
        if (!user) return;
        try {
            const updatedUser = authService.saveChatSession(user.id, messages);
            setUser(updatedUser);
        } catch (err) {
            // This is a background save, so we won't show a UI error
            console.error("Failed to save chat session:", err);
        }
    };

    const handleContactSubmit = (email: string, message: string) => {
        authService.submitContactMessage(email, message);
        // This is a simulation, so we won't actually send an email.
        // The message is stored for the admin to view.
        // A real app would use a backend service to send the email.
    };
    
    const handlePaymentModalClose = () => {
        setPaymentModalOpen(false);
        setSelectedPlan(null);
    }
    
    // Filter ads by position
    const enabledAds = ads.filter(ad => ad.isEnabled && featureFlags.isAdsSystemEnabled);
    const headerAd = enabledAds.find(ad => ad.position === 'header');
    const footerAd = enabledAds.find(ad => ad.position === 'footer');
    const leftSidebarAd = enabledAds.find(ad => ad.position === 'leftSidebar');
    const rightSidebarAd = enabledAds.find(ad => ad.position === 'rightSidebar');
    const homepageBannerAd = enabledAds.find(ad => ad.position === 'homepageBanner');


    return (
        <div className={`font-sans min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text`}>
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                user={user}
                onLogout={handleLogout}
                onLoginClick={() => setLoginModalOpen(true)}
                onSignupClick={() => setSignupModalOpen(true)}
                isAdminView={isAdminView}
                setIsAdminView={setIsAdminView}
                onRewardClick={() => setRewardModalOpen(true)}
                hasRewardAvailable={rewardStatus.availableReward > 0}
                featureFlags={featureFlags}
                ad={headerAd}
            />

            <main>
                {isAdminView && user?.isAdmin ? (
                    <AdminPanel currentUser={user} />
                ) : (
                    <div className="container mx-auto px-4">
                        <div className="flex gap-6">
                            {leftSidebarAd && (
                                <aside className="w-1/5 hidden lg:block py-16">
                                    <div className="sticky top-24">
                                        <AdRenderer ad={leftSidebarAd} />
                                    </div>
                                </aside>
                            )}
                            <div className="flex-1 min-w-0">
                                <Hero ref={heroRef} onGenerate={handleGenerate} isLoading={isLoading} />
                                
                                {homepageBannerAd && (
                                    <div className="my-8">
                                        <AdRenderer ad={homepageBannerAd} />
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="my-4 p-4 text-center text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
                                        <p>{error}</p>
                                    </div>
                                )}

                                <ImageGallery
                                    images={generatedImages}
                                    isLoading={isLoading}
                                    onEnhance={handleEnhance}
                                    onPreview={setPreviewImage}
                                />
                                
                                {user && user.paymentHistory && user.paymentHistory.length > 0 && (
                                    <PaymentHistory paymentHistory={user.paymentHistory} />
                                )}
                                
                                {featureFlags.isImageStudioEnabled && <ImageEnhancer onEditImage={handleImageEdit} />}

                                {featureFlags.isVideoGeneratorEnabled && (
                                    <div id="video-studio" className="pt-16">
                                        <VideoStudio 
                                            user={user}
                                            onGenerateVideo={handleGenerateVideo}
                                            onUpdateHistory={handleUpdateVideoHistory}
                                            onDeleteHistory={handleDeleteVideoHistory}
                                        />
                                    </div>
                                )}

                                <div id="features" className="pt-16"><Features featureFlags={featureFlags} /></div>
                                <div id="how-it-works" className="pt-16"><HowItWorks featureFlags={featureFlags} /></div>
                                <div id="updates" className="pt-16"><Updates /></div>
                                {featureFlags.isPurchaseSystemEnabled && (
                                    <div id="pricing" className="pt-16"><Pricing plans={creditPlans} onPurchase={handlePurchase} /></div>
                                )}
                                <ContactUs onContactSubmit={handleContactSubmit} />
                            </div>
                            {rightSidebarAd && (
                                <aside className="w-1/5 hidden lg:block py-16">
                                    <div className="sticky top-24">
                                        <AdRenderer ad={rightSidebarAd} />
                                    </div>
                                </aside>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer socialMediaSettings={socialMediaSettings} ad={footerAd} />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onLogin={handleLogin}
                onSwitchToSignup={() => {
                    setLoginModalOpen(false);
                    setSignupModalOpen(true);
                }}
            />
            <SignupModal
                isOpen={isSignupModalOpen}
                onClose={() => setSignupModalOpen(false)}
                onSignup={handleLogin}
                 onSwitchToLogin={() => {
                    setSignupModalOpen(false);
                    setLoginModalOpen(true);
                }}
            />
            <ImagePreviewModal 
                image={previewImage}
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
            />
            <RewardModal
                isOpen={isRewardModalOpen}
                onClose={() => setRewardModalOpen(false)}
                onClaim={handleClaimReward}
                rewardStatus={rewardStatus}
                rewardSettings={rewardSettings}
            />
            
            {user && selectedPlan && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={handlePaymentModalClose}
                    plan={selectedPlan}
                    onPaymentRequest={handlePaymentRequest}
                />
            )}


            {featureFlags.isChatBotEnabled && !isAdminView && (
                <ChatBot 
                    user={user}
                    onSendMessage={handleSendMessage} 
                    onSaveSession={handleSaveChatSession}
                />
            )}
        </div>
    );
};

export default App;
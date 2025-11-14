

import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { GiftIcon } from './icons/GiftIcon';
import { APP_NAME } from '../constants';
import type { User, FeatureFlags, AdPlacement } from '../types';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    user: User | null;
    onLogout: () => void;
    onLoginClick: () => void;
    onSignupClick: () => void;
    isAdminView: boolean;
    setIsAdminView: (isAdminView: boolean) => void;
    onRewardClick: () => void;
    hasRewardAvailable: boolean;
    featureFlags: FeatureFlags;
    ad?: AdPlacement;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, user, onLogout, onLoginClick, onSignupClick, isAdminView, setIsAdminView, onRewardClick, hasRewardAvailable, featureFlags, ad }) => {
    
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.querySelector(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const AdContent: React.FC<{ ad: AdPlacement }> = ({ ad }) => {
        if (ad.type === 'google' && ad.content.script) {
            return <div dangerouslySetInnerHTML={{ __html: ad.content.script }} />;
        }
        if (ad.type === 'custom' && ad.content.imageUrl) {
            const img = <img src={ad.content.imageUrl} alt={ad.name} className="max-h-16" />;
            if (ad.content.linkUrl) {
                return <a href={ad.content.linkUrl} target="_blank" rel="sponsored noopener noreferrer">{img}</a>;
            }
            return img;
        }
        return null;
    };
    
    return (
        <>
            <header className="sticky top-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsAdminView(false); }} className="flex items-center gap-2 text-xl font-bold text-light-text dark:text-dark-text">
                            <SparklesIcon className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                            <span>{APP_NAME}</span>
                        </a>
                        <div className="flex items-center gap-4">
                            {!isAdminView && (
                                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                    <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="hover:text-light-text dark:hover:text-dark-text transition-transform hover:scale-105">Features</a>
                                    <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-light-text dark:hover:text-dark-text transition-transform hover:scale-105">How It Works</a>
                                    <a href="#updates" onClick={(e) => handleNavClick(e, '#updates')} className="hover:text-light-text dark:hover:text-dark-text transition-transform hover:scale-105">Updates</a>
                                    {featureFlags.isPurchaseSystemEnabled && (
                                        <a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')} className="hover:text-light-text dark:hover:text-dark-text transition-transform hover:scale-105">Pricing</a>
                                    )}
                                    {featureFlags.isVideoGeneratorEnabled && (
                                        <a href="#video-studio" onClick={(e) => handleNavClick(e, '#video-studio')} className="hover:text-light-text dark:hover:text-dark-text transition-transform hover:scale-105">Video Studio</a>
                                    )}
                                    <a href="#contact-us" onClick={(e) => handleNavClick(e, '#contact-us')} className="hover:text-light-text dark:hover:text-dark-text transition-transform hover:scale-105">Contact Us</a>
                                </nav>
                            )}
                        
                            <div className="flex items-center gap-4">
                                {user ? (
                                    <>
                                        {user.isAdmin && (
                                            <button onClick={() => setIsAdminView(!isAdminView)} className="text-sm font-semibold px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-light-border dark:hover:bg-dark-border transition-all hover:scale-105 active:scale-95">
                                                {isAdminView ? 'App View' : 'Admin Panel'}
                                            </button>
                                        )}
                                        <div className="flex items-center gap-1.5 text-sm font-semibold bg-light-bg-secondary dark:bg-dark-bg-secondary px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border select-none">
                                            <SparklesIcon className="w-4 h-4 text-yellow-500" />
                                            <span>{user.credits} Credits</span>
                                        </div>
                                        {!user.isAdmin && featureFlags.isDailyRewardEnabled && (
                                            <button onClick={onRewardClick} aria-label="Claim reward" className="relative w-9 h-9 flex items-center justify-center rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-all hover:scale-110 active:scale-95">
                                                <GiftIcon className="w-5 h-5" />
                                                {hasRewardAvailable && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-light-bg dark:ring-dark-bg" />}
                                            </button>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <UserCircleIcon className="w-6 h-6" />
                                            <span className="hidden sm:inline font-medium">{user.fullName.split(' ')[0]}</span>
                                        </div>
                                        <button onClick={onLogout} aria-label="Logout" className="w-9 h-9 flex items-center justify-center rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-all hover:scale-110 active:scale-95">
                                            <LogoutIcon className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={onLoginClick} className="text-sm font-medium hover:text-light-text dark:hover:text-dark-text transition-transform hover:scale-105">Log In</button>
                                        <button onClick={onSignupClick} className="px-4 py-2 text-sm font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 transition-all hover:scale-105 active:scale-95">Sign Up</button>
                                    </>
                                )}
                                <button
                                    onClick={toggleTheme}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-all hover:scale-110 active:scale-95"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {ad?.isEnabled && (
                <div className="w-full bg-light-bg dark:bg-dark-bg flex justify-center items-center py-1 border-b border-light-border dark:border-dark-border">
                   <AdContent ad={ad} />
                </div>
            )}
        </>
    );
};

export default Header;
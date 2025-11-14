

import React from 'react';
import { APP_NAME } from '../constants';
import { SocialIcon } from './SocialIcon';
import type { SocialMediaSettings, AdPlacement } from '../types';

interface FooterProps {
    socialMediaSettings: SocialMediaSettings;
    ad?: AdPlacement;
}

const Footer: React.FC<FooterProps> = ({ socialMediaSettings, ad }) => {
    const currentYear = new Date().getFullYear();

    const AdContent: React.FC<{ ad: AdPlacement }> = ({ ad }) => {
        if (ad.type === 'google' && ad.content.script) {
            return <div dangerouslySetInnerHTML={{ __html: ad.content.script }} />;
        }
        if (ad.type === 'custom' && ad.content.imageUrl) {
            const img = <img src={ad.content.imageUrl} alt={ad.name} className="max-h-24 mx-auto" />;
            if (ad.content.linkUrl) {
                return <a href={ad.content.linkUrl} target="_blank" rel="sponsored noopener noreferrer">{img}</a>;
            }
            return img;
        }
        return null;
    };
    
    return (
        <footer className="border-t border-light-border dark:border-dark-border">
            {ad?.isEnabled && (
                 <div className="w-full bg-light-bg dark:bg-dark-bg flex justify-center items-center py-4 border-b border-light-border dark:border-dark-border">
                   <AdContent ad={ad} />
                </div>
            )}
            <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    &copy; {currentYear} {APP_NAME}. All Rights Reserved.
                </p>
                {socialMediaSettings.isEnabled && socialMediaSettings.links.length > 0 && (
                    <div className="flex items-center gap-4">
                        {socialMediaSettings.links.map((link) => (
                           <a 
                                key={link.id} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={link.platform} 
                                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-all hover:scale-110"
                            >
                                <SocialIcon platform={link.platform} className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </footer>
    );
};

export default Footer;
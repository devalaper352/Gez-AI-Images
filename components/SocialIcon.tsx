
import React from 'react';
import { TwitterIcon } from './icons/TwitterIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { GithubIcon } from './icons/GithubIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { LinkIcon } from './icons/LinkIcon';

interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
    platform: string;
}

export const SocialIcon: React.FC<SocialIconProps> = ({ platform, ...props }) => {
    switch (platform.toLowerCase()) {
        case 'twitter':
            return <TwitterIcon {...props} />;
        case 'instagram':
            return <InstagramIcon {...props} />;
        case 'github':
            return <GithubIcon {...props} />;
        case 'facebook':
            return <FacebookIcon {...props} />;
        case 'linkedin':
            return <LinkedInIcon {...props} />;
        default:
            return <LinkIcon {...props} />;
    }
};

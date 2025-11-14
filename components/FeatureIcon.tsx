

import React from 'react';
import { ZapIcon } from './icons/ZapIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { GiftIcon } from './icons/GiftIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { VideoIcon } from './icons/VideoIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface FeatureIconProps extends React.SVGProps<SVGSVGElement> {
    icon: string;
}

const iconMap: { [key: string]: React.FC<any> } = {
    ZapIcon,
    ShieldCheckIcon,
    GiftIcon,
    MagicWandIcon,
    VideoIcon,
    ChatBubbleIcon,
    MegaphoneIcon,
};

export const FeatureIcon: React.FC<FeatureIconProps> = ({ icon, ...props }) => {
    const IconComponent = iconMap[icon];
    if (!IconComponent) {
        // Return a default icon or null if the icon name is not found
        return <ZapIcon {...props} />;
    }
    return <IconComponent {...props} />;
};
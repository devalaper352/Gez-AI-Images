
import React, { useState, useEffect } from 'react';
import { FeatureIcon } from './FeatureIcon';
import * as authService from '../services/authService';
import type { FeatureFlags, FeatureItem } from '../types';

interface FeaturesProps {
    featureFlags: FeatureFlags;
}

const Features: React.FC<FeaturesProps> = ({ featureFlags }) => {
    const [features, setFeatures] = useState<FeatureItem[]>([]);

    useEffect(() => {
        // Fetch dynamic features from the service
        setFeatures(authService.getFeatureItems());
    }, []);

    const enabledFeatures = features.filter(feature => {
        // A feature is enabled if it has no flag OR its flag is true
        return !feature.flagName || featureFlags[feature.flagName];
    });

    return (
        <div className="py-12">
            <div className="max-w-xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Choose Gez AI Images?</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    We offer a streamlined, powerful, and privacy-focused creative experience.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {enabledFeatures.map((feature) => (
                    <div key={feature.id} className="flex gap-6 p-6 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-light-border dark:bg-dark-border">
                           <FeatureIcon icon={feature.icon} className="w-6 h-6 text-light-text dark:text-dark-text"/>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;

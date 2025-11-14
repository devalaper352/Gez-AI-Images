
import React, { useState, useEffect } from 'react';
import * as authService from '../services/authService';
import type { HowItWorksStep, FeatureFlags } from '../types';

interface HowItWorksProps {
    featureFlags: FeatureFlags;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ featureFlags }) => {
    const [steps, setSteps] = useState<HowItWorksStep[]>([]);
    
    useEffect(() => {
        setSteps(authService.getHowItWorksSteps());
    }, []);

    // The filtering logic is removed from here.
    // The admin is now responsible for managing which steps appear.
    // This makes the component simpler and gives full control to the admin.

    return (
        <div className="py-12">
            <div className="max-w-xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    Simple steps to bring your ideas to life.
                </p>
            </div>
            <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-light-border dark:bg-dark-border hidden md:block"></div>
                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col md:flex-row items-center gap-8">
                            <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                <h3 className="text-2xl font-bold">{step.title}</h3>
                                <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">{step.description}</p>
                            </div>
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg font-bold text-xl shadow-lg border-4 border-light-bg dark:border-dark-bg">
                                    {index + 1}
                                </div>
                            </div>
                            <div className={`flex-1 hidden md:block ${index % 2 === 0 ? 'order-first' : ''}`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;


import React, { useState, useEffect } from 'react';
import * as authService from '../services/authService';
import type { UpdatePost } from '../types';
import { BellIcon } from './icons/BellIcon';

const Updates: React.FC = () => {
    const [updates, setUpdates] = useState<UpdatePost[]>([]);

    useEffect(() => {
        setUpdates(authService.getUpdates());
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="py-16">
            <div className="max-w-xl mx-auto text-center mb-12">
                 <div className="inline-block p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full mb-4 border border-light-border dark:border-dark-border">
                    <BellIcon className="w-8 h-8 text-purple-500" />
                 </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Latest Updates</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    Stay up-to-date with the latest features and improvements.
                </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-8">
                {updates.length > 0 ? (
                    updates.map(update => (
                        <div key={update.id} className="p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold">{update.title}</h3>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-light-border dark:bg-dark-border">{update.version}</span>
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">{formatDate(update.timestamp)}</span>
                                </div>
                            </div>
                            <div className="text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap text-sm leading-relaxed">
                                {update.content}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg">
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">No updates have been posted yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Updates;

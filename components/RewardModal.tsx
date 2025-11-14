
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { GiftIcon } from './icons/GiftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckIcon } from './icons/CheckIcon';
import type { RewardSettings } from '../types';

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClaim: () => number;
    rewardStatus: {
        availableReward: number;
        dayOfCycle: number;
        nextClaimAvailableAt: string | null;
    };
    rewardSettings: RewardSettings;
}

const formatTimeLeft = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, onClaim, rewardStatus, rewardSettings }) => {
    
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [claimStatus, setClaimStatus] = useState<'idle' | 'success'>('idle');
    const [claimedAmount, setClaimedAmount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setClaimStatus('idle');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        let intervalId: number | undefined;

        if (rewardStatus.nextClaimAvailableAt) {
            const updateTimer = () => {
                const now = new Date().getTime();
                const nextClaimTime = new Date(rewardStatus.nextClaimAvailableAt!).getTime();
                const remaining = nextClaimTime - now;
                
                if (remaining > 0) {
                    setTimeLeft(remaining);
                } else {
                    setTimeLeft(0);
                    clearInterval(intervalId);
                }
            };
            
            updateTimer();
            intervalId = window.setInterval(updateTimer, 1000);
        } else {
             setTimeLeft(null);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };

    }, [isOpen, rewardStatus.nextClaimAvailableAt]);

    const handleClaimClick = () => {
        const amount = onClaim();
        if (amount > 0) {
            setClaimedAmount(amount);
            setClaimStatus('success');
        }
    };

    if (claimStatus === 'success') {
         return (
            <Modal isOpen={isOpen} onClose={onClose} title="Success!">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                         <CheckIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Reward Collected!</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
                        Your account has been credited with <span className="font-bold text-light-text dark:text-dark-text">{claimedAmount}</span> credits.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-2.5 font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700"
                    >
                        Awesome!
                    </button>
                </div>
            </Modal>
        );
    }

    const cycleDays = Array.from({ length: rewardSettings.cycleDays }, (_, i) => i + 1);

    const getRewardForDay = (day: number) => {
        return rewardSettings.rewards[day] || 0;
    }

    const isClaimButtonDisabled = rewardStatus.availableReward === 0 || !!rewardStatus.nextClaimAvailableAt;

    const getButtonText = () => {
        if (rewardStatus.nextClaimAvailableAt && timeLeft && timeLeft > 0) {
            return `Next reward in ${formatTimeLeft(timeLeft)}`;
        }
        if (rewardStatus.availableReward > 0) {
            return `Collect ${rewardStatus.availableReward} Credits`;
        }
        return 'Come Back Tomorrow';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🎉 Daily Reward Available!">
            <div className="text-center">
                 <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                   Welcome back! You can collect your daily reward and earn free credits every day. Click "Collect Reward" to instantly add today's reward credits to your balance.
                </p>

                <div className="grid grid-cols-7 gap-2 mb-6">
                    {cycleDays.map(day => {
                        const reward = getRewardForDay(day);
                        const isCurrentDay = day === rewardStatus.dayOfCycle && !rewardStatus.nextClaimAvailableAt;
                        const isPastDay = day < rewardStatus.dayOfCycle || (day === rewardStatus.dayOfCycle && !!rewardStatus.nextClaimAvailableAt);
                        return (
                            <div key={day} className={`p-2 rounded-lg border-2 text-center transition-all ${
                                isCurrentDay ? 'border-purple-500 bg-purple-500/10' : 
                                isPastDay ? 'border-transparent bg-light-bg dark:bg-dark-bg opacity-60' :
                                'border-transparent bg-light-bg dark:bg-dark-bg'
                            }`}>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Day {day}</p>
                                {reward > 0 ? (
                                    <div className="font-bold text-yellow-500 flex items-center justify-center gap-1">
                                        <SparklesIcon className="w-3 h-3"/>
                                        <span>{reward}</span>
                                    </div>
                                ) : (
                                    <div className="font-bold">-</div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <button
                    onClick={handleClaimClick}
                    disabled={isClaimButtonDisabled}
                    className="w-full py-2.5 font-semibold rounded-full bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                   {getButtonText()}
                </button>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-4">
                    You can collect a reward once every 24 hours. Missing a day will reset your progress.
                </p>
            </div>
        </Modal>
    );
};

export default RewardModal;
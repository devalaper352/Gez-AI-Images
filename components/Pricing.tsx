import React from 'react';
import type { CreditPlan } from '../types';

interface PricingProps {
    plans: CreditPlan[];
    onPurchase: (plan: CreditPlan) => void;
}

const Pricing: React.FC<PricingProps> = ({ plans, onPurchase }) => {
    const popularIndex = plans.length > 1 ? 1 : 0;
    
    return (
        <div className="py-12" id="pricing">
            <div className="max-w-xl mx-auto text-center mb-12">
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Purchase Credits</h2>
                <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                    Ran out of free credits? Top up your account to continue creating instantly.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan, index) => (
                    <div key={plan.id} className={`relative flex flex-col p-8 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                        index === popularIndex
                        ? 'border-purple-500 dark:border-purple-400' 
                        : 'border-light-border dark:border-dark-border hover:border-light-primary/50 dark:hover:border-dark-primary/50'
                    }`}>
                        {index === popularIndex && (
                            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-purple-800 bg-purple-200 dark:text-purple-100 dark:bg-purple-600 rounded-full">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-2xl font-semibold">{plan.credits} Credits</h3>
                        <div className="my-6">
                            <p className="text-4xl font-bold">
                                ₹{plan.price}
                            </p>
                        </div>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
                            One-time purchase
                        </p>
                        <button
                            onClick={() => onPurchase(plan)}
                            className={`mt-auto block w-full px-6 py-3 text-base font-semibold rounded-full hover:opacity-90 transition-all hover:scale-105 active:scale-95 ${
                                index === popularIndex
                                ? 'bg-purple-600 text-white dark:bg-purple-500'
                                : 'bg-light-primary text-light-bg dark:bg-dark-primary dark:text-dark-bg'
                            }`}
                        >
                            Buy Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
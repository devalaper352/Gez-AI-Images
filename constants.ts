import type { RewardSettings } from './types';

export const APP_NAME = "Gez AI Images";
export const INITIAL_CREDITS = 25;
export const CREDIT_COST_PER_IMAGE = 5;
export const CREDIT_COST_PER_CHAT_MESSAGE = 1;
export const CREDIT_COST_PER_VIDEO_GENERATION = 25;

export const CONTACT_EMAIL = "genz@gmail.com";

// Default Reward Constants for initial setup
export const DEFAULT_REWARD_CYCLE_DAYS = 7;

export const DEFAULT_REWARD_SETTINGS: RewardSettings = {
    cycleDays: DEFAULT_REWARD_CYCLE_DAYS,
    rewards: {
        1: 5,
        2: 5,
        3: 5,
        4: 5,
        5: 5,
        6: 10,
        7: 15,
    }
};

import type { User, CreditPlan, RewardSettings, FeatureFlags, SocialMediaSettings, PaymentSettings, PromoCode, PaymentRequest, ContactMessage, ChatMessage, GenerationHistoryItem, ActivityLogItem, SocialMediaLink, UpdatePost, VideoGenerationHistoryItem, HowItWorksStep, FeatureItem } from '../types';
import { INITIAL_CREDITS, DEFAULT_REWARD_SETTINGS } from '../constants';

// --- Simple ID Generator ---
export const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// --- Mock "bcrypt" ---
const mockHash = (password: string) => `hashed_${password}`;
const mockCompare = (password: string, hash: string) => hash === `hashed_${password}`;

// --- Database Structure and Helpers ---
interface AppDatabase {
    users: User[];
    promoCodes: PromoCode[];
    creditPlans: CreditPlan[];
    rewardSettings: RewardSettings;
    featureFlags: FeatureFlags;
    socialMediaSettings: SocialMediaSettings;
    paymentSettings: PaymentSettings;
    paymentRequests: PaymentRequest[];
    contactMessages: ContactMessage[];
    activityLog: ActivityLogItem[];
    updates: UpdatePost[];
    howItWorksSteps: HowItWorksStep[];
    featureItems: FeatureItem[];
}

const DB_KEY = 'gez-ai-images-db';

const getDb = (): AppDatabase => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            const parsedDb = JSON.parse(dbString);
            let dbChanged = false;

            // Migration script for users who don't have videoHistory
            if (parsedDb.users && parsedDb.users.some((u: User) => !u.videoHistory)) {
                parsedDb.users.forEach((u: User) => {
                    if (!u.videoHistory) u.videoHistory = [];
                });
                dbChanged = true;
            }
            if (!parsedDb.howItWorksSteps) {
                parsedDb.howItWorksSteps = getInitialHowItWorks();
                dbChanged = true;
            }
            if (!parsedDb.featureItems) {
                parsedDb.featureItems = getInitialFeatures();
                dbChanged = true;
            }

            if(dbChanged) saveDb(parsedDb);
            
            return parsedDb;
        }
    } catch (error) {
        console.error("Failed to parse DB from localStorage", error);
    }
    return initializeDb();
};

const saveDb = (db: AppDatabase) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const getInitialHowItWorks = (): HowItWorksStep[] => [
    { id: generateId('hiw'), title: 'Sign Up & Get Credits', description: 'Create an account in seconds and instantly receive 25 free credits to start your creative journey.', order: 1 },
    { id: generateId('hiw'), title: 'Enter Your Prompt', description: 'Describe the image or video you want to create. Be as simple or detailed as you like.', order: 2 },
    { id: generateId('hiw'), title: 'Generate & Download', description: 'Our AI generates your creation based on your prompt. Preview them and download your favorites instantly.', order: 3 },
    { id: generateId('hiw'), title: 'Enhance or Upload & Transform', description: 'Refine a generated image, or upload your own photo to the Image Studio to apply new styles with a prompt.', order: 4 },
];

const getInitialFeatures = (): FeatureItem[] => [
    { id: generateId('feat'), icon: 'ZapIcon', title: 'Fast Generation', description: 'Get high-quality images in seconds. Our powerful AI is optimized for speed and performance.', order: 1 },
    { id: generateId('feat'), icon: 'ShieldCheckIcon', title: 'Secure & Private', description: 'Your privacy is our priority. We don\'t store your generated images on our servers.', order: 2 },
    { id: generateId('feat'), icon: 'GiftIcon', title: 'Free Onboarding Credits', description: 'Start creating right away with 25 free credits when you sign up. No commitment required.', order: 3 },
    { id: generateId('feat'), icon: 'MagicWandIcon', title: 'Advanced Image Studio', description: 'Go beyond text prompts. Upload your own photos and transform them with AI-powered styles and edits.', order: 4, flagName: 'isImageStudioEnabled' },
    { id: generateId('feat'), icon: 'VideoIcon', title: 'AI Video Generation', description: 'Bring your ideas to life with AI-powered video. Generate stunning short clips from text or an image.', order: 5, flagName: 'isVideoGeneratorEnabled' },
    { id: generateId('feat'), icon: 'ChatBubbleIcon', title: 'Intelligent Chat', description: 'Ask questions, get up-to-date information with Google Search, or solve complex problems with our AI assistant.', order: 6, flagName: 'isChatBotEnabled' },
];

const initializeDb = (): AppDatabase => {
    const adminUser: User = {
        id: 'user_admin_01',
        fullName: 'Admin User',
        email: 'startgenz123@gmail.com',
        passwordHash: mockHash('new@genz@start123'),
        credits: 100000000000000000000000000000000,
        isAdmin: true,
        history: [],
        videoHistory: [],
        chatHistory: [],
        paymentHistory: [],
        lastLogin: new Date().toISOString(),
        lastRewardClaim: null,
        rewardCycleDay: 1,
    };

    const initialDb: AppDatabase = {
        users: [adminUser],
        promoCodes: [
            { id: 'promo_1', code: 'SAVE10', discountPercentage: 10, isActive: true },
            { id: 'promo_2', code: 'EXPIRED', discountPercentage: 20, isActive: false },
        ],
        creditPlans: [
            { id: 'plan_1', credits: 50, price: 199, currency: "INR" },
            { id: 'plan_2', credits: 100, price: 299, currency: "INR" },
            { id: 'plan_3', credits: 200, price: 499, currency: "INR" },
        ],
        rewardSettings: DEFAULT_REWARD_SETTINGS,
        featureFlags: {
            isImageStudioEnabled: true,
            isVideoGeneratorEnabled: true, 
            isDailyRewardEnabled: true,
            isChatBotEnabled: true,
            isPurchaseSystemEnabled: true,
        },
        socialMediaSettings: {
            isEnabled: true,
            links: [
                { id: 'sm_1', platform: 'twitter', url: 'https://x.com' },
                { id: 'sm_2', platform: 'instagram', url: 'https://instagram.com' },
                { id: 'sm_3', platform: 'github', url: 'https://github.com' },
            ],
        },
        paymentSettings: {
            easypaisaAccountNumber: '0300-1234567',
            jazzcashAccountNumber: '0301-7654321',
        },
        paymentRequests: [],
        contactMessages: [],
        activityLog: [],
        updates: [
            {
                id: generateId('update'),
                title: 'Welcome to Gez AI!',
                content: 'We are excited to launch our new AI image generation platform. Explore the features and start creating today!\n\n- Generate images from text\n- Free initial credits\n- Secure and private',
                version: 'v1.0.0',
                timestamp: new Date().toISOString(),
                status: 'published',
            }
        ],
        howItWorksSteps: getInitialHowItWorks(),
        featureItems: getInitialFeatures(),
    };
    saveDb(initialDb);
    return initialDb;
};

// Initialize DB on load if it doesn't exist
if (!localStorage.getItem(DB_KEY)) {
    initializeDb();
} else {
    // Also run migration on load
    getDb();
}


// --- Exported Functions ---

export const logActivity = (userId: string, type: ActivityLogItem['type'], details: string) => {
    const db = getDb();
    const newLog: ActivityLogItem = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        userId,
        type,
        details,
    };
    db.activityLog.unshift(newLog);
    if (db.activityLog.length > 500) { // Keep log from growing indefinitely
        db.activityLog.pop();
    }
    saveDb(db);
}

export const login = (email: string, password: string): User => {
    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !mockCompare(password, user.passwordHash)) {
        throw new Error("Invalid email or password.");
    }
    user.lastLogin = new Date().toISOString();
    saveDb(db);
    logActivity(user.id, 'login', 'User logged in successfully.');
    return user;
};

export const signup = (fullName: string, email: string, password: string): User => {
    const db = getDb();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("An account with this email already exists.");
    }
    const newUser: User = {
        id: generateId('user'),
        fullName,
        email,
        passwordHash: mockHash(password),
        credits: INITIAL_CREDITS,
        isAdmin: false,
        history: [],
        videoHistory: [],
        chatHistory: [],
        paymentHistory: [],
        lastLogin: new Date().toISOString(),
        lastRewardClaim: null,
        rewardCycleDay: 1,
    };
    db.users.push(newUser);
    saveDb(db);
    logActivity(newUser.id, 'signup', 'User created a new account.');
    return newUser;
};

export const getUserById = (userId: string): User | undefined => {
    const db = getDb();
    return db.users.find(u => u.id === userId);
};

export const updateUser = (updatedUser: User): void => {
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        db.users[userIndex] = updatedUser;
        saveDb(db);
    } else {
        throw new Error("User not found for update.");
    }
};

export const deductCredits = (userId: string, amount: number): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    if (user.credits < amount) throw new Error("Insufficient credits.");
    user.credits -= amount;
    saveDb(db);
    return user;
};

// --- Settings Getters ---
export const getRewardSettings = (): RewardSettings => getDb().rewardSettings;
export const getFeatureFlags = (): FeatureFlags => getDb().featureFlags;
export const getSocialMediaSettings = (): SocialMediaSettings => getDb().socialMediaSettings;
export const getPaymentSettings = (): PaymentSettings => getDb().paymentSettings;
export const getCreditPlans = (): CreditPlan[] => getDb().creditPlans;


// --- History Management ---

export const addImageToHistory = (userId: string, prompt: string, images: {id: string, base64: string}[], aspectRatio: '1:1' | '16:9'): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    const historyItem: GenerationHistoryItem = {
        id: generateId('hist'),
        prompt,
        images,
        timestamp: new Date().toISOString(),
        aspectRatio,
        numImages: images.length,
    };
    user.history.unshift(historyItem);
    saveDb(db);
    return user;
};

export const deleteImageFromHistory = (userId: string, historyId: string): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    user.history = user.history.filter(item => item.id !== historyId);
    saveDb(db);
    return user;
};

export const addVideoToHistory = (userId: string, prompt: string, operationId: string): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");

    const historyItem: VideoGenerationHistoryItem = {
        id: generateId('vidhist'),
        prompt,
        operationId,
        timestamp: new Date().toISOString(),
        status: 'pending',
    };
    user.videoHistory.unshift(historyItem);
    saveDb(db);
    return user;
};

export const updateVideoInHistory = (userId: string, operationId: string, status: 'completed' | 'failed', data: { videoUrl?: string; failureReason?: string }): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    
    const itemIndex = user.videoHistory.findIndex(item => item.operationId === operationId);
    if (itemIndex > -1) {
        user.videoHistory[itemIndex].status = status;
        if (data.videoUrl) user.videoHistory[itemIndex].videoUrl = data.videoUrl;
        if (data.failureReason) user.videoHistory[itemIndex].failureReason = data.failureReason;
    }
    
    saveDb(db);
    return user;
};

export const deleteVideoFromHistory = (userId: string, historyId: string): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    user.videoHistory = user.videoHistory.filter(item => item.id !== historyId);
    saveDb(db);
    return user;
};

export const saveChatSession = (userId: string, messages: ChatMessage[]): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user || messages.length <= 1) return user!; // Don't save empty or intro-only chats
    
    if (user.chatHistory.length > 0) {
        // Update the existing session to be persistent
        user.chatHistory[0].messages = messages;
        user.chatHistory[0].timestamp = new Date().toISOString();
    } else {
        // Create a new session if none exists
        const session = {
            id: generateId('chat'),
            title: 'AI Assistant Conversation',
            timestamp: new Date().toISOString(),
            messages,
        };
        user.chatHistory.unshift(session);
    }
    
    saveDb(db);
    return user;
}

export const deleteChatSession = (userId: string, sessionId: string): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    user.chatHistory = user.chatHistory.filter(s => s.id !== sessionId);
    saveDb(db);
    return user;
};

// --- Reward Logic ---

export const getRewardStatus = (user: User) => {
    const settings = getRewardSettings();
    let { rewardCycleDay, lastRewardClaim } = user;
    const now = new Date();
    let nextClaimAvailableAt: string | null = null;
    let availableReward = 0;

    if (lastRewardClaim) {
        const lastClaimDate = new Date(lastRewardClaim);
        const diffHours = (now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) {
            lastClaimDate.setDate(lastClaimDate.getDate() + 1);
            nextClaimAvailableAt = lastClaimDate.toISOString();
        } else {
             // If more than 48h passed, reset cycle
            if (diffHours >= 48) {
                rewardCycleDay = 1;
            }
        }
    }

    if (!nextClaimAvailableAt) { // Can claim
        availableReward = settings.rewards[rewardCycleDay] || 0;
    }
    
    return { availableReward, dayOfCycle: rewardCycleDay, nextClaimAvailableAt };
};

export const claimReward = (userId: string): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");

    const status = getRewardStatus(user);
    if (status.availableReward === 0 || status.nextClaimAvailableAt) {
        throw new Error("No reward available to claim right now.");
    }
    
    user.credits += status.availableReward;
    user.lastRewardClaim = new Date().toISOString();
    user.rewardCycleDay += 1;
    if(user.rewardCycleDay > getRewardSettings().cycleDays) {
        user.rewardCycleDay = 1;
    }
    
    saveDb(db);
    logActivity(userId, 'reward_claim', `Claimed ${status.availableReward} credits on day ${status.dayOfCycle}.`);
    return user;
};

// --- Promo Codes & Payments ---

export const validatePromoCode = (code: string): PromoCode | null => {
    const db = getDb();
    const promo = db.promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
    return promo || null;
}

export const createPaymentRequest = (userId: string, plan: CreditPlan, paymentMethod: PaymentRequest['paymentMethod'], userAccountNumber: string, transactionId: string, promoCode?: string): User => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");

    let finalPrice = plan.price;
    if (promoCode) {
        const promo = validatePromoCode(promoCode);
        if (promo) {
            finalPrice = Math.round(plan.price * (1 - promo.discountPercentage / 100));
        }
    }

    const request: PaymentRequest = {
        id: generateId('pay'),
        userId,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        planCredits: plan.credits,
        planPrice: plan.price,
        promoCode,
        finalPrice,
        paymentMethod,
        userAccountNumber,
        transactionId,
        status: 'pending',
    };

    db.paymentRequests.unshift(request);
    user.paymentHistory.unshift(request);
    saveDb(db);
    logActivity(userId, 'purchase_request', `Submitted request for ${plan.credits} credits for ₹${finalPrice}.`);
    return user;
};

// --- Contact ---
export const submitContactMessage = (email: string, message: string) => {
    const db = getDb();
    const contactMessage: ContactMessage = {
        id: generateId('contact'),
        email,
        message,
        timestamp: new Date().toISOString(),
        isArchived: false,
    };
    db.contactMessages.unshift(contactMessage);
    saveDb(db);
};

// --- Admin Panel Functions ---
export const getAllUsers = (): User[] => getDb().users;
export const getAllPaymentRequests = (): PaymentRequest[] => getDb().paymentRequests;
export const getAllContactMessages = (): ContactMessage[] => getDb().contactMessages;
export const getAllActivity = (): ActivityLogItem[] => getDb().activityLog;

export const getDashboardStats = () => {
    const db = getDb();
    const nonAdminUsers = db.users.filter(u => !u.isAdmin);
    
    const totalUsers = nonAdminUsers.length;
    const pendingPaymentsCount = db.paymentRequests.filter(p => p.status === 'pending').length;
    const unreadMessagesCount = db.contactMessages.filter(m => !m.isArchived).length;
    const totalCreditsInCirculation = nonAdminUsers.reduce((sum, user) => sum + user.credits, 0);
    
    const recentActivity = db.activityLog.slice(0, 5);
    const recentPendingPayments = db.paymentRequests.filter(p => p.status === 'pending').slice(0, 5);

    return {
        totalUsers,
        pendingPaymentsCount,
        unreadMessagesCount,
        totalCreditsInCirculation,
        recentActivity,
        recentPendingPayments
    };
};

export const modifyUserCredits = (adminId: string, targetUserId: string, amount: number): User => {
    const db = getDb();
    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) throw new Error("Target user not found.");
    if (targetUser.isAdmin) throw new Error("Cannot modify an admin's credits.");
    if (amount === 0) return targetUser;

    const oldCredits = targetUser.credits;
    const newCreditAmount = oldCredits + amount;

    if (newCreditAmount < 0) {
        throw new Error("Cannot reduce credits below zero.");
    }

    targetUser.credits = newCreditAmount;
    saveDb(db);
    
    const action = amount > 0 ? 'added' : 'removed';
    logActivity(adminId, 'admin_action', `Admin ${action} ${Math.abs(amount)} credits for ${targetUser.email}. Balance changed from ${oldCredits} to ${newCreditAmount}.`);
    return targetUser;
};

export const clearUserChatHistory = (adminId: string, targetUserId: string): void => {
    const db = getDb();
    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) throw new Error("Target user not found.");
    if (targetUser.isAdmin) throw new Error("Cannot modify an admin's chat history.");

    targetUser.chatHistory = [];
    saveDb(db);
    logActivity(adminId, 'admin_action', `Admin cleared chat history for ${targetUser.email}.`);
};

export const updatePaymentRequestStatus = (requestId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    const db = getDb();
    const request = db.paymentRequests.find(r => r.id === requestId);
    if (!request) throw new Error("Payment request not found.");

    if(request.status !== 'pending') throw new Error("Request has already been processed.");
    
    request.status = status;
    if(status === 'rejected') {
        request.rejectionReason = rejectionReason || 'No reason provided.';
    }

    const user = db.users.find(u => u.id === request.userId);
    if(user) {
        const userRequest = user.paymentHistory.find(r => r.id === requestId);
        if (userRequest) {
            userRequest.status = status;
            if(status === 'rejected') userRequest.rejectionReason = request.rejectionReason;
        }

        if(status === 'approved') {
            user.credits += request.planCredits;
        }
    }
    
    saveDb(db);
};

export const updateAdminSettings = (data: {
    rewardSettings?: RewardSettings;
    featureFlags?: FeatureFlags;
    socialMediaSettings?: SocialMediaSettings;
    paymentSettings?: PaymentSettings;
}) => {
    const db = getDb();
    if(data.rewardSettings) db.rewardSettings = data.rewardSettings;
    if(data.featureFlags) db.featureFlags = data.featureFlags;
    if(data.socialMediaSettings) db.socialMediaSettings = data.socialMediaSettings;
    if(data.paymentSettings) db.paymentSettings = data.paymentSettings;
    saveDb(db);
};

export const getAllPromoCodes = (): PromoCode[] => getDb().promoCodes;

export const savePromoCode = (promo: PromoCode) => {
    const db = getDb();
    const index = db.promoCodes.findIndex(p => p.id === promo.id);
    if (index !== -1) {
        // Ensure code is unique if renaming
        if (db.promoCodes.some(p => p.id !== promo.id && p.code.toUpperCase() === promo.code.toUpperCase())) {
            throw new Error("Another promo code with this code already exists.");
        }
        db.promoCodes[index] = promo;
    } else {
         // Ensure code is unique on creation
        if (db.promoCodes.some(p => p.code.toUpperCase() === promo.code.toUpperCase())) {
            throw new Error("A promo code with this code already exists.");
        }
        promo.id = generateId('promo');
        db.promoCodes.push(promo);
    }
    saveDb(db);
};

export const deletePromoCode = (promoId: string) => {
    const db = getDb();
    db.promoCodes = db.promoCodes.filter(p => p.id !== promoId);
    saveDb(db);
};

export const saveCreditPlan = (plan: CreditPlan) => {
    const db = getDb();
    if (plan.id) { // Update
        const index = db.creditPlans.findIndex(p => p.id === plan.id);
        if (index !== -1) {
            db.creditPlans[index] = plan;
        }
    } else { // Create
        plan.id = generateId('plan');
        db.creditPlans.push(plan);
    }
    db.creditPlans.sort((a, b) => a.price - b.price); // Keep plans sorted by price
    saveDb(db);
};

export const deleteCreditPlan = (planId: string) => {
    const db = getDb();
    db.creditPlans = db.creditPlans.filter(p => p.id !== planId);
    saveDb(db);
};

export const archiveContactMessage = (messageId: string): void => {
    const db = getDb();
    const message = db.contactMessages.find(m => m.id === messageId);
    if (message) {
        message.isArchived = !message.isArchived; // Toggle archive status
        saveDb(db);
    }
};

// --- Updates Management ---
export const getUpdates = (): UpdatePost[] => {
    const db = getDb();
    return db.updates
        .filter(u => u.status === 'published')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getAllUpdatesForAdmin = (): UpdatePost[] => {
    const db = getDb();
    return db.updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const saveUpdate = (update: UpdatePost) => {
    const db = getDb();
    if (update.id) { // Update
        const index = db.updates.findIndex(u => u.id === update.id);
        if (index !== -1) {
            db.updates[index] = { ...update, timestamp: new Date().toISOString() };
        }
    } else { // Create
        update.id = generateId('update');
        update.timestamp = new Date().toISOString();
        db.updates.push(update);
    }
    saveDb(db);
};

export const deleteUpdate = (updateId: string) => {
    const db = getDb();
    db.updates = db.updates.filter(u => u.id !== updateId);
    saveDb(db);
};

// --- How It Works Management ---
export const getHowItWorksSteps = (): HowItWorksStep[] => {
    const db = getDb();
    return [...db.howItWorksSteps].sort((a, b) => a.order - b.order);
};

export const saveHowItWorksStep = (step: Partial<HowItWorksStep>) => {
    const db = getDb();
    if (step.id) { // Update
        const index = db.howItWorksSteps.findIndex(s => s.id === step.id);
        if (index !== -1) db.howItWorksSteps[index] = { ...db.howItWorksSteps[index], ...step };
    } else { // Create
        const maxOrder = Math.max(0, ...db.howItWorksSteps.map(s => s.order));
        const newStep: HowItWorksStep = {
            id: generateId('hiw'),
            title: step.title || '',
            description: step.description || '',
            order: maxOrder + 1,
        };
        db.howItWorksSteps.push(newStep);
    }
    saveDb(db);
};

export const deleteHowItWorksStep = (stepId: string) => {
    const db = getDb();
    db.howItWorksSteps = db.howItWorksSteps.filter(s => s.id !== stepId);
    // Re-order remaining steps
    db.howItWorksSteps.sort((a, b) => a.order - b.order).forEach((step, index) => step.order = index + 1);
    saveDb(db);
};

export const reorderHowItWorksSteps = (stepId: string, direction: 'up' | 'down') => {
    const db = getDb();
    const steps = [...db.howItWorksSteps].sort((a, b) => a.order - b.order);
    const index = steps.findIndex(s => s.id === stepId);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
        [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
    } else if (direction === 'down' && index < steps.length - 1) {
        [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
    }
    db.howItWorksSteps = steps.map((step, idx) => ({ ...step, order: idx + 1 }));
    saveDb(db);
};

// --- Features Management ---
export const getFeatureItems = (): FeatureItem[] => {
    const db = getDb();
    return [...db.featureItems].sort((a, b) => a.order - b.order);
};

export const saveFeatureItem = (item: Partial<FeatureItem>) => {
    const db = getDb();
    if (item.id) { // Update
        const index = db.featureItems.findIndex(i => i.id === item.id);
        if (index !== -1) db.featureItems[index] = { ...db.featureItems[index], ...item };
    } else { // Create
        const maxOrder = Math.max(0, ...db.featureItems.map(i => i.order));
        const newItem: FeatureItem = {
            id: generateId('feat'),
            icon: item.icon || 'ZapIcon',
            title: item.title || '',
            description: item.description || '',
            order: maxOrder + 1,
            flagName: item.flagName || undefined,
        };
        db.featureItems.push(newItem);
    }
    saveDb(db);
};

export const deleteFeatureItem = (itemId: string) => {
    const db = getDb();
    db.featureItems = db.featureItems.filter(i => i.id !== itemId);
    db.featureItems.sort((a, b) => a.order - b.order).forEach((item, index) => item.order = index + 1);
    saveDb(db);
};

export const reorderFeatureItems = (itemId: string, direction: 'up' | 'down') => {
    const db = getDb();
    const items = [...db.featureItems].sort((a, b) => a.order - b.order);
    const index = items.findIndex(i => i.id === itemId);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
    } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }
    db.featureItems = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    saveDb(db);
};

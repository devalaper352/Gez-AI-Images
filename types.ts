

export interface User {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    credits: number;
    isAdmin: boolean;
    history: GenerationHistoryItem[];
    videoHistory: VideoGenerationHistoryItem[];
    chatHistory: ChatSession[];
    paymentHistory: PaymentRequest[];
    lastLogin: string;
    lastRewardClaim: string | null;
    rewardCycleDay: number;
}

export interface GeneratedImage {
    id: string;
    base64: string;
    prompt: string;
    isEnhancing?: boolean;
}

export interface GenerationHistoryItem {
    id: string;
    prompt: string;
    images: { id: string; base64: string }[];
    timestamp: string;
    aspectRatio: '1:1' | '16:9';
    numImages: number;
}

export interface VideoGenerationHistoryItem {
    id: string;
    prompt: string;
    timestamp: string;
    status: 'pending' | 'completed' | 'failed';
    operationId: string; // From the video generation API
    videoUrl?: string;
    failureReason?: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    sources?: { title: string; uri: string }[];
}

export interface ChatSession {
    id: string;
    title: string;
    timestamp: string;
    messages: ChatMessage[];
}

export interface CreditPlan {
    id: string;
    credits: number;
    price: number;
    currency: string;
}

export interface PromoCode {
    id: string;
    code: string;
    discountPercentage: number;
    isActive: boolean;
}

export interface RewardSettings {
    cycleDays: number;
    rewards: {
        [day: number]: number;
    };
}

export interface FeatureFlags {
    isImageStudioEnabled: boolean;
    isVideoGeneratorEnabled: boolean;
    isDailyRewardEnabled: boolean;
    isChatBotEnabled: boolean;
    isPurchaseSystemEnabled: boolean;
    isAdsSystemEnabled: boolean;
}

export interface SocialMediaLink {
    id: string;
    platform: 'twitter' | 'instagram' | 'github' | 'facebook' | 'linkedin' | 'website';
    url: string;
}

export interface SocialMediaSettings {
    isEnabled: boolean;
    links: SocialMediaLink[];
}

export interface PaymentSettings {
    easypaisaAccountNumber: string;
    jazzcashAccountNumber: string;
}

export interface PaymentRequest {
    id: string;
    userId: string;
    userEmail: string;
    timestamp: string;
    planCredits: number;
    planPrice: number;
    promoCode?: string;
    finalPrice: number;
    paymentMethod: 'Easypaisa' | 'Jazzcash' | 'UPI';
    userAccountNumber: string;
    transactionId: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export interface ContactMessage {
    id: string;
    email: string;
    message: string;
    timestamp: string;
    isArchived: boolean;
}

export interface ActivityLogItem {
    id: string;
    timestamp: string;
    userId: string;
    type: 'login' | 'signup' | 'generate' | 'enhance' | 'edit' | 'video_generate' | 'chatbot_message' | 'reward_claim' | 'purchase_request' | 'admin_action';
    details: string;
}

export interface UpdatePost {
    id: string;
    title: string;
    content: string;
    version: string;
    timestamp: string;
    status: 'published' | 'draft';
}

export interface HowItWorksStep {
    id: string;
    title: string;
    description: string;
    order: number;
}

export interface FeatureItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    order: number;
    flagName?: keyof FeatureFlags;
}

export interface AdPlacement {
    id: string;
    name: string;
    position: 'header' | 'footer' | 'leftSidebar' | 'rightSidebar' | 'homepageBanner';
    type: 'google' | 'custom';
    content: {
        script?: string; // for google
        imageUrl?: string; // for custom (base64)
        linkUrl?: string; // for custom
    };
    isEnabled: boolean;
}
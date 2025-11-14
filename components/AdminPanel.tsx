
import React, { useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { generateId } from '../services/authService';
import type { User, PaymentRequest, RewardSettings, FeatureFlags, SocialMediaSettings, PaymentSettings, PromoCode, ContactMessage, ActivityLogItem, SocialMediaLink, CreditPlan, UpdatePost, HowItWorksStep, FeatureItem } from '../types';

import EditUserModal from './EditUserModal';

import { HomeIcon } from './icons/HomeIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { CogIcon } from './icons/CogIcon';
import { TagIcon } from './icons/TagIcon';
import { MailIcon } from './icons/MailIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { WalletIcon } from './icons/WalletIcon';
import { ShareIcon } from './icons/ShareIcon';
import { GiftIcon } from './icons/GiftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { BellIcon } from './icons/BellIcon';
import { ListIcon } from './icons/ListIcon';
import { ListOrderedIcon } from './icons/ListOrderedIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface AdminPanelProps {
    currentUser: User;
}

type AdminTab = 'dashboard' | 'users' | 'payments' | 'promos' | 'plans' | 'messages' | 'activity' | 'settings' | 'updates' | 'features' | 'how-it-works';

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleModifyCredits = (userId: string, amount: number) => {
        try {
            authService.modifyUserCredits(currentUser.id, userId, amount);
            setEditingUser(null);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            alert((error as Error).message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Welcome, {currentUser.fullName}.</p>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4 lg:w-1/5">
                    <nav className="flex flex-col gap-2">
                        <TabButton icon={HomeIcon} label="Dashboard" tabName="dashboard" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={UsersIcon} label="Users" tabName="users" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={CreditCardIcon} label="Payment Requests" tabName="payments" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={WalletIcon} label="Credit Plans" tabName="plans" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={TagIcon} label="Promo Codes" tabName="promos" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={BellIcon} label="Updates" tabName="updates" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={ListIcon} label="Features" tabName="features" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={ListOrderedIcon} label="How It Works" tabName="how-it-works" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={MailIcon} label="Contact Messages" tabName="messages" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={ActivityIcon} label="Activity Log" tabName="activity" activeTab={activeTab} onClick={setActiveTab} />
                        <TabButton icon={CogIcon} label="App Settings" tabName="settings" activeTab={activeTab} onClick={setActiveTab} />
                    </nav>
                </aside>
                <main className="flex-1 min-w-0">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'users' && <UsersTab currentUser={currentUser} onEditUser={setEditingUser} refreshKey={refreshKey} />}
                    {activeTab === 'payments' && <PaymentsTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                    {activeTab === 'promos' && <PromosTab />}
                    {activeTab === 'plans' && <CreditPlansTab />}
                    {activeTab === 'updates' && <UpdatesTab />}
                    {activeTab === 'features' && <FeaturesTab />}
                    {activeTab === 'how-it-works' && <HowItWorksTab />}
                    {activeTab === 'messages' && <MessagesTab />}
                    {activeTab === 'activity' && <ActivityTab />}
                </main>
            </div>
             <EditUserModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onModify={handleModifyCredits}
            />
        </div>
    );
};

const TabButton: React.FC<{icon: React.FC<any>, label: string, tabName: AdminTab, activeTab: AdminTab, onClick: (tab: AdminTab) => void}> = ({ icon: Icon, label, tabName, activeTab, onClick }) => {
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => onClick(tabName)}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                isActive ? 'bg-purple-600 text-white' : 'hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
};

const AdminSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-lg border border-light-border dark:border-dark-border">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
    </div>
);

const StatCard: React.FC<{title: string, value: string | number, icon: React.FC<any>}> = ({ title, value, icon: Icon }) => (
    <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg border border-light-border dark:border-dark-border flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary text-purple-500 flex-shrink-0">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const DashboardTab = () => {
    const [stats, setStats] = useState<ReturnType<typeof authService.getDashboardStats> | null>(null);

    useEffect(() => {
        setStats(authService.getDashboardStats());
    }, []);

    if (!stats) {
        return <AdminSection title="Dashboard">Loading...</AdminSection>;
    }
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={UsersIcon} />
                <StatCard title="Pending Payments" value={stats.pendingPaymentsCount} icon={CreditCardIcon} />
                <StatCard title="Unread Messages" value={stats.unreadMessagesCount} icon={MailIcon} />
                <StatCard title="Credits in Circulation" value={stats.totalCreditsInCirculation.toLocaleString()} icon={WalletIcon} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminSection title="Recent Pending Payments">
                    <div className="space-y-2">
                        {stats.recentPendingPayments.length > 0 ? stats.recentPendingPayments.map(p => (
                            <div key={p.id} className="text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                                <p className="font-semibold truncate">{p.userEmail}</p>
                                <p>₹{p.finalPrice} for {p.planCredits} credits</p>
                            </div>
                        )) : <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No pending payments.</p>}
                    </div>
                </AdminSection>
                <AdminSection title="Recent Activity">
                    <div className="space-y-2">
                         {stats.recentActivity.length > 0 ? stats.recentActivity.map(a => (
                            <div key={a.id} className="text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                                <p className="font-semibold capitalize">{a.type.replace('_', ' ')}</p>
                                <p className="truncate text-light-text-secondary dark:text-dark-text-secondary">{a.details}</p>
                            </div>
                        )) : <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No recent activity.</p>}
                    </div>
                </AdminSection>
            </div>
        </div>
    );
};


const UsersTab: React.FC<{ currentUser: User, onEditUser: (user: User) => void, refreshKey: number }> = ({ currentUser, onEditUser, refreshKey }) => {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => {
        setUsers(authService.getAllUsers());
    }, [refreshKey]);

    const handleClearChat = (user: User) => {
        if (window.confirm(`Are you sure you want to clear all chat history for ${user.email}? This cannot be undone.`)) {
            try {
                authService.clearUserChatHistory(currentUser.id, user.id);
                alert("Chat history cleared successfully.");
                // Optionally refresh users list if needed, but not necessary for this action
            } catch (error) {
                alert((error as Error).message);
            }
        }
    };

    return (
        <AdminSection title="User Management">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-light-border dark:border-dark-border">
                            <th className="p-2 text-left font-semibold">Name</th>
                            <th className="p-2 text-left font-semibold">Email</th>
                            <th className="p-2 text-center font-semibold">Credits</th>
                            <th className="p-2 text-center font-semibold">Role</th>
                            <th className="p-2 text-left font-semibold">Last Login</th>
                            <th className="p-2 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-bg dark:hover:bg-dark-bg">
                                <td className="p-2">{user.fullName}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2 text-center">{user.credits}</td>
                                <td className="p-2 text-center">{user.isAdmin ? <span className="px-2 py-0.5 text-xs rounded-full bg-purple-200 text-purple-800">Admin</span> : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">User</span>}</td>
                                <td className="p-2">{new Date(user.lastLogin).toLocaleString()}</td>
                                <td className="p-2 text-right">
                                     {!user.isAdmin && (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleClearChat(user)} className="p-1.5 rounded-md hover:bg-light-border dark:hover:bg-dark-border" title="Clear Chat History">
                                                <ChatBubbleIcon className="w-4 h-4 text-red-500" />
                                            </button>
                                            <button onClick={() => onEditUser(user)} className="p-1.5 rounded-md hover:bg-light-border dark:hover:bg-dark-border" title="Edit User Credits">
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminSection>
    )
};

const PaymentsTab = () => {
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    
    const fetchRequests = () => {
        setRequests(authService.getAllPaymentRequests());
    };

    useEffect(fetchRequests, []);

    const handleUpdate = (id: string, status: 'approved' | 'rejected') => {
        let reason: string | undefined;
        if (status === 'rejected') {
            reason = prompt("Please provide a reason for rejection (optional):");
            if (reason === null) return; // User cancelled prompt
        }
        try {
            authService.updatePaymentRequestStatus(id, status, reason);
            alert(`Request successfully ${status}.`);
            fetchRequests();
        } catch (error) {
            alert((error as Error).message);
        }
    };
    
    return (
        <AdminSection title="Payment Requests">
             <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-light-border dark:border-dark-border">
                            <th className="p-2 text-left font-semibold">Date</th>
                            <th className="p-2 text-left font-semibold">User</th>
                            <th className="p-2 text-left font-semibold">Method</th>
                            <th className="p-2 text-left font-semibold">User Account</th>
                            <th className="p-2 text-left font-semibold">TID</th>
                            <th className="p-2 text-center font-semibold">Amount</th>
                            <th className="p-2 text-center font-semibold">Credits</th>
                            <th className="p-2 text-center font-semibold">Status</th>
                            <th className="p-2 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-bg dark:hover:bg-dark-bg">
                                <td className="p-2 whitespace-nowrap">{new Date(req.timestamp).toLocaleString()}</td>
                                <td className="p-2">{req.userEmail}</td>
                                <td className="p-2">{req.paymentMethod}</td>
                                <td className="p-2">{req.userAccountNumber}</td>
                                <td className="p-2 font-mono text-xs">{req.transactionId}</td>
                                <td className="p-2 text-center">₹{req.finalPrice}</td>
                                <td className="p-2 text-center">{req.planCredits}</td>
                                <td className="p-2 text-center capitalize"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ req.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : req.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{req.status}</span></td>
                                <td className="p-2 text-center">
                                    {req.status === 'pending' && (
                                        <div className="flex gap-2 justify-center">
                                            <button onClick={() => handleUpdate(req.id, 'approved')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">Approve</button>
                                            <button onClick={() => handleUpdate(req.id, 'rejected')} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminSection>
    )
};

const SettingsTab = () => {
    const [featureFlags, setFeatureFlags] = useState(authService.getFeatureFlags);
    const [rewardSettings, setRewardSettings] = useState(authService.getRewardSettings);
    const [socialMediaSettings, setSocialMediaSettings] = useState(authService.getSocialMediaSettings);
    const [paymentSettings, setPaymentSettings] = useState(authService.getPaymentSettings);

    const handleSave = () => {
        try {
            authService.updateAdminSettings({ featureFlags, rewardSettings, socialMediaSettings, paymentSettings });
            alert("Settings saved successfully!");
        } catch (error) {
            alert("Failed to save settings.");
        }
    };

    const handleSocialLinkChange = (id: string, field: 'platform' | 'url', value: string) => {
        setSocialMediaSettings(prev => ({
            ...prev,
            links: prev.links.map(link => link.id === id ? { ...link, [field]: value } : link)
        }));
    };
    
    const addSocialLink = () => {
        const newLink: SocialMediaLink = { id: generateId('sm'), platform: 'website', url: '' };
        setSocialMediaSettings(prev => ({ ...prev, links: [...prev.links, newLink] }));
    };

    const removeSocialLink = (id: string) => {
        setSocialMediaSettings(prev => ({ ...prev, links: prev.links.filter(link => link.id !== id) }));
    };

    const handleRewardChange = (day: number, amount: number) => {
        setRewardSettings(prev => ({
            ...prev,
            rewards: {
                ...prev.rewards,
                [day]: amount >= 0 ? amount : 0
            }
        }));
    };

    const handleCycleDaysChange = (days: number) => {
        const newDays = Math.max(1, Math.min(30, days)); // Cycle must be between 1 and 30 days
        setRewardSettings(prev => {
            const newRewards = { ...prev.rewards };
            // Clean up rewards for days that no longer exist
            Object.keys(newRewards).forEach(dayStr => {
                const dayNum = parseInt(dayStr, 10);
                if (dayNum > newDays) {
                    delete newRewards[dayNum];
                }
            });
            return {
                ...prev,
                cycleDays: newDays,
                rewards: newRewards
            };
        });
    };

    return (
         <div className="space-y-6">
            <AdminSection title="App Settings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Feature Flags */}
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><CogIcon className="w-5 h-5"/>Feature Flags</h3>
                        <div className="space-y-2 pl-2">
                            <label className="flex items-center justify-between"><span className="text-sm">Image Studio</span><input type="checkbox" checked={featureFlags.isImageStudioEnabled} onChange={() => setFeatureFlags(p => ({...p, isImageStudioEnabled: !p.isImageStudioEnabled}))} /></label>
                            <label className="flex items-center justify-between"><span className="text-sm">Video Generator</span><input type="checkbox" checked={featureFlags.isVideoGeneratorEnabled} onChange={() => setFeatureFlags(p => ({...p, isVideoGeneratorEnabled: !p.isVideoGeneratorEnabled}))} /></label>
                            <label className="flex items-center justify-between"><span className="text-sm">Daily Rewards</span><input type="checkbox" checked={featureFlags.isDailyRewardEnabled} onChange={() => setFeatureFlags(p => ({...p, isDailyRewardEnabled: !p.isDailyRewardEnabled}))} /></label>
                            <label className="flex items-center justify-between"><span className="text-sm">AI ChatBot</span><input type="checkbox" checked={featureFlags.isChatBotEnabled} onChange={() => setFeatureFlags(p => ({...p, isChatBotEnabled: !p.isChatBotEnabled}))} /></label>
                            <label className="flex items-center justify-between"><span className="text-sm">Credit Purchase System</span><input type="checkbox" checked={featureFlags.isPurchaseSystemEnabled} onChange={() => setFeatureFlags(p => ({...p, isPurchaseSystemEnabled: !p.isPurchaseSystemEnabled}))} /></label>
                        </div>
                    </div>
                    {/* Reward Settings */}
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><GiftIcon className="w-5 h-5"/>Daily Reward Management</h3>
                        <div className="space-y-2 pl-2">
                            <label className="flex items-center gap-4">
                                <span className="text-sm w-32 shrink-0">Reward Cycle (days)</span>
                                <input type="number" value={rewardSettings.cycleDays} onChange={(e) => handleCycleDaysChange(+e.target.value)} className="w-full p-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm" />
                            </label>
                            <div className="pt-2 space-y-2 border-t border-light-border dark:border-dark-border max-h-48 overflow-y-auto pr-2">
                               <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Set credits for each day. Use 0 for no reward.</p>
                               {Array.from({ length: rewardSettings.cycleDays }, (_, i) => i + 1).map(day => (
                                    <label key={day} className="flex items-center gap-4">
                                       <span className="text-sm w-32 shrink-0">Day {day} Reward</span>
                                       <input type="number" value={rewardSettings.rewards[day] || 0} onChange={(e) => handleRewardChange(day, +e.target.value)} className="w-full p-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm" />
                                   </label>
                               ))}
                           </div>
                        </div>
                    </div>
                    {/* Payment Settings */}
                     <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><WalletIcon className="w-5 h-5"/>Payment Settings</h3>
                        <div className="space-y-2 pl-2">
                             <label className="block"><span className="text-sm">Easypaisa Account</span><input type="text" value={paymentSettings.easypaisaAccountNumber} onChange={(e) => setPaymentSettings(p => ({...p, easypaisaAccountNumber: e.target.value }))} className="w-full mt-1 p-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm" /></label>
                             <label className="block"><span className="text-sm">Jazzcash Account</span><input type="text" value={paymentSettings.jazzcashAccountNumber} onChange={(e) => setPaymentSettings(p => ({...p, jazzcashAccountNumber: e.target.value }))} className="w-full mt-1 p-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm" /></label>
                        </div>
                    </div>
                     {/* Social Media Settings */}
                     <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><ShareIcon className="w-5 h-5"/>Social Media Links</h3>
                        <div className="space-y-2 pl-2">
                             <label className="flex items-center justify-between"><span className="text-sm">Enable Footer Section</span><input type="checkbox" checked={socialMediaSettings.isEnabled} onChange={() => setSocialMediaSettings(p => ({...p, isEnabled: !p.isEnabled}))} /></label>
                             <div className="space-y-2 pt-2">
                                {socialMediaSettings.links.map(link => (
                                    <div key={link.id} className="flex gap-2 items-center">
                                        <select value={link.platform} onChange={e => handleSocialLinkChange(link.id, 'platform', e.target.value)} className="p-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs">
                                            <option value="twitter">Twitter</option><option value="instagram">Instagram</option><option value="github">GitHub</option><option value="facebook">Facebook</option><option value="linkedin">LinkedIn</option><option value="website">Website</option>
                                        </select>
                                        <input type="text" value={link.url} onChange={e => handleSocialLinkChange(link.id, 'url', e.target.value)} placeholder="https://..." className="w-full p-1 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xs" />
                                        <button onClick={() => removeSocialLink(link.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={addSocialLink} className="text-xs font-semibold text-purple-600 hover:underline">+ Add Link</button>
                             </div>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 border-t border-light-border dark:border-dark-border pt-4">
                    <button onClick={handleSave} className="px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">Save All Settings</button>
                </div>
            </AdminSection>
        </div>
    )
}


const PromosTab = () => {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [editingPromo, setEditingPromo] = useState<Partial<PromoCode> & { id?: string } | null>(null);

    const fetchPromos = () => setPromos(authService.getAllPromoCodes());
    useEffect(fetchPromos, []);

    const handleSave = () => {
        if (!editingPromo?.code || !editingPromo?.discountPercentage) {
            alert("Code and discount percentage are required.");
            return;
        }
        try {
            authService.savePromoCode({
                id: editingPromo.id || '',
                code: editingPromo.code.toUpperCase(),
                discountPercentage: editingPromo.discountPercentage,
                isActive: editingPromo.isActive ?? true,
            });
            setEditingPromo(null);
            fetchPromos();
        } catch (e) {
            alert((e as Error).message);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this promo code?")) {
            authService.deletePromoCode(id);
            fetchPromos();
        }
    }

    return (
        <AdminSection title="Promo Code Management">
             <div className="mb-6 p-4 border border-dashed border-light-border dark:border-dark-border rounded-lg">
                <h3 className="font-semibold mb-2">{editingPromo?.id ? "Edit Promo Code" : "Create New Promo Code"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Code</label>
                        <input type="text" value={editingPromo?.code || ''} onChange={e => setEditingPromo(p => ({...p, code: e.target.value.toUpperCase()}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Discount %</label>
                        <input type="number" value={editingPromo?.discountPercentage || ''} onChange={e => setEditingPromo(p => ({...p, discountPercentage: +e.target.value}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={editingPromo?.isActive ?? true}
                                onChange={e => setEditingPromo(p => ({...p, isActive: e.target.checked}))}
                                className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Active</span>
                        </label>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">{editingPromo?.id ? 'Save Changes' : 'Create Code'}</button>
                    {editingPromo && <button onClick={() => setEditingPromo(null)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-colors">Cancel</button>}
                </div>
            </div>

            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead><tr className="border-b border-light-border dark:border-dark-border"><th className="p-2 text-left font-semibold">Code</th><th className="p-2 text-center font-semibold">Discount</th><th className="p-2 text-center font-semibold">Status</th><th className="p-2 text-center font-semibold">Actions</th></tr></thead>
                    <tbody>
                        {promos.map(p => (
                            <tr key={p.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-bg dark:hover:bg-dark-bg">
                                <td className="p-2 font-mono">{p.code}</td>
                                <td className="p-2 text-center">{p.discountPercentage}%</td>
                                <td className="p-2 text-center"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${p.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td className="p-2 text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => setEditingPromo(p)} className="text-xs font-medium text-purple-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </AdminSection>
    );
};

const CreditPlansTab = () => {
    const [plans, setPlans] = useState<CreditPlan[]>([]);
    const [editingPlan, setEditingPlan] = useState<Partial<CreditPlan> & { id?: string } | null>(null);

    const fetchPlans = () => setPlans(authService.getCreditPlans());
    useEffect(fetchPlans, []);

    const handleSave = () => {
        if (!editingPlan?.credits || !editingPlan?.price) {
            alert("Credits and Price are required.");
            return;
        }
        try {
            authService.saveCreditPlan({
                id: editingPlan.id || '',
                credits: editingPlan.credits,
                price: editingPlan.price,
                currency: 'INR',
            });
            setEditingPlan(null);
            fetchPlans();
        } catch (e) {
            alert((e as Error).message);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this credit plan?")) {
            authService.deleteCreditPlan(id);
            fetchPlans();
        }
    }

    return (
        <AdminSection title="Credit Plan Management">
             <div className="mb-6 p-4 border border-dashed border-light-border dark:border-dark-border rounded-lg">
                <h3 className="font-semibold mb-2">{editingPlan?.id ? "Edit Credit Plan" : "Create New Credit Plan"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Credits</label>
                        <input type="number" value={editingPlan?.credits || ''} onChange={e => setEditingPlan(p => ({...p, credits: +e.target.value}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Price (₹)</label>
                        <input type="number" value={editingPlan?.price || ''} onChange={e => setEditingPlan(p => ({...p, price: +e.target.value}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">{editingPlan?.id ? 'Save Changes' : 'Create Plan'}</button>
                    {editingPlan && <button onClick={() => setEditingPlan(null)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-colors">Cancel</button>}
                </div>
            </div>

            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead><tr className="border-b border-light-border dark:border-dark-border"><th className="p-2 text-left font-semibold">Credits</th><th className="p-2 text-center font-semibold">Price</th><th className="p-2 text-center font-semibold">Actions</th></tr></thead>
                    <tbody>
                        {plans.map(p => (
                            <tr key={p.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-bg dark:hover:bg-dark-bg">
                                <td className="p-2 font-semibold">{p.credits}</td>
                                <td className="p-2 text-center">₹{p.price}</td>
                                <td className="p-2 text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => setEditingPlan(p)} className="text-xs font-medium text-purple-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </AdminSection>
    );
};

const UpdatesTab = () => {
    const [updates, setUpdates] = useState<UpdatePost[]>([]);
    const [editingUpdate, setEditingUpdate] = useState<Partial<UpdatePost> | null>(null);

    const fetchUpdates = () => setUpdates(authService.getAllUpdatesForAdmin());
    useEffect(fetchUpdates, []);

    const handleSave = () => {
        if (!editingUpdate?.title || !editingUpdate?.version || !editingUpdate.content) {
            alert("Title, Version, and Content are required.");
            return;
        }
        try {
            authService.saveUpdate({
                id: editingUpdate.id || '',
                title: editingUpdate.title,
                version: editingUpdate.version,
                content: editingUpdate.content,
                status: editingUpdate.status || 'draft',
                timestamp: editingUpdate.timestamp || new Date().toISOString()
            });
            setEditingUpdate(null);
            fetchUpdates();
        } catch (e) {
            alert((e as Error).message);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this update post?")) {
            authService.deleteUpdate(id);
            fetchUpdates();
        }
    }

    return (
        <AdminSection title="Platform Updates Management">
             <div className="mb-6 p-4 border border-dashed border-light-border dark:border-dark-border rounded-lg">
                <h3 className="font-semibold mb-2">{editingUpdate?.id ? "Edit Update" : "Create New Update"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input type="text" value={editingUpdate?.title || ''} onChange={e => setEditingUpdate(p => ({...p, title: e.target.value}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Version (e.g., v1.1.0)</label>
                        <input type="text" value={editingUpdate?.version || ''} onChange={e => setEditingUpdate(p => ({...p, version: e.target.value}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium mb-1">Content (use new lines for paragraphs)</label>
                        <textarea rows={5} value={editingUpdate?.content || ''} onChange={e => setEditingUpdate(p => ({...p, content: e.target.value}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    </div>
                    <div className="sm:col-span-3">
                         <label className="block text-sm font-medium mb-1">Status</label>
                        <select value={editingUpdate?.status || 'draft'} onChange={e => setEditingUpdate(p => ({...p, status: e.target.value as 'draft' | 'published'}))} className="p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">{editingUpdate?.id ? 'Save Changes' : 'Create Update'}</button>
                    {editingUpdate && <button onClick={() => setEditingUpdate(null)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-colors">Cancel</button>}
                </div>
            </div>

            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead><tr className="border-b border-light-border dark:border-dark-border"><th className="p-2 text-left font-semibold">Version</th><th className="p-2 text-left font-semibold">Title</th><th className="p-2 text-center font-semibold">Status</th><th className="p-2 text-left font-semibold">Date</th><th className="p-2 text-center font-semibold">Actions</th></tr></thead>
                    <tbody>
                        {updates.map(u => (
                            <tr key={u.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-bg dark:hover:bg-dark-bg">
                                <td className="p-2 font-mono text-xs">{u.version}</td>
                                <td className="p-2 font-semibold">{u.title}</td>
                                <td className="p-2 text-center"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${u.status === 'published' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{u.status}</span></td>
                                <td className="p-2 text-xs">{new Date(u.timestamp).toLocaleDateString()}</td>
                                <td className="p-2 text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => setEditingUpdate(u)} className="text-xs font-medium text-purple-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(u.id)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </AdminSection>
    );
};

const HowItWorksTab = () => {
    const [steps, setSteps] = useState<HowItWorksStep[]>([]);
    const [editingStep, setEditingStep] = useState<Partial<HowItWorksStep> | null>(null);

    const fetchSteps = () => setSteps(authService.getHowItWorksSteps());
    useEffect(fetchSteps, []);

    const handleSave = () => {
        if (!editingStep?.title || !editingStep?.description) {
            alert("Title and description are required.");
            return;
        }
        authService.saveHowItWorksStep(editingStep);
        setEditingStep(null);
        fetchSteps();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this step?")) {
            authService.deleteHowItWorksStep(id);
            fetchSteps();
        }
    };

    const handleReorder = (id: string, direction: 'up' | 'down') => {
        authService.reorderHowItWorksSteps(id, direction);
        fetchSteps();
    };

    return (
        <AdminSection title="How It Works Management">
            <div className="mb-6 p-4 border border-dashed border-light-border dark:border-dark-border rounded-lg">
                <h3 className="font-semibold mb-2">{editingStep?.id ? "Edit Step" : "Create New Step"}</h3>
                <div className="space-y-4">
                    <input type="text" value={editingStep?.title || ''} onChange={e => setEditingStep(s => ({...s, title: e.target.value}))} placeholder="Title" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    <textarea value={editingStep?.description || ''} onChange={e => setEditingStep(s => ({...s, description: e.target.value}))} placeholder="Description" rows={3} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700">{editingStep?.id ? 'Save Changes' : 'Create Step'}</button>
                    {editingStep && <button onClick={() => setEditingStep(null)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border">Cancel</button>}
                </div>
            </div>
            <div className="space-y-2">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 p-2 rounded hover:bg-light-bg dark:hover:bg-dark-bg">
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleReorder(step.id, 'up')} disabled={index === 0} className="disabled:opacity-20"><ChevronUpIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleReorder(step.id, 'down')} disabled={index === steps.length - 1} className="disabled:opacity-20"><ChevronDownIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{step.title}</p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{step.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingStep(step)}><EditIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(step.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminSection>
    );
};

const availableIcons = ['ZapIcon', 'ShieldCheckIcon', 'GiftIcon', 'MagicWandIcon', 'VideoIcon', 'ChatBubbleIcon'];

const FeaturesTab = () => {
    const [features, setFeatures] = useState<FeatureItem[]>([]);
    const [editingFeature, setEditingFeature] = useState<Partial<FeatureItem> | null>(null);
    const [allFlags, setAllFlags] = useState<string[]>([]);
    
    useEffect(() => {
        const flags = authService.getFeatureFlags();
        setAllFlags(Object.keys(flags));
    }, []);

    const fetchFeatures = () => setFeatures(authService.getFeatureItems());
    useEffect(fetchFeatures, []);

    const handleSave = () => {
        if (!editingFeature?.title || !editingFeature?.description || !editingFeature?.icon) {
            alert("Icon, title, and description are required.");
            return;
        }
        authService.saveFeatureItem(editingFeature);
        setEditingFeature(null);
        fetchFeatures();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this feature?")) {
            authService.deleteFeatureItem(id);
            fetchFeatures();
        }
    };

    const handleReorder = (id: string, direction: 'up' | 'down') => {
        authService.reorderFeatureItems(id, direction);
        fetchFeatures();
    };

    return (
        <AdminSection title="Features Management">
            <div className="mb-6 p-4 border border-dashed border-light-border dark:border-dark-border rounded-lg">
                <h3 className="font-semibold mb-2">{editingFeature?.id ? "Edit Feature" : "Create New Feature"}</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Icon</label>
                            <select value={editingFeature?.icon || ''} onChange={e => setEditingFeature(f => ({...f, icon: e.target.value}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                                <option value="" disabled>Select Icon</option>
                                {availableIcons.map(icon => <option key={icon} value={icon}>{icon.replace('Icon', '')}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                             <label className="block text-sm font-medium mb-1">Title</label>
                            <input type="text" value={editingFeature?.title || ''} onChange={e => setEditingFeature(f => ({...f, title: e.target.value}))} placeholder="Title" className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                        </div>
                    </div>
                    <textarea value={editingFeature?.description || ''} onChange={e => setEditingFeature(f => ({...f, description: e.target.value}))} placeholder="Description" rows={3} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border" />
                    <div>
                        <label className="block text-sm font-medium mb-1">Enable/Disable via Feature Flag (Optional)</label>
                        <select value={editingFeature?.flagName || ''} onChange={e => setEditingFeature(f => ({...f, flagName: e.target.value as keyof FeatureFlags | undefined}))} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                            <option value="">Always Enabled</option>
                            {allFlags.map(flag => <option key={flag} value={flag}>{flag}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700">{editingFeature?.id ? 'Save Changes' : 'Create Feature'}</button>
                    {editingFeature && <button onClick={() => setEditingFeature(null)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border">Cancel</button>}
                </div>
            </div>
            <div className="space-y-2">
                {features.map((feature, index) => (
                    <div key={feature.id} className="flex items-center gap-2 p-2 rounded hover:bg-light-bg dark:hover:bg-dark-bg">
                         <div className="flex flex-col gap-2">
                            <button onClick={() => handleReorder(feature.id, 'up')} disabled={index === 0} className="disabled:opacity-20"><ChevronUpIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleReorder(feature.id, 'down')} disabled={index === features.length - 1} className="disabled:opacity-20"><ChevronDownIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{feature.title} <span className="text-xs font-normal text-light-text-secondary dark:text-dark-text-secondary">({feature.icon.replace('Icon', '')})</span></p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{feature.description}</p>
                             {feature.flagName && <p className="text-xs mt-1 font-mono px-1.5 py-0.5 inline-block rounded bg-light-border dark:bg-dark-border">{feature.flagName}</p>}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingFeature(feature)}><EditIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(feature.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminSection>
    );
};

const MessagesTab = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const fetchMessages = () => setMessages(authService.getAllContactMessages());
    useEffect(fetchMessages, []);

    const handleArchive = (id: string) => {
        authService.archiveContactMessage(id);
        fetchMessages();
    };

    return (
        <AdminSection title="Contact Messages">
            <div className="space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-lg border ${msg.isArchived ? 'bg-light-bg dark:bg-dark-bg opacity-60' : 'bg-light-bg-secondary dark:bg-dark-bg-secondary border-light-border dark:border-dark-border'}`}>
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold">{msg.email}</p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{new Date(msg.timestamp).toLocaleString()}</p>
                            </div>
                            <button onClick={() => handleArchive(msg.id)} className="text-sm font-semibold px-3 py-1 rounded-full border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-colors">{msg.isArchived ? 'Unarchive' : 'Archive'}</button>
                        </div>
                        <p className="mt-3 text-sm">{msg.message}</p>
                    </div>
                ))}
            </div>
        </AdminSection>
    )
};

const ActivityTab = () => {
    const [activities, setActivities] = useState<ActivityLogItem[]>([]);
    useEffect(() => setActivities(authService.getAllActivity()), []);

     return (
        <AdminSection title="User Activity Log">
            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead><tr className="border-b border-light-border dark:border-dark-border"><th className="p-2 text-left font-semibold">Timestamp</th><th className="p-2 text-left font-semibold">User ID</th><th className="p-2 text-left font-semibold">Type</th><th className="p-2 text-left font-semibold">Details</th></tr></thead>
                    <tbody>
                        {activities.map(log => (
                            <tr key={log.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-bg dark:hover:bg-dark-bg">
                                <td className="p-2 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-2 text-xs font-mono">{log.userId}</td>
                                <td className="p-2 capitalize text-xs"><span className="px-2 py-0.5 rounded-full bg-light-border dark:bg-dark-border">{log.type.replace('_', ' ')}</span></td>
                                <td className="p-2 text-xs">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </AdminSection>
    );
};


export default AdminPanel;

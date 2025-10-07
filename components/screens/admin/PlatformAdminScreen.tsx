import React, { useState, useEffect } from 'react';
import { User, Screen } from '../../../types';
import * as api from '../../../api';

interface PlatformAdminScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
}

const PlatformAdminScreen: React.FC<PlatformAdminScreenProps> = ({
    currentUser,
    navigateTo,
    goBack
}) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'invitations' | 'plans' | 'agents' | 'audit'>('dashboard');
    const [platformStats, setPlatformStats] = useState<api.PlatformStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is super admin
    if (currentUser.role !== 'super_admin') {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                    <div className="text-red-600 text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
                    <p className="text-red-700 mb-4">
                        You need super administrator privileges to access the Platform Administration panel.
                    </p>
                    <button
                        onClick={goBack}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Load platform statistics
    useEffect(() => {
        const loadStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const stats = await api.getPlatformStats(currentUser);
                setPlatformStats(stats);
            } catch (err: any) {
                console.error('Error loading platform stats:', err);
                setError(err.message || 'Failed to load platform statistics');
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab === 'dashboard') {
            loadStats();
        }
    }, [activeTab, currentUser]);

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'companies', name: 'Companies', icon: '🏢' },
        { id: 'invitations', name: 'Invitations', icon: '📧' },
        { id: 'plans', name: 'Plans', icon: '💳' },
        { id: 'agents', name: 'AI Agents', icon: '🤖' },
        { id: 'audit', name: 'Audit Log', icon: '📜' }
    ] as const;

    const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({
        title, value, icon, color
    }) => (
        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="text-3xl">{icon}</div>
            </div>
        </div>
    );

    const DashboardContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-red-800">{error}</div>
                </div>
            );
        }

        if (!platformStats) return null;

        return (
            <div className="space-y-8">
                {/* Platform Overview */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Companies"
                            value={platformStats.totalCompanies}
                            icon="🏢"
                            color="border-blue-500"
                        />
                        <StatCard
                            title="Total Users"
                            value={platformStats.totalUsers}
                            icon="👥"
                            color="border-green-500"
                        />
                        <StatCard
                            title="Active Projects"
                            value={platformStats.totalProjects}
                            icon="🏗️"
                            color="border-purple-500"
                        />
                        <StatCard
                            title="AI Subscriptions"
                            value={platformStats.activeSubscriptions}
                            icon="🤖"
                            color="border-orange-500"
                        />
                    </div>
                </div>

                {/* Revenue & Growth */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Growth</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Monthly Revenue"
                            value={`$${platformStats.monthlyRevenue.toFixed(2)}`}
                            icon="💰"
                            color="border-emerald-500"
                        />
                        <StatCard
                            title="New Companies (This Month)"
                            value={platformStats.newCompaniesThisMonth}
                            icon="📈"
                            color="border-blue-500"
                        />
                        <StatCard
                            title="New Users (This Month)"
                            value={platformStats.newUsersThisMonth}
                            icon="👤"
                            color="border-green-500"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button
                            onClick={() => setActiveTab('invitations')}
                            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">📧</div>
                            <div className="font-semibold">Send Invitation</div>
                            <div className="text-sm opacity-90">Invite new companies to the platform</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('companies')}
                            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">🏢</div>
                            <div className="font-semibold">Manage Companies</div>
                            <div className="text-sm opacity-90">View and manage all companies</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('agents')}
                            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">🤖</div>
                            <div className="font-semibold">AI Agents</div>
                            <div className="text-sm opacity-90">Manage AI agents marketplace</div>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardContent />;
            case 'companies':
                return <div className="text-center py-12 text-gray-500">Companies management coming soon...</div>;
            case 'invitations':
                return <div className="text-center py-12 text-gray-500">Invitations management coming soon...</div>;
            case 'plans':
                return <div className="text-center py-12 text-gray-500">Plans management coming soon...</div>;
            case 'agents':
                return <div className="text-center py-12 text-gray-500">AI Agents management coming soon...</div>;
            case 'audit':
                return <div className="text-center py-12 text-gray-500">Audit log coming soon...</div>;
            default:
                return <DashboardContent />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
                        <p className="text-gray-600 mt-2">
                            Central control panel for ConstructAI multi-tenant platform
                        </p>
                    </div>
                    <button
                        onClick={goBack}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Super Admin Badge */}
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                    <span className="text-lg">👑</span>
                    <span className="font-semibold">Super Administrator</span>
                    <span className="text-sm opacity-90">({currentUser.email})</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-50 rounded-lg p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default PlatformAdminScreen;

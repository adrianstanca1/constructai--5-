/**
 * Base44 Complete Clone
 * Full implementation of all features from https://asagents.base44.app
 */

import React, { useState } from 'react';
import { User } from '../../types';
import { ProjectsPage } from './pages/ProjectsPage';
import { ClientsPage } from './pages/ClientsPage';
import { RFIsPage } from './pages/RFIsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { TimeTrackingPage } from './pages/TimeTrackingPage';
import { SubcontractorsPage } from './pages/SubcontractorsPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { LedgerPage } from './pages/LedgerPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChatbotWidget } from '../chat/ChatbotWidget';
import { ModernSidebar } from './components/ModernSidebar';

interface Base44CloneProps {
    user: User;
    onLogout: () => void;
}

type PageType = 'dashboard' | 'projects' | 'clients' | 'rfis' | 'subcontractors' |
    'invoices' | 'timetracking' | 'purchaseorders' | 'documents' | 'reports' | 'ledger' | 'settings';

export const Base44Clone: React.FC<Base44CloneProps> = ({ user, onLogout }) => {
    const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Modern Sidebar */}
            <ModernSidebar currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={onLogout} />

            {/* Main Content - Adjusted for sidebar width */}
            <main className="flex-1 overflow-y-auto ml-64">
                {currentPage === 'dashboard' && <DashboardPage />}
                {currentPage === 'projects' && <ProjectsPage />}
                {currentPage === 'clients' && <ClientsPage />}
                {currentPage === 'rfis' && <RFIsPage />}
                {currentPage === 'subcontractors' && <SubcontractorsPage />}
                {currentPage === 'invoices' && <InvoicesPage />}
                {currentPage === 'timetracking' && <TimeTrackingPage />}
                {currentPage === 'purchaseorders' && <PurchaseOrdersPage />}
                {currentPage === 'documents' && <DocumentsPage />}
                {currentPage === 'reports' && <ReportsPage />}
                {currentPage === 'ledger' && <LedgerPage />}
                {currentPage === 'settings' && <SettingsPage user={user} />}
            </main>

            {/* Global AI Chatbot - Available on all pages */}
            <ChatbotWidget />
        </div>
    );
};

// Sidebar Component
const Sidebar: React.FC<{
    currentPage: PageType;
    onNavigate: (page: PageType) => void;
    user: User;
    onLogout: () => void;
}> = ({ currentPage, onNavigate, user, onLogout }) => {
    const menuItems = [
        { id: 'dashboard' as PageType, label: 'Dashboard', icon: '📊' },
        { id: 'projects' as PageType, label: 'Projects', icon: '🏗️' },
        { id: 'clients' as PageType, label: 'Clients', icon: '👥' },
        { id: 'rfis' as PageType, label: 'RFIs', icon: '❓' },
        { id: 'subcontractors' as PageType, label: 'Subcontractors', icon: '🔧' },
        { id: 'invoices' as PageType, label: 'Invoices', icon: '💰' },
        { id: 'timetracking' as PageType, label: 'Time Tracking', icon: '⏱️' },
        { id: 'purchaseorders' as PageType, label: 'Purchase Orders', icon: '📦' },
        { id: 'documents' as PageType, label: 'Documents', icon: '📄' },
        { id: 'reports' as PageType, label: 'Reports', icon: '📈' },
        { id: 'ledger' as PageType, label: 'Ledger', icon: '📒' }
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* CortexBuild Revolutionary Brand */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    {/* Neural Network Icon with Gradient */}
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        {/* Subtle pulse effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 animate-ping opacity-10"></div>
                    </div>

                    {/* Brand Name */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                            CortexBuild
                        </h2>
                        <p className="text-[10px] font-semibold text-gray-500 tracking-wider -mt-0.5">
                            AI PLATFORM
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</p>
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onNavigate(item.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === item.id
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Settings at bottom */}
                <ul className="mt-8 space-y-1">
                    <li>
                        <button
                            type="button"
                            onClick={() => onNavigate('settings')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'settings'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-xl">⚙️</span>
                            <span className="font-medium">Settings</span>
                        </button>
                    </li>
                </ul>
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-200 space-y-3">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>

                {/* Logout Button - Prominent with Gradient */}
                <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

// Dashboard Page
const DashboardPage: React.FC = () => {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Adrian</h1>
                <p className="text-gray-600">Here's what's happening with your construction projects today</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Active Projects"
                    value="4"
                    subtitle="of 7 total"
                    icon="🏗️"
                    color="blue"
                />
                <StatCard
                    title="Total Revenue"
                    value="£972,000"
                    subtitle="12% vs last month"
                    icon="💰"
                    color="green"
                    trend="up"
                />
                <StatCard
                    title="Outstanding"
                    value="£1,036,800"
                    subtitle="Awaiting payment"
                    icon="⏳"
                    color="yellow"
                />
                <StatCard
                    title="Completion Rate"
                    value="0%"
                    subtitle="Projects on track"
                    icon="📈"
                    color="purple"
                />
            </div>

            {/* AI Business Insights */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🤖</span>
                    AI Business Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AIInsightCard
                        icon="⚠️"
                        title="Budget Alert"
                        description="3 projects are trending over budget. Review cost controls."
                        action="View Projects"
                        color="red"
                    />
                    <AIInsightCard
                        icon="💵"
                        title="Cash Flow Optimization"
                        description="Send invoice reminders to improve cash flow by 15%."
                        action="Send Reminders"
                        color="green"
                    />
                    <AIInsightCard
                        icon="🌤️"
                        title="Scheduling Insight"
                        description="Weather forecast shows optimal conditions for outdoor work next week."
                        action="View Schedule"
                        color="blue"
                    />
                </div>
            </div>

            {/* Recent Projects and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="mr-2">📋</span>
                            Recent Projects
                        </h3>
                        <button type="button" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            View All →
                        </button>
                    </div>
                    <div className="space-y-4">
                        <ProjectCard
                            name="ASasdad"
                            client="Green Valley Homes"
                            budget="£123,333"
                            status="planning"
                        />
                        <ProjectCard
                            name="Downtown Office Complex"
                            client="Metro Construction Group"
                            budget="£12,500,000"
                            status="in progress"
                            progress={45}
                        />
                        <ProjectCard
                            name="Riverside Luxury Apartments"
                            client="Green Valley Homes"
                            budget="£8,900,000"
                            status="in progress"
                            progress={28}
                        />
                        <ProjectCard
                            name="Manufacturing Facility Expansion"
                            client="Industrial Partners LLC"
                            budget="£15,000,000"
                            status="planning"
                        />
                        <ProjectCard
                            name="Riverside Apartments"
                            client="Green Valley Homes"
                            budget="£3,200,000"
                            status="in progress"
                            progress={56}
                        />
                    </div>
                </div>

                {/* Alerts & Actions */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">🔔</span>
                        Alerts & Actions
                    </h3>
                    <div className="space-y-4">
                        <AlertCard
                            icon="💰"
                            title="Outstanding Invoices"
                            description="£1,036,800 awaiting payment"
                            color="yellow"
                        />
                        <AlertCard
                            icon="🤖"
                            title="AI Recommendation"
                            description="Schedule weekly project reviews to stay on track"
                            color="blue"
                        />
                        <button
                            type="button"
                            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>➕</span>
                            <span>New Project</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: string;
    trend?: 'up' | 'down';
}> = ({ title, value, subtitle, icon, color, trend }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        {trend && (
                            <span className={`mr-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {trend === 'up' ? '↑' : '↓'}
                            </span>
                        )}
                        {subtitle}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

// AI Insight Card Component
const AIInsightCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    action: string;
    color: string;
}> = ({ icon, title, description, action, color }) => {
    const colorClasses = {
        red: 'bg-red-50 border-red-200',
        green: 'bg-green-50 border-green-200',
        blue: 'bg-blue-50 border-blue-200'
    };

    return (
        <div className={`rounded-xl border p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="flex items-start space-x-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
            <button
                type="button"
                className="w-full bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200"
            >
                {action}
            </button>
        </div>
    );
};

// Project Card Component
const ProjectCard: React.FC<{
    name: string;
    client: string;
    budget: string;
    status: string;
    progress?: number;
}> = ({ name, client, budget, status, progress }) => {
    const statusColors = {
        'planning': 'bg-yellow-100 text-yellow-800',
        'in progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800'
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-2">
                        <span>{client}</span>
                        <span>•</span>
                        <span>Budget: {budget}</span>
                        {progress !== undefined && (
                            <>
                                <span>•</span>
                                <span>{progress}% complete</span>
                            </>
                        )}
                    </div>
                </div>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Alert Card Component
const AlertCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    color: string;
}> = ({ icon, title, description, color }) => {
    const colorClasses = {
        yellow: 'bg-yellow-50 border-yellow-200',
        blue: 'bg-blue-50 border-blue-200'
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="flex items-start space-x-3">
                <span className="text-xl">{icon}</span>
                <div>
                    <p className="font-medium text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-600 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
};

// All pages are now imported from separate files


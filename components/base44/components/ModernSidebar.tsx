/**
 * Modern Sidebar - CortexBuild Platform
 * Collapsible, responsive sidebar with quick actions
 * Version: 1.0.0
 */

import React, { useState } from 'react';

interface ModernSidebarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    user: any;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ currentPage, onNavigate, onLogout, user }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            page: 'dashboard'
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: '🏗️',
            page: 'projects',
            badge: null
        },
        {
            id: 'clients',
            label: 'Clients',
            icon: '👥',
            page: 'clients'
        },
        {
            id: 'rfis',
            label: 'RFIs',
            icon: '❓',
            page: 'rfis'
        },
        {
            id: 'subcontractors',
            label: 'Subcontractors',
            icon: '🔧',
            page: 'subcontractors'
        },
        {
            id: 'invoices',
            label: 'Invoices',
            icon: '💰',
            page: 'invoices'
        },
        {
            id: 'timetracking',
            label: 'Time Tracking',
            icon: '⏱️',
            page: 'timetracking'
        },
        {
            id: 'purchaseorders',
            label: 'Purchase Orders',
            icon: '📦',
            page: 'purchaseorders'
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: '📄',
            page: 'documents'
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: '📈',
            page: 'reports'
        },
        {
            id: 'ledger',
            label: 'Ledger',
            icon: '📒',
            page: 'ledger'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            page: 'settings'
        }
    ];

    const quickActions = [
        { id: 'new-project', label: 'New Project', icon: '➕', action: () => onNavigate('projects') },
        { id: 'new-invoice', label: 'New Invoice', icon: '📝', action: () => onNavigate('invoices') },
        { id: 'log-time', label: 'Log Time', icon: '⏰', action: () => onNavigate('timetracking') }
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
                            CB
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            CortexBuild
                        </span>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg
                        className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Search */}
            {!isCollapsed && (
                <div className="p-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {!isCollapsed && (
                <div className="px-4 pb-4">
                    <div className="text-xs font-semibold text-gray-400 mb-2">QUICK ACTIONS</div>
                    <div className="space-y-1">
                        {quickActions.map((action) => (
                            <button
                                type="button"
                                key={action.id}
                                onClick={action.action}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                <span>{action.icon}</span>
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                {!isCollapsed && <div className="text-xs font-semibold text-gray-400 px-2 mb-2">NAVIGATION</div>}
                <nav className="space-y-1">
                    {filteredMenuItems.map((item) => {
                        const isActive = currentPage === item.page;
                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => onNavigate(item.page)}
                                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile & Logout */}
            <div className="border-t border-gray-700 p-4">
                {!isCollapsed ? (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
                                <div className="text-xs text-gray-400 truncate">{user?.email || ''}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onLogout}
                        className="w-full p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};


import React from 'react';

interface DashboardAnalyticsProps {
    stats: {
        totalRevenue: number;
        activeProjects: number;
        totalHours: number;
        pendingInvoices: number;
    };
    revenueData: { month: string; amount: number }[];
    projectStatusData: { status: string; count: number; color: string }[];
    timeTrackingData: { week: string; hours: number }[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
    stats,
    revenueData,
    projectStatusData,
    timeTrackingData
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const maxRevenue = Math.max(...revenueData.map(d => d.amount));
    const maxHours = Math.max(...timeTrackingData.map(d => d.hours));
    const totalProjects = projectStatusData.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">+12.5%</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</h3>
                    <p className="text-sm opacity-90">Total Revenue</p>
                </div>

                {/* Active Projects */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">+3 new</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats.activeProjects}</h3>
                    <p className="text-sm opacity-90">Active Projects</p>
                </div>

                {/* Total Hours */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">This month</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats.totalHours.toLocaleString()}h</h3>
                    <p className="text-sm opacity-90">Total Hours Logged</p>
                </div>

                {/* Pending Invoices */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">Awaiting</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats.pendingInvoices}</h3>
                    <p className="text-sm opacity-90">Pending Invoices</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                    <div className="space-y-2">
                        {revenueData.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-600 w-16">{item.month}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-3"
                                        style={{ width: `${(item.amount / maxRevenue) * 100}%` }}
                                    >
                                        <span className="text-xs font-medium text-white">{formatCurrency(item.amount)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Status Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-48 h-48">
                            {/* Simple Pie Chart using conic-gradient */}
                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    background: `conic-gradient(
                                        ${projectStatusData.map((item, index) => {
                                            const prevPercentage = projectStatusData
                                                .slice(0, index)
                                                .reduce((sum, d) => sum + (d.count / totalProjects) * 100, 0);
                                            const currentPercentage = (item.count / totalProjects) * 100;
                                            return `${item.color} ${prevPercentage}% ${prevPercentage + currentPercentage}%`;
                                        }).join(', ')}
                                    )`
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
                                        <div className="text-xs text-gray-600">Total</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {projectStatusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-gray-700">{item.status}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{item.count} ({((item.count / totalProjects) * 100).toFixed(0)}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Time Tracking Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Time Tracking</h3>
                <div className="flex items-end space-x-4 h-64">
                    {timeTrackingData.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${(item.hours / maxHours) * 100}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg flex items-start justify-center pt-2">
                                    <span className="text-xs font-medium text-white">{item.hours}h</span>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">{item.week}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


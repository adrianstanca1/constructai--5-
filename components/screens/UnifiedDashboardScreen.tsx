import React from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../types.ts';
import PlatformAdminScreen from './admin/PlatformAdminScreen.tsx';
import CompanyAdminDashboard from './dashboards/CompanyAdminDashboard.tsx';
import CompanyAdminDashboardNew from './dashboards/CompanyAdminDashboardNew.tsx';
import SupervisorDashboard from './dashboards/SupervisorDashboard.tsx';
import OperativeDashboard from './dashboards/OperativeDashboard.tsx';


interface UnifiedDashboardScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
    goBack: () => void;
}

const UnifiedDashboardScreen: React.FC<UnifiedDashboardScreenProps> = (props) => {
    const { currentUser } = props;

    // Route to the correct dashboard based on the user's role
    switch (currentUser.role) {
        case 'super_admin':
            // Super admins get the full platform administration dashboard
            return <PlatformAdminScreen {...props} />;

        case 'company_admin':
        case 'Project Manager':
        case 'Accounting Clerk':
            // These roles get a more comprehensive, company-wide view with new Base44 design
            return <CompanyAdminDashboardNew {...props} />;

        case 'Foreman':
        case 'Safety Officer':
            // These roles get a supervisor-level view focused on tasks and teams
            return <SupervisorDashboard {...props} />;

        case 'operative':
            // This role gets a view focused on their individual daily work
            return <OperativeDashboard {...props} />;

        default:
            // Fallback for any other roles, providing a safe default with new design
            return <CompanyAdminDashboardNew {...props} />;
    }
};

export default UnifiedDashboardScreen;
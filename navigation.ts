import { Screen, PermissionSubject, PermissionAction } from './types.ts';

export interface MenuItem {
    label: string;
    screen?: Screen;
    permission?: {
        subject: PermissionSubject;
        action: PermissionAction;
    };
    children?: MenuItem[];
    requiresProjectContext?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
    {
        label: 'Accounting',
        screen: 'accounting',
        permission: { subject: 'accounting', action: 'read' },
    },
    {
        label: 'AI Tools',
        screen: 'ai-tools',
        // No specific permission, shown to relevant roles based on tool definitions
    },
    {
        label: 'Document Management',
        children: [
            { label: 'All Documents', screen: 'document-management', permission: { subject: 'document', action: 'read' } },
            { label: 'Drawings', screen: 'drawings', permission: { subject: 'drawing', action: 'read' }, requiresProjectContext: true },
            { label: 'Photo Gallery', screen: 'photos', permission: { subject: 'photo', action: 'read' }, requiresProjectContext: true },
            { label: 'Reports', screen: 'documents', permission: { subject: 'document', action: 'read' }, requiresProjectContext: true },
        ]
    },
    {
        label: 'Time Tracking',
        screen: 'time-tracking',
        permission: { subject: 'timeEntry', action: 'read' },
    },
    {
        label: 'Project Operations',
        screen: 'project-operations',
        // No specific permission, acts as a container for tools
    },
    {
        label: 'Financial Management',
        screen: 'financial-management',
        permission: { subject: 'accounting', action: 'read' },
    },
    {
        label: 'Business Development',
        screen: 'business-development',
        // No specific permission
    }
];
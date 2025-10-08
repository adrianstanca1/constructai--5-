/**
 * Chat Permissions & Validation System
 * Ensures secure execution of chatbot actions
 */

import { setCompanyContext } from '../supabase/client';
import type { ChatContext } from './gemini-client';

export interface ValidationResult {
    valid: boolean;
    error?: string;
    warning?: string;
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
    dependencies?: any[];
}

export interface PermissionCheck {
    action: string;
    userRole: string;
    requiredRole?: string;
    requiredPermissions?: string[];
}

/**
 * Critical actions that require confirmation
 */
export const CRITICAL_ACTIONS = [
    'delete_project',
    'delete_client',
    'delete_invoice',
    'delete_rfi',
    'update_budget_major', // >£10K change
    'cancel_project',
    'archive_client',
];

/**
 * Role-based permissions
 */
export const ROLE_PERMISSIONS = {
    admin: ['*'], // All permissions
    manager: [
        'create_project',
        'update_project',
        'delete_project',
        'create_client',
        'update_client',
        'create_invoice',
        'update_invoice',
        'create_rfi',
        'update_rfi',
        'view_all',
    ],
    user: [
        'view_all',
        'create_rfi',
        'update_rfi',
        'create_time_entry',
        'update_time_entry',
    ],
    viewer: ['view_all'],
};

/**
 * Check if user has permission for action
 */
export function hasPermission(userRole: string, action: string): boolean {
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
    
    // Admin has all permissions
    if (permissions.includes('*')) {
        return true;
    }
    
    // Check specific permission
    return permissions.includes(action);
}

/**
 * Validate action before execution
 */
export async function validateAction(
    action: string,
    params: any,
    context: ChatContext
): Promise<ValidationResult> {
    // 1. Check user permissions
    if (!hasPermission(context.userRole, action)) {
        return {
            valid: false,
            error: `Nu ai permisiunea să execuți acțiunea: ${action}. Rolul tău (${context.userRole}) nu permite această operațiune.`,
        };
    }

    // 2. Check if action is critical
    if (CRITICAL_ACTIONS.includes(action)) {
        return {
            valid: true,
            requiresConfirmation: true,
            confirmationMessage: `⚠️ Această acțiune este critică și necesită confirmare. Ești sigur că vrei să continui?`,
        };
    }

    // 3. Validate specific actions
    switch (action) {
        case 'delete_project':
            return await validateDeleteProject(params, context);
        
        case 'delete_client':
            return await validateDeleteClient(params, context);
        
        case 'update_project':
            return await validateUpdateProject(params, context);
        
        case 'create_project':
            return await validateCreateProject(params, context);
        
        default:
            return { valid: true };
    }
}

/**
 * Validate delete project
 */
async function validateDeleteProject(
    params: { projectId: string },
    context: ChatContext
): Promise<ValidationResult> {
    const client = await setCompanyContext(context.companyId);
    
    // Check if project exists and belongs to company
    const { data: project, error } = await client
        .from('projects')
        .select('id, name, status')
        .eq('id', params.projectId)
        .eq('company_id', context.companyId)
        .single();

    if (error || !project) {
        return {
            valid: false,
            error: 'Proiectul nu a fost găsit sau nu aparține companiei tale.',
        };
    }

    // Check for dependencies
    const [invoicesResult, timeEntriesResult, rfisResult] = await Promise.all([
        client.from('invoices').select('id').eq('project_id', params.projectId).limit(1),
        client.from('time_entries').select('id').eq('project_id', params.projectId).limit(1),
        client.from('rfis').select('id').eq('project_id', params.projectId).limit(1),
    ]);

    const dependencies = [];
    if (invoicesResult.data && invoicesResult.data.length > 0) {
        dependencies.push('facturi');
    }
    if (timeEntriesResult.data && timeEntriesResult.data.length > 0) {
        dependencies.push('înregistrări de timp');
    }
    if (rfisResult.data && rfisResult.data.length > 0) {
        dependencies.push('RFI-uri');
    }

    if (dependencies.length > 0) {
        return {
            valid: true,
            requiresConfirmation: true,
            warning: `⚠️ Proiectul "${project.name}" are ${dependencies.join(', ')} asociate. Ștergerea va elimina și aceste date.`,
            confirmationMessage: `Scrie "CONFIRM DELETE ${project.name}" pentru a confirma ștergerea.`,
            dependencies,
        };
    }

    return {
        valid: true,
        requiresConfirmation: true,
        confirmationMessage: `Ești sigur că vrei să ștergi proiectul "${project.name}"?`,
    };
}

/**
 * Validate delete client
 */
async function validateDeleteClient(
    params: { clientId: string },
    context: ChatContext
): Promise<ValidationResult> {
    const client = await setCompanyContext(context.companyId);
    
    // Check if client exists
    const { data: clientData, error } = await client
        .from('clients')
        .select('id, name')
        .eq('id', params.clientId)
        .eq('company_id', context.companyId)
        .single();

    if (error || !clientData) {
        return {
            valid: false,
            error: 'Clientul nu a fost găsit.',
        };
    }

    // Check for active projects
    const { data: projects, error: projectsError } = await client
        .from('projects')
        .select('id, name, status')
        .eq('client_id', params.clientId)
        .eq('company_id', context.companyId);

    if (projects && projects.length > 0) {
        const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
        
        if (activeProjects.length > 0) {
            return {
                valid: false,
                error: `Nu poți șterge clientul "${clientData.name}" deoarece are ${activeProjects.length} proiecte active. Închide sau arhivează proiectele mai întâi.`,
                dependencies: activeProjects,
            };
        }

        return {
            valid: true,
            requiresConfirmation: true,
            warning: `Clientul "${clientData.name}" are ${projects.length} proiecte (finalizate/anulate). Ștergerea va păstra proiectele dar va elimina legătura cu clientul.`,
            confirmationMessage: `Scrie "CONFIRM DELETE ${clientData.name}" pentru a confirma.`,
        };
    }

    return {
        valid: true,
        requiresConfirmation: true,
        confirmationMessage: `Ești sigur că vrei să ștergi clientul "${clientData.name}"?`,
    };
}

/**
 * Validate update project
 */
async function validateUpdateProject(
    params: { projectId: string; updates: any },
    context: ChatContext
): Promise<ValidationResult> {
    const client = await setCompanyContext(context.companyId);
    
    // Check if project exists
    const { data: project, error } = await client
        .from('projects')
        .select('id, name, budget, spent')
        .eq('id', params.projectId)
        .eq('company_id', context.companyId)
        .single();

    if (error || !project) {
        return {
            valid: false,
            error: 'Proiectul nu a fost găsit.',
        };
    }

    // Check for major budget changes
    if (params.updates.budget) {
        const budgetChange = Math.abs(params.updates.budget - project.budget);
        const changePercentage = (budgetChange / project.budget) * 100;

        if (budgetChange > 10000 || changePercentage > 20) {
            return {
                valid: true,
                requiresConfirmation: true,
                warning: `⚠️ Modificare majoră de buget: ${budgetChange.toLocaleString('ro-RO', { style: 'currency', currency: 'GBP' })} (${changePercentage.toFixed(1)}%)`,
                confirmationMessage: `Confirmă modificarea bugetului pentru "${project.name}"?`,
            };
        }
    }

    return { valid: true };
}

/**
 * Validate create project
 */
async function validateCreateProject(
    params: any,
    context: ChatContext
): Promise<ValidationResult> {
    // Validate required fields
    if (!params.name || !params.name.trim()) {
        return {
            valid: false,
            error: 'Numele proiectului este obligatoriu.',
        };
    }

    // Validate client if provided
    if (params.clientId) {
        const client = await setCompanyContext(context.companyId);
        const { data: clientData, error } = await client
            .from('clients')
            .select('id, name')
            .eq('id', params.clientId)
            .eq('company_id', context.companyId)
            .single();

        if (error || !clientData) {
            return {
                valid: false,
                error: 'Clientul specificat nu a fost găsit.',
            };
        }
    }

    // Validate budget
    if (params.budget && params.budget < 0) {
        return {
            valid: false,
            error: 'Bugetul nu poate fi negativ.',
        };
    }

    // Validate dates
    if (params.startDate && params.endDate) {
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);

        if (end <= start) {
            return {
                valid: false,
                error: 'Data de finalizare trebuie să fie după data de start.',
            };
        }
    }

    return { valid: true };
}

/**
 * Generate confirmation token
 */
export function generateConfirmationToken(): string {
    return Math.random().toString(36).substring(2, 15);
}

/**
 * Validate confirmation token
 */
export function validateConfirmationToken(
    providedToken: string,
    expectedToken: string
): boolean {
    return providedToken === expectedToken;
}


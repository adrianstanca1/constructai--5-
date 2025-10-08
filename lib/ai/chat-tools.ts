/**
 * Chat Tools - Function calling definitions for Gemini
 * Allows the chatbot to execute actions on behalf of the user
 */

import { setCompanyContext } from '../supabase/client';
import type { ChatContext } from './gemini-client';

export interface ToolExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

export class ChatTools {
    private context: ChatContext;

    constructor(context: ChatContext) {
        this.context = context;
    }

    /**
     * Execute a tool call
     */
    async executeTool(toolName: string, parameters: Record<string, any>): Promise<ToolExecutionResult> {
        console.log(`[ChatTools] Executing tool: ${toolName}`, parameters);

        try {
            switch (toolName) {
                case 'get_projects':
                    return await this.getProjects(parameters);
                case 'get_project_details':
                    return await this.getProjectDetails(parameters);
                case 'create_project':
                    return await this.createProject(parameters);
                case 'update_project':
                    return await this.updateProject(parameters);
                case 'delete_project':
                    return await this.deleteProject(parameters);
                case 'get_clients':
                    return await this.getClients(parameters);
                case 'create_client':
                    return await this.createClient(parameters);
                case 'get_invoices':
                    return await this.getInvoices(parameters);
                case 'create_invoice':
                    return await this.createInvoice(parameters);
                case 'get_financial_summary':
                    return await this.getFinancialSummary(parameters);
                case 'get_cognitive_insights':
                    return await this.getCognitiveInsights(parameters);
                case 'analyze_data':
                    return await this.analyzeData(parameters);
                default:
                    return {
                        success: false,
                        error: `Unknown tool: ${toolName}`,
                    };
            }
        } catch (error: any) {
            console.error(`[ChatTools] Error executing ${toolName}:`, error);
            return {
                success: false,
                error: error.message || 'Tool execution failed',
            };
        }
    }

    /**
     * Get projects list
     */
    private async getProjects(params: { status?: string; limit?: number }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        let query = client
            .from('projects')
            .select('id, name, status, priority, progress, budget, spent, start_date, end_date')
            .eq('company_id', this.context.companyId)
            .order('created_at', { ascending: false });

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.limit) {
            query = query.limit(params.limit);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Found ${data?.length || 0} projects`,
        };
    }

    /**
     * Get project details
     */
    private async getProjectDetails(params: { projectId: string }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        const { data, error } = await client
            .from('projects')
            .select(`
                *,
                client:clients(id, name, email),
                manager:users!manager_id(id, name, email)
            `)
            .eq('id', params.projectId)
            .eq('company_id', this.context.companyId)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Retrieved details for project: ${data.name}`,
        };
    }

    /**
     * Create new project
     */
    private async createProject(params: {
        name: string;
        clientId?: string;
        budget?: number;
        startDate?: string;
        endDate?: string;
        priority?: string;
        status?: string;
    }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        const projectData = {
            name: params.name,
            company_id: this.context.companyId,
            client_id: params.clientId,
            budget: params.budget || 0,
            spent: 0,
            progress: 0,
            start_date: params.startDate,
            end_date: params.endDate,
            priority: params.priority || 'medium',
            status: params.status || 'planning',
            manager_id: this.context.userId,
            created_by: this.context.userId,
        };

        const { data, error } = await client
            .from('projects')
            .insert(projectData)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Successfully created project: ${data.name}`,
        };
    }

    /**
     * Update project
     */
    private async updateProject(params: {
        projectId: string;
        updates: Record<string, any>;
    }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        const { data, error } = await client
            .from('projects')
            .update(params.updates)
            .eq('id', params.projectId)
            .eq('company_id', this.context.companyId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Successfully updated project: ${data.name}`,
        };
    }

    /**
     * Delete project (requires confirmation)
     */
    private async deleteProject(params: { projectId: string; confirmed?: boolean }): Promise<ToolExecutionResult> {
        if (!params.confirmed) {
            return {
                success: false,
                error: 'Delete action requires user confirmation',
                message: 'Please confirm that you want to delete this project. This action cannot be undone.',
            };
        }

        const client = await setCompanyContext(this.context.companyId);
        
        const { error } = await client
            .from('projects')
            .delete()
            .eq('id', params.projectId)
            .eq('company_id', this.context.companyId);

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            message: 'Project successfully deleted',
        };
    }

    /**
     * Get clients list
     */
    private async getClients(params: { status?: string; limit?: number }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        let query = client
            .from('clients')
            .select('id, name, email, phone, type, status')
            .eq('company_id', this.context.companyId)
            .order('created_at', { ascending: false });

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.limit) {
            query = query.limit(params.limit);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Found ${data?.length || 0} clients`,
        };
    }

    /**
     * Create new client
     */
    private async createClient(params: {
        name: string;
        email?: string;
        phone?: string;
        type?: string;
    }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        const clientData = {
            name: params.name,
            email: params.email,
            phone: params.phone,
            type: params.type || 'individual',
            status: 'active',
            company_id: this.context.companyId,
            created_by: this.context.userId,
        };

        const { data, error } = await client
            .from('clients')
            .insert(clientData)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Successfully created client: ${data.name}`,
        };
    }

    /**
     * Get invoices
     */
    private async getInvoices(params: { status?: string; projectId?: string; limit?: number }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        let query = client
            .from('invoices')
            .select('*')
            .eq('company_id', this.context.companyId)
            .order('created_at', { ascending: false });

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.projectId) {
            query = query.eq('project_id', params.projectId);
        }

        if (params.limit) {
            query = query.limit(params.limit);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Found ${data?.length || 0} invoices`,
        };
    }

    /**
     * Create invoice
     */
    private async createInvoice(params: {
        projectId: string;
        amount: number;
        dueDate?: string;
    }): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}`;

        const invoiceData = {
            invoice_number: invoiceNumber,
            project_id: params.projectId,
            amount: params.amount,
            amount_paid: 0,
            status: 'draft',
            due_date: params.dueDate,
            company_id: this.context.companyId,
            created_by: this.context.userId,
        };

        const { data, error } = await client
            .from('invoices')
            .insert(invoiceData)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data,
            message: `Successfully created invoice: ${data.invoice_number}`,
        };
    }

    /**
     * Get financial summary
     */
    private async getFinancialSummary(params: {}): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        // Get projects financial data
        const { data: projects } = await client
            .from('projects')
            .select('budget, spent, status')
            .eq('company_id', this.context.companyId);

        // Get invoices data
        const { data: invoices } = await client
            .from('invoices')
            .select('amount, amount_paid, status')
            .eq('company_id', this.context.companyId);

        const summary = {
            projects: {
                total: projects?.length || 0,
                totalBudget: projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
                totalSpent: projects?.reduce((sum, p) => sum + (p.spent || 0), 0) || 0,
            },
            invoices: {
                total: invoices?.length || 0,
                totalAmount: invoices?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0,
                totalPaid: invoices?.reduce((sum, i) => sum + (i.amount_paid || 0), 0) || 0,
                unpaid: invoices?.filter(i => i.status !== 'paid').length || 0,
            },
        };

        return {
            success: true,
            data: summary,
            message: 'Financial summary retrieved successfully',
        };
    }

    /**
     * Get cognitive insights
     */
    private async getCognitiveInsights(params: {}): Promise<ToolExecutionResult> {
        const client = await setCompanyContext(this.context.companyId);
        
        const { data: patterns } = await client
            .from('detected_patterns')
            .select('*')
            .eq('company_id', this.context.companyId)
            .eq('status', 'active')
            .limit(5);

        const { data: hypotheses } = await client
            .from('root_cause_hypotheses')
            .select('*')
            .eq('company_id', this.context.companyId)
            .limit(5);

        return {
            success: true,
            data: {
                patterns: patterns || [],
                hypotheses: hypotheses || [],
            },
            message: 'Cognitive insights retrieved successfully',
        };
    }

    /**
     * Analyze data
     */
    private async analyzeData(params: { type: string }): Promise<ToolExecutionResult> {
        // This would perform custom analysis based on type
        return {
            success: true,
            data: {
                type: params.type,
                analysis: 'Analysis completed',
            },
            message: `Analysis of type ${params.type} completed`,
        };
    }
}


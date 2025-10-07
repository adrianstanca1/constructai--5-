import { GoogleGenAI, Type } from '@google/genai';
// Fix: Consolidated permission type imports to break a circular dependency.
import { 
    User, Project, Task, RFI, PunchListItem, Drawing, Document, SiteInstruction, DeliveryItem, DayworkSheet,
    Comment, Notification, ActivityEvent, Company, AISuggestion, AIInsight, AIFeedback, DailyLog, LogItem, Attachment,
    TimeEntry,
    PermissionAction,
    PermissionSubject
} from './types.ts';
import * as db from './db.ts';
import { supabase, getMyProfile } from './supabaseClient.ts';
import { can } from './permissions.ts';

// Simulate API latency
const LATENCY = 200;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fix: Initialized the Gemini API client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const checkPermissions = (user: User, action: PermissionAction, subject: PermissionSubject) => {
    if (!can(user.role, action, subject)) {
        throw new Error(`Permission denied. Role '${user.role}' cannot perform '${action}' on '${subject}'.`);
    }
};


// --- Auth ---
export const loginUser = async (email: string, password?: string): Promise<User | null> => {
    if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
        if (error) throw error;
        // After successful sign-in, getMyProfile will be called by the auth state change listener.
        // We call it here to ensure the user object is returned immediately for the login form.
        return getMyProfile();
    } else {
        // Mock implementation
        await delay(LATENCY * 2);
        const user = db.findUserByEmail(email);
        if (user) {
            return user;
        }
        return null;
    }
}

export const registerUser = async (details: { name: string, email: string, companyName: string, password?: string }): Promise<User | null> => {
    if (supabase) {
        // This is a simplified registration flow. A real app would have more robust company handling.
        const { data: companies } = await supabase.from('companies').select('id').eq('name', details.companyName).limit(1);
        let companyId;

        if (companies && companies.length > 0) {
            companyId = companies[0].id;
        } else {
            const { data: newCompany, error: companyError } = await supabase.from('companies').insert({ name: details.companyName }).select('id').single();
            if (companyError) throw companyError;
            companyId = newCompany.id;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: details.email,
            password: details.password || '',
        });

        if (signUpError) throw signUpError;

        if (data.user) {
             const { error: profileError } = await supabase.from('profiles').insert({
                 id: data.user.id,
                 name: details.name,
                 email: details.email,
                 role: 'Project Manager', // default role
                 company_id: companyId,
                 avatar: `https://i.pravatar.cc/150?u=${details.email}`,
             });
             if(profileError) throw profileError;

            // Immediately log in the new user to create a session
            return loginUser(details.email, details.password);
        }
        return null;

    } else {
        // Mock implementation
        await delay(LATENCY * 3);
        if (db.findUserByEmail(details.email)) {
            throw new Error("User with this email already exists.");
        }
        
        let company = db.findCompanyByName(details.companyName);
        if (!company) {
            const newCompany: Company = {
                id: `comp-${Date.now()}`,
                name: details.companyName,
            };
            db.addCompany(newCompany);
            company = newCompany;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: details.name,
            email: details.email,
            role: 'Project Manager', // New users default to Project Manager for demo purposes
            avatar: `https://i.pravatar.cc/150?u=${details.email}`,
            companyId: company.id,
        };
        db.addUser(newUser);

        return newUser;
    }
};


// --- User & Company ---
export const fetchUsers = async (): Promise<User[]> => {
    await delay(LATENCY);
    return db.getUsers();
};

export const fetchUsersByCompany = async (companyId: string): Promise<User[]> => {
    await delay(LATENCY);
    return db.getUsers().filter(u => u.companyId === companyId);
};

export const fetchCompanies = async (currentUser: User): Promise<Company[]> => {
    await delay(LATENCY);
    if (currentUser.role === 'super_admin') {
        return db.getCompanies();
    }
    return db.getCompanies().filter(c => c.id === currentUser.companyId);
};

// --- Projects ---
export const fetchAllProjects = async (currentUser: User): Promise<Project[]> => {
    await delay(LATENCY);
    if (currentUser.role === 'super_admin') {
        return db.getProjects();
    }
    return db.getProjects().filter(p => p.companyId === currentUser.companyId);
};

export const fetchProjectById = async (id: string): Promise<Project | null> => {
    await delay(LATENCY);
    return db.findProject(id);
};

// --- Tasks ---
export const fetchTasksForProject = async (projectId: string, currentUser: User): Promise<Task[]> => {
    await delay(LATENCY);
    checkPermissions(currentUser, 'read', 'task');
    return db.getTasks().filter(t => t.projectId === projectId);
};

export const fetchTasksForUser = async (user: User): Promise<Task[]> => {
    await delay(LATENCY);
    return db.getTasks().filter(t => t.assignee === user.name || t.targetRoles?.includes(user.role));
};

export const fetchTaskById = async (id: string): Promise<Task | null> => {
    await delay(LATENCY);
    return db.findTask(id);
};

export const createTask = async (taskData: Omit<Task, 'id' | 'comments' | 'history'>, creator: User): Promise<Task> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'task');
    const newTask: Task = {
        id: `task-${Date.now()}`,
        comments: [],
        history: [{
            timestamp: new Date().toISOString(),
            author: creator.name,
            change: 'Created task.'
        }],
        ...taskData
    };
    db.addTask(newTask);

    // If task is assigned to a role, notify all users with that role in the company
    if (newTask.targetRoles && newTask.targetRoles.length > 0) {
        const project = db.findProject(newTask.projectId);
        if (project) {
            const usersToNotify = db.getUsers().filter(u => 
                u.companyId === project.companyId && 
                newTask.targetRoles?.includes(u.role)
            );

            usersToNotify.forEach(user => {
                 db.addNotification({
                    userId: user.id,
                    message: `New task for your role (${newTask.targetRoles?.join(', ')}): "${newTask.title}"`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    link: { projectId: newTask.projectId, screen: 'task-detail', params: { taskId: newTask.id } }
                });
            });
        }
    }


    return newTask;
};

export const updateTask = async (updatedTask: Task, user: User): Promise<Task> => {
    await delay(LATENCY);
    checkPermissions(user, 'update', 'task');
    const { task: originalTask, index } = db.findTaskAndIndex(updatedTask.id);
    
    if (index !== -1 && originalTask) {
        const taskWithHistory = { ...updatedTask };
        if (!taskWithHistory.history) {
            taskWithHistory.history = originalTask.history ? [...originalTask.history] : [];
        }

        // Log status change
        if (originalTask.status !== taskWithHistory.status) {
            // Business logic: a Foreman or operative cannot move a task backward from "In Progress"
            if ((user.role === 'Foreman' || user.role === 'operative') && originalTask.status === 'In Progress' && taskWithHistory.status === 'To Do') {
                throw new Error('You do not have permission to move this task back to "To Do".');
            }

            taskWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed status from ${originalTask.status} to ${taskWithHistory.status}.`
            });

            const project = db.findProject(taskWithHistory.projectId);
            const activity: ActivityEvent = {
                id: `ae-${Date.now()}`,
                type: 'status_change',
                author: user.name,
                description: `updated task "${taskWithHistory.title}" to ${taskWithHistory.status}.`,
                timestamp: new Date().toISOString(),
                projectId: taskWithHistory.projectId,
                projectName: project?.name || 'Unknown Project',
                link: { screen: 'task-detail', params: { taskId: taskWithHistory.id } }
            };
            db.addActivityEvent(activity);
        }

        // Log assignee change
        const formatAssigneeString = (task: Task): string => {
            if (task.assignee) return task.assignee;
            if (task.targetRoles && task.targetRoles.length > 0) return `Role: ${task.targetRoles[0]}`;
            return 'Unassigned';
        };

        const originalAssignee = formatAssigneeString(originalTask);
        const updatedAssignee = formatAssigneeString(taskWithHistory);
        if (originalAssignee !== updatedAssignee) {
            taskWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed assignee from ${originalAssignee} to ${updatedAssignee}.`
            });
        }
        
        db.updateTaskInDb(index, taskWithHistory);
        return taskWithHistory;
    }
    return updatedTask;
};

export const addCommentToTask = async (taskId: string, text: string, attachments: Attachment[], author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text,
        attachments
    };
    const task = db.addCommentToTaskInDb(taskId, newComment);
    
    if (task) {
        const project = db.findProject(task.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on task "${task.title}".`,
            timestamp: new Date().toISOString(),
            projectId: task.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'task-detail', params: { taskId: task.id } }
        };
        db.addActivityEvent(activity);
    }
    
    return newComment;
};

// --- RFIs ---
export const fetchRFIsForProject = async (projectId: string): Promise<RFI[]> => {
    await delay(LATENCY);
    return db.getRFIs().filter(r => r.projectId === projectId);
};

export const fetchRFIById = async (id: string): Promise<RFI | null> => {
    await delay(LATENCY);
    return db.findRFI(id);
};

export const fetchRFIVersions = async (rfiNumber: string): Promise<RFI[]> => {
    await delay(LATENCY);
    return db.getRFIs().filter(r => r.rfiNumber === rfiNumber).sort((a, b) => a.version - b.version);
};

export const createRFI = async (rfiData: Omit<RFI, 'id' | 'rfiNumber' | 'version' | 'comments'| 'answeredBy' | 'dueDateNotified' | 'response' | 'createdBy' | 'history' | 'responseAttachments'>, createdBy: User): Promise<RFI> => {
    await delay(LATENCY);
    checkPermissions(createdBy, 'create', 'rfi');
    
    const projectRFIs = db.getRFIs().filter(r => r.projectId === rfiData.projectId);
    const nextRfiNum = `RFI-${String(projectRFIs.length + 1).padStart(3, '0')}`;
    
    const newRFI: RFI = {
        id: `rfi-${Date.now()}`,
        rfiNumber: nextRfiNum,
        version: 1,
        comments: [],
        createdBy: createdBy.id,
        dueDateNotified: false,
        history: [{
            timestamp: new Date().toISOString(),
            author: createdBy.name,
            change: 'Created RFI.'
        }],
        ...rfiData
    };
    db.addRFI(newRFI);
    return newRFI;
};

export const updateRFI = async (rfiId: string, updates: Partial<Pick<RFI, 'question' | 'attachments'>>, user: User): Promise<RFI> => {
    await delay(LATENCY);
    checkPermissions(user, 'update', 'rfi');
    const originalRfi = db.findRFI(rfiId);
    if (!originalRfi) {
        throw new Error('RFI not found');
    }

    const newVersion: RFI = {
        ...originalRfi,
        id: `rfi-${Date.now()}`,
        version: originalRfi.version + 1,
        ...updates,
        history: [
            ...(originalRfi.history || []),
            {
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Updated RFI to version ${originalRfi.version + 1}.`,
            },
        ],
    };

    db.addRFI(newVersion);
    return newVersion;
};


export const addCommentToRFI = async (rfiId: string, text: string, author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text
    };
    const rfi = db.addCommentToRFIInDb(rfiId, newComment);

    if (rfi) {
        const project = db.findProject(rfi.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on RFI "${rfi.subject}".`,
            timestamp: new Date().toISOString(),
            projectId: rfi.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'rfi-detail', params: { rfiId: rfi.id } }
        };
        db.addActivityEvent(activity);
    }

    return newComment;
};

export const addAnswerToRFI = async (rfiId: string, answer: string, attachments: Attachment[], author: User): Promise<RFI | null> => {
    await delay(LATENCY);
    checkPermissions(author, 'update', 'rfi');
    const rfi = db.findRFI(rfiId);
    if (rfi) {
        rfi.response = answer;
        rfi.answeredBy = author.name;
        rfi.status = 'Closed';
        rfi.responseAttachments = attachments;

        if (!rfi.history) {
            rfi.history = [];
        }
        rfi.history.push({
            timestamp: new Date().toISOString(),
            author: author.name,
            change: 'Answered RFI and changed status to Closed.'
        });


        // Notify the creator
        if (rfi.createdBy) {
            db.addNotification({
                userId: rfi.createdBy,
                message: `Your RFI "${rfi.subject}" has been answered.`,
                timestamp: new Date().toISOString(),
                read: false,
                link: { projectId: rfi.projectId, screen: 'rfi-detail', params: { rfiId: rfi.id } }
            });
        }
        return rfi;
    }
    return null;
}

// --- Punch List ---
export const fetchPunchListItemsForProject = async (projectId: string): Promise<PunchListItem[]> => {
    await delay(LATENCY);
    return db.getPunchListItems().filter(i => i.projectId === projectId);
};

export const fetchPunchListItemById = async (id: string): Promise<PunchListItem | null> => {
    await delay(LATENCY);
    return db.findPunchListItem(id);
};

export const createPunchListItem = async (itemData: Omit<PunchListItem, 'id' | 'comments' | 'history'>, creator: User): Promise<PunchListItem> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'punchListItem');
    const newItem: PunchListItem = {
        id: `pl-${Date.now()}`,
        comments: [],
        history: [{
            timestamp: new Date().toISOString(),
            author: creator.name,
            change: 'Created item.'
        }],
        ...itemData
    };
    db.addPunchListItem(newItem);
    return newItem;
};

export const updatePunchListItem = async (updatedItem: PunchListItem, user: User): Promise<PunchListItem> => {
    await delay(LATENCY);
    checkPermissions(user, 'update', 'punchListItem');
    const { index, item: originalItem } = db.findPunchListItemAndIndex(updatedItem.id);
    if (index !== -1 && originalItem) {
        const itemWithHistory = { ...updatedItem };
        if (!itemWithHistory.history) {
            itemWithHistory.history = originalItem.history ? [...originalItem.history] : [];
        }

        // Log status change
        if (originalItem.status !== itemWithHistory.status) {
            itemWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed status from ${originalItem.status} to ${itemWithHistory.status}.`
            });
        }

        // Log assignee change
        if (originalItem.assignee !== itemWithHistory.assignee) {
             itemWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed assignee from ${originalItem.assignee} to ${itemWithHistory.assignee}.`
            });
        }

        db.updatePunchListItemInDb(index, itemWithHistory);
        return itemWithHistory;
    }
    throw new Error('Could not update punch list item.');
};

export const addCommentToPunchListItem = async (itemId: string, text: string, author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text
    };
    const item = db.addCommentToPunchListItemInDb(itemId, newComment);
    if (item) {
        const project = db.findProject(item.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on punch list item "${item.title}".`,
            timestamp: new Date().toISOString(),
            projectId: item.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'punch-list-item-detail', params: { itemId: item.id } }
        };
        db.addActivityEvent(activity);
    }
    return newComment;
};


// --- Drawings, Documents, etc. ---
export const fetchDrawings = async (): Promise<Drawing[]> => {
    await delay(LATENCY);
    return db.getDrawings();
};

export const createDrawing = async (projectId: string, drawingData: { drawingNumber: string; title: string; date: string; file: File }, creator: User): Promise<Drawing> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'drawing');

    const existingDrawings = db.getDrawings().filter(d => d.projectId === projectId && d.drawingNumber === drawingData.drawingNumber);
    const latestRevision = existingDrawings.reduce((max, d) => Math.max(max, d.revision), -1);

    const tags = await analyzeDrawingAndGenerateTags({ title: drawingData.title, number: drawingData.drawingNumber });

    const newDrawing: Drawing = {
        id: `dwg-${Date.now()}`,
        projectId,
        drawingNumber: drawingData.drawingNumber,
        title: drawingData.title,
        revision: latestRevision + 1,
        date: drawingData.date,
        url: '/sample.pdf', // In real app, this would be a storage URL
        tags: tags,
    };
    db.addDrawing(newDrawing);
    return newDrawing;
};

export const fetchDocuments = async (): Promise<Document[]> => {
    await delay(LATENCY);
    return db.getDocuments();
};

export const fetchSiteInstructions = async (): Promise<SiteInstruction[]> => {
    await delay(LATENCY);
    return db.getSiteInstructions();
};

export const fetchDeliveryItems = async (): Promise<DeliveryItem[]> => {
    await delay(LATENCY);
    return db.getDeliveryItems();
};

// --- Daywork Sheets (T&M) ---
export const fetchDayworkSheetsForProject = async (projectId: string): Promise<DayworkSheet[]> => {
    await delay(LATENCY);
    return db.getDayworkSheets().filter(s => s.projectId === projectId);
};

export const fetchDayworkSheetById = async (id: string): Promise<DayworkSheet | null> => {
    await delay(LATENCY);
    return db.findDayworkSheet(id);
};

export const createDayworkSheet = async (sheetData: Omit<DayworkSheet, 'id' | 'ticketNumber' | 'status' | 'items' | 'approvedBy' | 'approvedDate'>, creator: User): Promise<DayworkSheet> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'dayworkSheet');

    const projectSheets = db.getDayworkSheets().filter(s => s.projectId === sheetData.projectId);
    const nextTicketNum = `T&M-${String(projectSheets.length + 1).padStart(3, '0')}`;

    const newSheet: DayworkSheet = {
        id: `dws-${Date.now()}`,
        ticketNumber: nextTicketNum,
        status: 'Pending',
        items: [],
        approvedBy: null,
        approvedDate: null,
        ...sheetData
    };

    db.addDayworkSheet(newSheet);
    db.addDayworkLedgerItem(newSheet); // Add to company ledger
    return newSheet;
};

export const updateDayworkSheetStatus = async (sheetId: string, status: 'Approved' | 'Rejected', user: User): Promise<DayworkSheet | null> => {
    await delay(LATENCY);
    checkPermissions(user, 'approve', 'dayworkSheet');
    const sheet = db.findDayworkSheet(sheetId);
    if (sheet && sheet.status === 'Pending') {
        sheet.status = status;
        if (status === 'Approved') {
            sheet.approvedBy = user.name;
            sheet.approvedDate = new Date().toISOString();
        }
        return sheet;
    }
    return null;
};

// --- Daily Logs ---
export const fetchDailyLogForUser = async (userId: string, date: string): Promise<DailyLog | null> => {
    await delay(LATENCY);
    return db.findDailyLogsForUserAndDate(userId, date) || null;
};

export const createDailyLog = async (logData: Omit<DailyLog, 'id' | 'submittedAt'>, creator: User): Promise<DailyLog> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'dailyLog');
    const newLog: DailyLog = {
        id: `log-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        ...logData
    };
    db.addDailyLog(newLog);
    const project = db.findProject(newLog.projectId);
    db.addActivityEvent({
        id: `ae-${Date.now()}`,
        type: 'log_submitted',
        author: creator.name,
        description: `submitted a daily log.`,
        timestamp: new Date().toISOString(),
        projectId: newLog.projectId,
        projectName: project?.name || 'Unknown Project',
        link: { screen: 'daily-log', params: {} } // Needs a way to link to a specific log
    });
    return newLog;
};

// --- Time Tracking ---
export const fetchTimeEntriesForUser = async (userId: string): Promise<TimeEntry[]> => {
    await delay(LATENCY);
    return db.getTimeEntries().filter(e => e.userId === userId);
};

export const startTimeEntry = async (taskId: string, projectId: string, userId: string): Promise<TimeEntry> => {
    await delay(LATENCY);
    const newEntry: TimeEntry = {
        id: `te-${Date.now()}`,
        projectId,
        taskId,
        userId,
        startTime: new Date().toISOString(),
        endTime: null,
    };
    db.addTimeEntry(newEntry);
    return newEntry;
};

export const stopTimeEntry = async (entryId: string): Promise<TimeEntry> => {
    await delay(LATENCY);
    const updatedEntry = db.updateTimeEntryInDb(entryId, { endTime: new Date().toISOString() });
    if (!updatedEntry) throw new Error("Could not find time entry to stop.");
    return updatedEntry;
};

// --- Notifications & Activity ---
export const fetchNotificationsForUser = async (currentUser: User): Promise<Notification[]> => {
    await delay(LATENCY);
    return db.getNotifications()
        .filter(n => n.userId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const markNotificationsAsRead = async (ids: string[], currentUser: User): Promise<void> => {
    await delay(LATENCY / 2);
    // In a real app, you'd also check ownership here on the backend
    db.markNotificationsAsReadInDb(ids);
};

export const fetchRecentActivity = async (currentUser: User): Promise<ActivityEvent[]> => {
    await delay(LATENCY);
    const userProjects = db.getProjects().filter(p => p.companyId === currentUser.companyId).map(p => p.id);
    return db.getActivityEvents()
        .filter(event => userProjects.includes(event.projectId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const checkAndCreateDueDateNotifications = async (currentUser: User): Promise<void> => {
    await delay(LATENCY);
    const userTasks = db.getTasks().filter(t => 
        (t.assignee === currentUser.name || t.targetRoles?.includes(currentUser.role)) &&
        t.status !== 'Done' &&
        !t.dueDateNotified
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    userTasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let shouldNotify = false;
        let message = '';

        if (daysUntilDue < 0) {
            shouldNotify = true;
            message = `Task "${task.title}" is overdue by ${Math.abs(daysUntilDue)} day(s).`;
        } else if (daysUntilDue <= 3) {
            shouldNotify = true;
            message = `Task "${task.title}" is due in ${daysUntilDue} day(s).`;
        }

        if (shouldNotify) {
            db.addNotification({
                userId: currentUser.id,
                message: message,
                timestamp: new Date().toISOString(),
                read: false,
                link: { projectId: task.projectId, screen: 'task-detail', params: { taskId: task.id } }
            });
            const { index } = db.findTaskAndIndex(task.id);
            if (index !== -1) {
                db.updateTaskInDb(index, { ...task, dueDateNotified: true });
            }
        }
    });
};


// --- AI Features ---

export const getAISuggestedAction = async (user: User): Promise<AISuggestion | null> => {
    await delay(LATENCY * 4);

    const feedback = db.getAIFeedbackForUser(user.id);
    const dislikesOverdue = feedback.filter(f => f.feedback === 'down' && f.suggestionReason.includes('overdue')).length > 2;

    const userTasks = db.getTasks().filter(t => (t.assignee === user.name || t.targetRoles?.includes(user.role)) && t.status !== 'Done');
    const overdueTasks = userTasks.filter(t => new Date(t.dueDate) < new Date());

    if (overdueTasks.length > 0) {
        const task = overdueTasks[0];
        if (dislikesOverdue) {
             return {
                title: 'Help Unblock a Task',
                reason: `Task "${task.title}" is overdue. Sometimes adding a photo or a comment can help clarify the issue.`,
                action: {
                    label: 'Add Comment/Photo',
                    link: { projectId: task.projectId, screen: 'task-detail', params: { taskId: task.id } }
                }
            };
        }
        return {
            title: 'Focus on Overdue Task',
            reason: `Your task "${task.title}" is overdue. It's a high priority.`,
            action: {
                label: 'View Task',
                link: { projectId: task.projectId, screen: 'task-detail', params: { taskId: task.id } }
            }
        };
    }
    
    const pendingRFIs = db.getRFIs().filter(rfi => rfi.createdBy === user.id && rfi.status === 'Open');
    if (pendingRFIs.length > 0) {
        const rfi = pendingRFIs[0];
        return {
            title: 'Follow up on RFI',
            reason: `You're waiting for a response on "${rfi.subject}".`,
            action: {
                label: 'View RFI',
                link: { projectId: rfi.projectId, screen: 'rfi-detail', params: { rfiId: rfi.id } }
            }
        };
    }
    
    return null;
};

export const getAIInsightsForMyDay = async (tasks: Task[], project: Project, weather: any): Promise<AIInsight[]> => {
    await delay(LATENCY * 3);
    const insights: AIInsight[] = [];
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done');
    if (overdue.length > 0) {
        insights.push({
            type: 'risk',
            title: 'Overdue Task Alert',
            message: `You have ${overdue.length} overdue task(s). Prioritize "${overdue[0].title}" to avoid project delays.`
        });
    }
    
    if (weather.condition.toLowerCase().includes('rain')) {
         insights.push({
            type: 'alert',
            title: 'Weather Alert: Rain',
            message: 'Rain is in the forecast. Ensure all materials are covered and site is secure.'
        });
    }

    if (tasks.length > 5) {
         insights.push({
            type: 'tip',
            title: 'Productivity Tip',
            message: 'You have a busy day! Tackle your highest priority task first to build momentum.'
        });
    }
    
    return insights;
};

export const submitAIFeedback = async (suggestion: AISuggestion, feedback: 'up' | 'down', user: User): Promise<void> => {
    await delay(LATENCY);
    const feedbackItem: AIFeedback = {
        id: `fb-${Date.now()}`,
        suggestionTitle: suggestion.title,
        suggestionReason: suggestion.reason,
        feedback,
        timestamp: new Date().toISOString(),
        userId: user.id
    };
    db.addAIFeedback(feedbackItem);
};

export const getAITaskSuggestions = async (description: string, allUsers: User[]): Promise<{ suggestedAssigneeIds: string[], suggestedDueDate: string, photosRecommended: boolean } | null> => {
    const prompt = `
        Analyze the following task description and suggest an assignee, due date, and if photos are recommended.
        Description: "${description}"

        Available Users and their roles:
        ${allUsers.map(u => `- ${u.name} (ID: ${u.id}, Role: ${u.role})`).join('\n')}

        Keywords for roles:
        - Plumbing, electrical, mechanical, HVAC: Suggest an 'operative'.
        - Inspection, safety, hazard: Suggest a 'Safety Officer'.
        - Coordination, schedule, meeting, report: Suggest a 'Project Manager'.
        - Installation, drywall, concrete, framing, site work: Suggest a 'Foreman'.
        
        Keywords for photos:
        - install, inspect, repair, verify, existing condition, damage, complete

        Due Date Logic:
        - If it mentions "today" or "ASAP", suggest today's date.
        - If it mentions "tomorrow", suggest tomorrow's date.
        - If it mentions "end of week", suggest the coming Friday.
        - Otherwise, suggest 3 days from now.

        Current date: ${new Date().toISOString().split('T')[0]}

        Respond ONLY with a JSON object in the format:
        {
          "suggestedAssigneeIds": ["user-id-1", "user-id-2"],
          "suggestedDueDate": "YYYY-MM-DD",
          "photosRecommended": boolean
        }
        If you cannot determine a value, use an empty array, empty string, or false.
        The suggestedAssigneeIds should be ordered from most to least likely.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedAssigneeIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedDueDate: { type: Type.STRING },
                        photosRecommended: { type: Type.BOOLEAN }
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (e) {
        console.error("Gemini API call failed", e);
        return null;
    }
};

export const getAIRFISuggestions = async (subject: string, question: string, possibleAssignees: string[]): Promise<{ suggestedAssignee: string, suggestedDueDate: string } | null> => {
    await delay(LATENCY * 4);
    // Mock AI logic
    let suggestedAssignee = '';
    const text = (subject + ' ' + question).toLowerCase();
    if (text.includes('structural') || text.includes('beam') || text.includes('column') || text.includes('foundation')) {
        suggestedAssignee = 'Structural Engineer';
    } else if (text.includes('architectural') || text.includes('finish') || text.includes('window') || text.includes('door')) {
        suggestedAssignee = 'Architect Team';
    } else if (text.includes('hvac') || text.includes('plumbing') || text.includes('electrical')) {
        suggestedAssignee = 'MEP Consultant';
    }
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    return {
        suggestedAssignee: possibleAssignees.includes(suggestedAssignee) ? suggestedAssignee : '',
        suggestedDueDate: dueDate.toISOString().split('T')[0]
    };
};

export const analyzeDrawingAndGenerateTags = async (drawing: { title: string, number: string }): Promise<string[]> => {
    const prompt = `
        Analyze the following drawing title and number to generate relevant search tags.
        Title: "${drawing.title}"
        Number: "${drawing.number}"

        Rules:
        - Extract the discipline (e.g., Architectural, Structural, Mechanical, Electrical, Plumbing, Civil). The discipline is usually the first letter of the drawing number (A, S, M, E, P, C).
        - Extract keywords from the title (e.g., "Floor Plan", "Elevation", "Section", "Details", "Framing", "Site Plan").
        - Extract the floor or level number if present (e.g., "Level 1", "Floor 10", "Roof").
        - If the title contains "For Construction" or "Permit Set", add those as tags.
        - Keep tags concise (1-2 words). Capitalize the first letter of each word.

        Respond ONLY with a JSON array of strings, like this:
        ["Tag 1", "Tag 2", "Tag 3"]
    `;
    
     try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                 responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const aiTags = JSON.parse(jsonStr);

        // If AI returns an empty array, trigger the fallback.
        if (!aiTags || aiTags.length === 0) {
            throw new Error("AI returned no tags.");
        }
        return aiTags;

    } catch (e) {
        console.warn("Gemini API call for drawing analysis failed or returned empty. Using fallback tagging.", e);
        
        // Robust Fallback Logic
        const tags = new Set<string>();
        const combinedText = `${drawing.title} ${drawing.number}`.toLowerCase();

        // 1. Discipline Tagging
        const disciplineMap: {[key: string]: string} = {'A': 'Architectural', 'S': 'Structural', 'M': 'Mechanical', 'E': 'Electrical', 'P': 'Plumbing', 'C': 'Civil'};
        const firstLetter = drawing.number.charAt(0).toUpperCase();
        if (disciplineMap[firstLetter]) {
            tags.add(disciplineMap[firstLetter]);
        }

        // 2. Level/Floor Tagging
        const levelRegex = /(?:level|floor|lvl)[\s-]*(\d+)/i;
        const levelMatch = combinedText.match(levelRegex);
        if (levelMatch && levelMatch[1]) {
            tags.add(`Level ${levelMatch[1]}`);
        }

        // 3. Keyword Tagging
        const keywords = ["Floor Plan", "Elevation", "Section", "Details", "Framing", "Site Plan", "Roof", "Foundation", "For Construction", "Permit Set"];
        keywords.forEach(keyword => {
            if (combinedText.includes(keyword.toLowerCase())) {
                tags.add(keyword);
            }
        });

        return Array.from(tags);
    }
};

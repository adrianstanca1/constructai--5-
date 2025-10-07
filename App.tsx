import React, { useState, useEffect, useCallback } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion, PermissionAction, PermissionSubject } from './types.ts';
import * as api from './api.ts';
import AuthScreen from './components/screens/AuthScreen.tsx';
import AppLayout from './components/layout/AppLayout.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import { MOCK_PROJECT } from './constants.ts';
import AISuggestionModal from './components/modals/AISuggestionModal.tsx';
import ProjectSelectorModal from './components/modals/ProjectSelectorModal.tsx';
import FloatingMenu from './components/layout/FloatingMenu.tsx';
import { supabase, getMyProfile } from './supabaseClient.ts';
import { usePermissions } from './hooks/usePermissions.ts';

// Screen Components
import UnifiedDashboardScreen from './components/screens/UnifiedDashboardScreen.tsx';
import ProjectsListScreen from './components/screens/ProjectsListScreen.tsx';
import ProjectHomeScreen from './components/screens/ProjectHomeScreen.tsx';
import MyDayScreen from './components/screens/MyDayScreen.tsx';
import TasksScreen from './components/screens/TasksScreen.tsx';
import TaskDetailScreen from './components/screens/TaskDetailScreen.tsx';
import NewTaskScreen from './components/screens/NewTaskScreen.tsx';
import DailyLogScreen from './components/screens/DailyLogScreen.tsx';
import PhotoGalleryScreen from './components/screens/PhotoGalleryScreen.tsx';
import RFIsScreen from './components/screens/RFIsScreen.tsx';
import RFIDetailScreen from './components/screens/RFIDetailScreen.tsx';
import NewRFIScreen from './components/screens/NewRFIScreen.tsx';
import PunchListScreen from './components/screens/PunchListScreen.tsx';
import PunchListItemDetailScreen from './components/screens/PunchListItemDetailScreen.tsx';
import NewPunchListItemScreen from './components/screens/NewPunchListItemScreen.tsx';
import DrawingsScreen from './components/screens/DrawingsScreen.tsx';
import PlansViewerScreen from './components/screens/PlansViewerScreen.tsx';
import DayworkSheetsListScreen from './components/screens/DayworkSheetsListScreen.tsx';
import DayworkSheetDetailScreen from './components/screens/DayworkSheetDetailScreen.tsx';
import NewDayworkSheetScreen from './components/screens/NewDayworkSheetScreen.tsx';
import DocumentsScreen from './components/screens/DocumentsScreen.tsx';
import DeliveryScreen from './components/screens/DeliveryScreen.tsx';
import DrawingComparisonScreen from './components/screens/DrawingComparisonScreen.tsx';

// Module Screens
import AccountingScreen from './components/screens/modules/AccountingScreen.tsx';
import AIToolsScreen from './components/screens/modules/AIToolsScreen.tsx';
import DocumentManagementScreen from './components/screens/modules/DocumentManagementScreen.tsx';
import TimeTrackingScreen from './components/screens/modules/TimeTrackingScreen.tsx';
import ProjectOperationsScreen from './components/screens/modules/ProjectOperationsScreen.tsx';
import FinancialManagementScreen from './components/screens/modules/FinancialManagementScreen.tsx';
import BusinessDevelopmentScreen from './components/screens/modules/BusinessDevelopmentScreen.tsx';
import PlaceholderToolScreen from './components/screens/tools/PlaceholderToolScreen.tsx';


type NavigationItem = {
    screen: Screen;
    params?: any;
    project?: Project;
};

const SCREEN_COMPONENTS: { [key in Screen]: React.FC<any> } = {
    'global-dashboard': UnifiedDashboardScreen,
    'projects': ProjectsListScreen,
    'project-home': ProjectHomeScreen,
    'my-day': MyDayScreen,
    'tasks': TasksScreen,
    'task-detail': TaskDetailScreen,
    'new-task': NewTaskScreen,
    'daily-log': DailyLogScreen,
    'photos': PhotoGalleryScreen,
    'rfis': RFIsScreen,
    'rfi-detail': RFIDetailScreen,
    'new-rfi': NewRFIScreen,
    'punch-list': PunchListScreen,
    'punch-list-item-detail': PunchListItemDetailScreen,
    'new-punch-list-item': NewPunchListItemScreen,
    'drawings': DrawingsScreen,
    'plans': PlansViewerScreen,
    'daywork-sheets': DayworkSheetsListScreen,
    'daywork-sheet-detail': DayworkSheetDetailScreen,
    'new-daywork-sheet': NewDayworkSheetScreen,
    'documents': DocumentsScreen,
    'delivery': DeliveryScreen,
    'drawing-comparison': DrawingComparisonScreen,
    // Modules
    'accounting': AccountingScreen,
    'ai-tools': AIToolsScreen,
    'document-management': DocumentManagementScreen,
    'time-tracking': TimeTrackingScreen,
    'project-operations': ProjectOperationsScreen,
    'financial-management': FinancialManagementScreen,
    'business-development': BusinessDevelopmentScreen,
    // Tools
    'placeholder-tool': PlaceholderToolScreen,
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);

    const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
    const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
    
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [projectSelectorCallback, setProjectSelectorCallback] = useState<(projectId: string) => void>(() => () => {});
    const [projectSelectorTitle, setProjectSelectorTitle] = useState('');

    const { can } = usePermissions(currentUser!);

    useEffect(() => {
        // If supabase is not configured, we rely on mock login/logout and skip session checks.
        if (!supabase) {
            setSessionChecked(true);
            return;
        }

        const checkSession = async () => {
            const profile = await getMyProfile();
            setCurrentUser(profile);
            if (profile) {
                window.dispatchEvent(new CustomEvent('userLoggedIn'));
            }
            setSessionChecked(true);
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const profile = await getMyProfile();
            setCurrentUser(profile);
            if (profile) {
                window.dispatchEvent(new CustomEvent('userLoggedIn'));
            } else {
                window.dispatchEvent(new CustomEvent('userLoggedOut'));
            }
        });

        return () => subscription.unsubscribe();
    }, []);


    useEffect(() => {
        if (currentUser) {
            const loadProjects = async () => {
                const projects = await api.fetchAllProjects(currentUser);
                setAllProjects(projects);
            };
            loadProjects();
            if (navigationStack.length === 0) {
              navigateToModule('global-dashboard');
            }
        } else {
            setNavigationStack([]);
            setAllProjects([]);
        }
    }, [currentUser]);
    
    useEffect(() => {
        const handleLogoutTrigger = () => {
            handleLogout();
        };
        window.addEventListener('userLoggedOutTrigger', handleLogoutTrigger);
        return () => window.removeEventListener('userLoggedOutTrigger', handleLogoutTrigger);
    }, []);

    const handleLoginSuccess = (user: User) => {
        // This is primarily for the mock auth flow.
        // In the Supabase flow, onAuthStateChange is the source of truth,
        // so we only manually set the user if Supabase is not configured.
        if (!supabase) {
            setCurrentUser(user);
            window.dispatchEvent(new CustomEvent('userLoggedIn'));
        }
    };

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setCurrentUser(null);
        // userLoggedOut event is handled by onAuthStateChange if supabase is active,
        // but needs to be fired manually for the mock flow.
        if (!supabase) {
            window.dispatchEvent(new CustomEvent('userLoggedOut'));
        }
    };

    const navigateTo = useCallback(async (screen: Screen, params: any = {}) => {
        const currentProject = navigationStack[navigationStack.length - 1]?.project;
        setNavigationStack(prev => [...prev, { screen, params, project: currentProject }]);
    }, [navigationStack]);

    const navigateToModule = useCallback((screen: Screen, params: any = {}) => {
        setNavigationStack([{ screen, params, project: undefined }]);
    }, []);
    
    const goBack = useCallback(() => {
        if (navigationStack.length > 1) {
            setNavigationStack(prev => prev.slice(0, -1));
        }
    }, [navigationStack]);

    const goHome = useCallback(() => {
        if (currentUser) {
            const currentProject = navigationStack[navigationStack.length - 1]?.project;
            if (currentProject) {
                setNavigationStack(prev => [prev[0], { screen: 'project-home', project: currentProject }]);
            } else {
                navigateToModule('global-dashboard');
            }
        }
    }, [currentUser, navigationStack, navigateToModule]);

    const selectProject = useCallback(async (projectId: string) => {
        const project = await api.fetchProjectById(projectId);
        if (project) {
            setNavigationStack([{ screen: 'project-home', project }]);
        }
    }, []);
    
    const handleDeepLink = useCallback(async (projectId: string | null, screen: Screen, params: any) => {
        if (projectId && currentUser) {
            const project = allProjects.find(p => p.id === projectId) || await api.fetchProjectById(projectId);
            if (project) {
                 setNavigationStack([
                    { screen: 'project-home', project },
                    { screen, params, project }
                ]);
            }
        } else {
            navigateTo(screen, params);
        }
    }, [allProjects, navigateTo, currentUser]);

    const openProjectSelector = useCallback((title: string, onSelect: (projectId: string) => void) => {
        setProjectSelectorTitle(title);
        setProjectSelectorCallback(() => (projectId: string) => {
            onSelect(projectId);
            setIsProjectSelectorOpen(false);
        });
        setIsProjectSelectorOpen(true);
    }, []);
    
     const handleQuickAction = (action: Screen) => {
        openProjectSelector(`Select a project for the new ${action.split('-')[1]}`, (projectId) => {
            handleDeepLink(projectId, action, {});
        });
    };
    
    const handleSuggestAction = async () => {
        if (!currentUser) return;
        setIsAISuggestionModalOpen(true);
        setIsAISuggestionLoading(true);
        setAiSuggestion(null);
        const suggestion = await api.getAISuggestedAction(currentUser);
        setAiSuggestion(suggestion);
        setIsAISuggestionLoading(false);
    };
    
    const handleAISuggestionAction = (link: NotificationLink) => {
        if (link.projectId) {
            handleDeepLink(link.projectId, link.screen, link.params);
        }
        setIsAISuggestionModalOpen(false);
    };

    if (!sessionChecked) {
        return <div className="p-8">Loading session...</div>
    }

    if (!currentUser) {
        return (
            <div className="bg-slate-100 min-h-screen flex items-center justify-center">
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }
    
    const currentNavItem = navigationStack[navigationStack.length - 1];
    if (!currentNavItem) {
        return <div className="p-8">Loading...</div>;
    }
    
    const { screen, params, project } = currentNavItem;
    const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;
    
    const getSidebarProject = () => {
        if (project) {
            return project;
        }
        return {
            ...MOCK_PROJECT,
            id: '',
            name: 'Global View',
            location: `Welcome, ${currentUser.name}`,
        };
    };

    return (
        <div className="bg-slate-50">
            <AppLayout
                sidebar={
                    <Sidebar 
                        project={getSidebarProject()}
                        navigateTo={navigateTo}
                        navigateToModule={navigateToModule}
                        goHome={goHome}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                    />
                }
                 floatingMenu={<FloatingMenu 
                    currentUser={currentUser} 
                    navigateToModule={navigateToModule} 
                    openProjectSelector={openProjectSelector}
                    onDeepLink={handleDeepLink}
                 />}
            >
                <div className="p-8">
                     <ScreenComponent
                        currentUser={currentUser}
                        selectProject={selectProject}
                        navigateTo={navigateTo}
                        onDeepLink={handleDeepLink}
                        onQuickAction={handleQuickAction}
                        onSuggestAction={handleSuggestAction}
                        openProjectSelector={openProjectSelector}
                        project={project}
                        goBack={goBack}
                        can={can}
                        {...params}
                    />
                </div>
            </AppLayout>

            <AISuggestionModal
                isOpen={isAISuggestionModalOpen}
                isLoading={isAISuggestionLoading}
                suggestion={aiSuggestion}
                onClose={() => setIsAISuggestionModalOpen(false)}
                onAction={handleAISuggestionAction}
                currentUser={currentUser}
            />
            {isProjectSelectorOpen && (
                <ProjectSelectorModal
                    title={projectSelectorTitle}
                    onClose={() => setIsProjectSelectorOpen(false)}
                    onSelectProject={projectSelectorCallback}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

export default App;
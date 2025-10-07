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
import AIAgentsMarketplaceScreen from './components/screens/modules/AIAgentsMarketplaceScreen.tsx';
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
    'ai-agents-marketplace': AIAgentsMarketplaceScreen,
    // Tools
    'placeholder-tool': PlaceholderToolScreen,
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);

    // Debug environment on app start
    console.log('🔧 App Environment Check:', {
        hasSupabase: !!supabase,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        origin: window.location.origin,
        hash: window.location.hash
    });

    const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
    const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [projectSelectorCallback, setProjectSelectorCallback] = useState<(projectId: string) => void>(() => () => { });
    const [projectSelectorTitle, setProjectSelectorTitle] = useState('');

    const { can } = usePermissions(currentUser!);

    useEffect(() => {
        console.log('🚀 App.tsx useEffect started');

        // If supabase is not configured, we rely on mock login/logout and skip session checks.
        if (!supabase) {
            console.log('⚠️ Supabase not configured, using mock auth');
            setSessionChecked(true);
            return;
        }

        console.log('✅ Supabase configured, checking session...');

        // Timeout to prevent infinite loading
        const sessionTimeout = setTimeout(() => {
            console.warn('⏱️ Session check timeout - proceeding anyway');
            setSessionChecked(true);
        }, 5000); // 5 seconds timeout

        const checkSession = async () => {
            console.log('🔍 Checking initial session...');
            try {
                // Check if we have OAuth tokens in the URL hash
                const hash = window.location.hash;
                if (hash && hash.includes('access_token')) {
                    console.log('🔗 OAuth tokens detected in URL hash, processing manually...');
                    console.log('🔍 Full hash:', hash);

                    // Extract tokens from URL hash - handle format like #dashboard#access_token=...
                    // Split by # and find the part with access_token
                    const hashParts = hash.split('#');
                    let tokenPart = '';
                    for (const part of hashParts) {
                        if (part.includes('access_token')) {
                            tokenPart = part;
                            break;
                        }
                    }

                    console.log('🔍 Token part:', tokenPart);

                    if (tokenPart) {
                        const params = new URLSearchParams(tokenPart);
                        const accessToken = params.get('access_token');
                        const refreshToken = params.get('refresh_token');

                        console.log('🔍 Extracted tokens:', {
                            hasAccessToken: !!accessToken,
                            hasRefreshToken: !!refreshToken
                        });

                        if (accessToken && refreshToken) {
                            console.log('🔑 Setting session with extracted tokens');

                            // Set the session manually
                            const { data, error } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken
                            });

                            if (error) {
                                console.error('❌ Error setting session:', error);
                            } else {
                                console.log('✅ Session set successfully:', !!data.session);
                                if (data.session) {
                                    console.log('👤 Session user:', data.session.user.email);
                                }
                            }
                        }
                    }

                    // Clean up OAuth tokens from URL
                    console.log('🧹 Cleaning up OAuth tokens from URL');
                    window.history.replaceState(null, '', window.location.pathname);
                }

                const profile = await getMyProfile();
                console.log('📋 Profile result:', profile);
                setCurrentUser(profile);
                if (profile) {
                    console.log('✅ User logged in:', profile.email);
                    // Navigate to dashboard if user is already logged in
                    if (navigationStack.length === 0) {
                        setNavigationStack([{ screen: 'global-dashboard', params: {}, project: undefined }]);
                    }
                    window.dispatchEvent(new CustomEvent('userLoggedIn'));
                } else {
                    console.log('❌ No profile found');
                }
            } catch (error) {
                console.error('❌ Error checking session:', error);
            } finally {
                clearTimeout(sessionTimeout);
                setSessionChecked(true);
                console.log('✅ Session check complete');
            }
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event, 'Has session:', !!session);

            if (event === 'SIGNED_IN') {
                console.log('🎉 User signed in - checking/creating profile');
                try {
                    let profile = await getMyProfile();
                    console.log('📋 Profile after sign in:', profile);

                    // If no profile exists, create one for the new user
                    if (!profile && session?.user) {
                        console.log('🆕 No profile found, creating new profile for user:', session.user.email);

                        const newProfile = {
                            id: session.user.id,
                            email: session.user.email,
                            name: session.user.user_metadata?.full_name ||
                                session.user.user_metadata?.name ||
                                session.user.email?.split('@')[0] || 'User',
                            role: 'project_manager',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };

                        const { data: createdProfile, error: createError } = await supabase
                            .from('profiles')
                            .insert([newProfile])
                            .select()
                            .single();

                        if (createError) {
                            console.error('❌ Error creating profile:', createError);
                        } else {
                            console.log('✅ Profile created successfully:', createdProfile);
                            profile = createdProfile;
                        }
                    }

                    setCurrentUser(profile);
                    if (profile) {
                        console.log('✅ User logged in via auth change:', profile.email);
                        // Navigate to dashboard after successful login
                        setNavigationStack([{ screen: 'global-dashboard', params: {}, project: undefined }]);
                        window.dispatchEvent(new CustomEvent('userLoggedIn'));
                    }
                } catch (error) {
                    console.error('❌ Error in sign in auth state change:', error);
                }
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out - clearing navigation');
                setCurrentUser(null);
                setNavigationStack([]);
                window.dispatchEvent(new CustomEvent('userLoggedOut'));
            } else {
                // Handle other auth events (TOKEN_REFRESHED, etc.)
                try {
                    const profile = await getMyProfile();
                    console.log('📋 Profile after auth change:', profile);
                    setCurrentUser(profile);
                    if (profile) {
                        console.log('✅ User session maintained:', profile.email);
                        window.dispatchEvent(new CustomEvent('userLoggedIn'));
                    } else {
                        console.log('❌ No profile after auth change');
                        setNavigationStack([]);
                        window.dispatchEvent(new CustomEvent('userLoggedOut'));
                    }
                } catch (error) {
                    console.error('❌ Error in auth state change:', error);
                }
            }
        });

        return () => {
            console.log('🧹 Cleaning up App.tsx useEffect');
            clearTimeout(sessionTimeout);
            subscription.unsubscribe();
        };
    }, []);

    // Handle URL hash for OAuth redirects
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#dashboard' && currentUser) {
                console.log('🔗 OAuth redirect detected - navigating to dashboard');
                setNavigationStack([{ screen: 'global-dashboard', params: {}, project: undefined }]);
                // Clean up the hash
                window.history.replaceState(null, '', window.location.pathname);
            }
        };

        // Check on mount
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [currentUser]);


    useEffect(() => {
        if (currentUser) {
            console.log('👤 User set - loading projects and ensuring dashboard navigation');
            const loadProjects = async () => {
                const projects = await api.fetchAllProjects(currentUser);
                setAllProjects(projects);
            };
            loadProjects();

            // Ensure user is navigated to dashboard if no navigation exists
            if (navigationStack.length === 0) {
                console.log('🏠 No navigation stack - navigating to dashboard');
                setNavigationStack([{ screen: 'global-dashboard', params: {}, project: undefined }]);
            }
        } else {
            console.log('❌ No user - clearing navigation and projects');
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
        console.log('🎉 Login success handler called for user:', user.email);
        // This is primarily for the mock auth flow.
        // In the Supabase flow, onAuthStateChange is the source of truth,
        // so we only manually set the user if Supabase is not configured.
        if (!supabase) {
            console.log('📱 Mock auth - setting user and navigating to dashboard');
            setCurrentUser(user);
            // Navigate to dashboard for mock auth
            setNavigationStack([{ screen: 'global-dashboard', params: {}, project: undefined }]);
            window.dispatchEvent(new CustomEvent('userLoggedIn'));
        } else {
            console.log('🔄 Supabase auth - navigation will be handled by onAuthStateChange');
        }
    };

    const handleLogout = async () => {
        console.log('👋 Logout handler called');
        if (supabase) {
            console.log('🔄 Supabase logout - signing out');
            await supabase.auth.signOut();
            // Navigation clearing will be handled by onAuthStateChange SIGNED_OUT event
        } else {
            console.log('📱 Mock logout - clearing user and navigation');
            setCurrentUser(null);
            setNavigationStack([]);
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
        if (!currentUser) return;
        const project = await api.fetchProjectById(projectId, currentUser);
        if (project) {
            setNavigationStack([{ screen: 'project-home', project }]);
        }
    }, [currentUser]);

    const handleDeepLink = useCallback(async (projectId: string | null, screen: Screen, params: any) => {
        if (projectId && currentUser) {
            const project = allProjects.find(p => p.id === projectId) || await api.fetchProjectById(projectId, currentUser);
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading session...</p>
                    <p className="text-gray-500 text-sm mt-2">This should only take a moment</p>
                </div>
            </div>
        );
    }

    console.log('🎨 Rendering App - currentUser:', currentUser ? currentUser.email : 'null');

    if (!currentUser) {
        console.log('❌ No currentUser - showing login screen');
        return (
            <div className="bg-slate-100 min-h-screen flex items-center justify-center">
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    console.log('✅ currentUser exists - showing dashboard');

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
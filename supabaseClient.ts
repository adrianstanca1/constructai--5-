import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User } from './types.ts';

// Use environment variables directly - no global variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Debug logging
console.log('🔍 Supabase Configuration Check:');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey?.length);
console.log('import.meta.env.VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('import.meta.env.VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase client initialized successfully!');
    } catch (e) {
        console.error("❌ Failed to initialize Supabase client:", e);
    }
} else {
    console.warn('⚠️ Supabase is not configured. Falling back to mock auth.');
    console.warn('Reason - URL valid:', supabaseUrl !== 'YOUR_SUPABASE_URL');
    console.warn('Reason - Key valid:', supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY');
}

export const supabase = supabaseInstance;

export const getMyProfile = async (): Promise<User | null> => {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();

    console.log('🔍 Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        provider: session?.user?.app_metadata?.provider
    });

    if (!session?.user) {
        console.log('❌ No session found');
        return null;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            id,
            name,
            email,
            role,
            avatar,
            company_id
        `)
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error('❌ Error fetching profile:', error);
        console.log('User ID that failed:', session.user.id);
        console.log('Suggestion: Check if profile exists for this user_id in profiles table');
        return null;
    }

    if (!profile) {
        console.error('❌ Profile not found for user:', session.user.id);
        return null;
    }

    console.log('✅ Profile loaded:', {
        id: profile.id,
        email: profile.email,
        role: profile.role
    });

    // Manual mapping from snake_case to camelCase
    return profile ? {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar,
        companyId: profile.company_id,
    } : null;
};
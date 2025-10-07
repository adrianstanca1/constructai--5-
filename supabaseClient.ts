import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User } from './types.ts';

declare global {
  var __supabase_url: string;
  var __supabase_anon_key: string;
}

const supabaseUrl = typeof __supabase_url !== 'undefined' ? __supabase_url : import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = typeof __supabase_anon_key !== 'undefined' ? __supabase_anon_key : import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
    }
} else {
    console.warn('Supabase is not configured. Falling back to mock auth.');
}

export const supabase = supabaseInstance;

export const getMyProfile = async (): Promise<User | null> => {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
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
        console.error('Error fetching profile:', error);
        return null;
    }
    
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
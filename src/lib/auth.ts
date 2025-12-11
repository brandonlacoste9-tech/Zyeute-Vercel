'use client';

import { createClient } from '@/lib/supabase/client';

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, username: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username,
      },
    },
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signOut() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}

export async function signInWithGoogle() {
  const supabase = createClient();
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

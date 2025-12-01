/**
 * OAuth Callback Handler
 * Handles the OAuth redirect from providers like Google
 * 
 * Note: Supabase client is configured with detectSessionInUrl: true in src/lib/supabase.ts,
 * which automatically processes the OAuth callback URL and establishes the session.
 * This component provides a loading state and redirects after session establishment.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingScreen } from '@/components/LoadingScreen';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let hasNavigated = false;

    // Log current URL for debugging
    console.log('[AuthCallback] Current URL:', window.location.href);
    console.log('[AuthCallback] Pathname:', window.location.pathname);
    console.log('[AuthCallback] Search params:', window.location.search);

    // Listen for auth state changes to know when session is ready
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthCallback] Auth state change:', event, session ? 'has session' : 'no session');
      if (event === 'SIGNED_IN' && session) {
        // Successful login - redirect to home
        console.log('[AuthCallback] Sign in successful, redirecting to home');
        hasNavigated = true;
        if (timeoutId) clearTimeout(timeoutId);
        navigate('/', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        // Explicitly signed out - redirect to login
        console.log('[AuthCallback] Signed out, redirecting to login');
        hasNavigated = true;
        if (timeoutId) clearTimeout(timeoutId);
        navigate('/login', { replace: true });
      }
      // Ignore INITIAL_SESSION with null session - OAuth token exchange may still be in progress
      // We'll wait for SIGNED_IN event or check session after a delay
    });

    // Also check current session immediately in case auth already completed
    const checkSession = async () => {
      try {
        console.log('[AuthCallback] Checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
        }
        
        if (session) {
          console.log('[AuthCallback] Session found, redirecting to home');
          hasNavigated = true;
          if (timeoutId) clearTimeout(timeoutId);
          navigate('/', { replace: true });
          return;
        }
        
        // If no session yet, wait a bit for OAuth token exchange to complete
        // This handles cases where the callback hasn't processed yet
        timeoutId = setTimeout(async () => {
          if (hasNavigated) return; // Already navigated via onAuthStateChange
          
          try {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              hasNavigated = true;
              navigate('/', { replace: true });
        } else {
          // Still no session after delay - likely a failed OAuth flow
          console.warn('[AuthCallback] No session established after OAuth callback');
          console.warn('[AuthCallback] URL params:', new URLSearchParams(window.location.search).toString());
          hasNavigated = true;
          navigate('/login', { replace: true });
        }
          } catch (error) {
            console.error('Auth callback retry error:', error);
            hasNavigated = true;
            navigate('/login', { replace: true });
          }
        }, 2000); // Wait 2 seconds for OAuth token exchange
      } catch (error) {
        console.error('[AuthCallback] Error:', error);
        console.error('[AuthCallback] Error details:', JSON.stringify(error, null, 2));
        hasNavigated = true;
        if (timeoutId) clearTimeout(timeoutId);
        navigate('/login', { replace: true });
      }
    };

    checkSession();

    // Cleanup subscription and timeout on unmount
    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  return <LoadingScreen message="Connexion en cours..." />;
};

export default AuthCallback;

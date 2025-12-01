/**
 * OAuth Callback Handler
 * Handles the OAuth redirect from providers like Google
 * 
 * Supports both:
 * 1. Hash-based OAuth (automatic with detectSessionInUrl)
 * 2. Code-based OAuth (explicit exchangeCodeForSession)
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingScreen } from '@/components/LoadingScreen';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Log current URL state immediately for debugging
    console.log('🔍 AuthCallback mounted');
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search params:', window.location.search);
    
    let timeoutId: NodeJS.Timeout | null = null;
    let hasNavigated = false;

    const exchangeCode = async () => {
      // Check for OAuth error in URL parameters
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      console.log('Checking for OAuth error:', error);
      
      if (error) {
        console.error('❌ OAuth error:', error, errorDescription);
        hasNavigated = true;
        navigate(`/login?error=${encodeURIComponent(error || 'oauth_failed')}`, { replace: true });
        return;
      }

      // Check for code-based OAuth (query params)
      const code = searchParams.get('code');
      const provider = searchParams.get('provider') || 'google'; // Default to google if not specified

      console.log('Code param:', code);
      console.log('Provider param:', provider);

      if (code) {
        // Explicit code exchange flow
        console.log('Exchanging OAuth code for session...', { code, provider });
        
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('OAuth exchange error:', exchangeError);
            hasNavigated = true;
            navigate(`/login?error=${encodeURIComponent(exchangeError.message || 'exchange_failed')}`, { replace: true });
            return;
          }

          if (data?.session) {
            console.log('✅ Session established:', {
              user: data.session.user?.email,
              expiresAt: data.session.expires_at,
            });
            hasNavigated = true;
            navigate('/', { replace: true });
            return;
          } else {
            console.warn('No session in exchange response');
            hasNavigated = true;
            navigate('/login?error=no_session', { replace: true });
            return;
          }
        } catch (error: any) {
          console.error('OAuth exchange exception:', error);
          hasNavigated = true;
          navigate(`/login?error=${encodeURIComponent(error?.message || 'exchange_exception')}`, { replace: true });
          return;
        }
      }

      // Hash-based OAuth flow (detectSessionInUrl handles this automatically)
      console.log('No code param found, checking for hash-based OAuth...');
      console.log('Hash contains access_token:', window.location.hash.includes('access_token'));
      console.log('Hash contains type:', window.location.hash.includes('type='));
      
      // Listen for auth state changes to know when session is ready
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔔 Auth state change:', event, session ? 'has session' : 'no session');
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ Signed in via hash-based OAuth:', {
            user: session.user?.email,
            expiresAt: session.expires_at,
          });
          hasNavigated = true;
          if (timeoutId) clearTimeout(timeoutId);
          subscription.unsubscribe();
          navigate('/', { replace: true });
        } else if (event === 'SIGNED_OUT') {
          console.log('Signed out');
          hasNavigated = true;
          if (timeoutId) clearTimeout(timeoutId);
          subscription.unsubscribe();
          navigate('/login', { replace: true });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed');
          hasNavigated = true;
          if (timeoutId) clearTimeout(timeoutId);
          subscription.unsubscribe();
          navigate('/', { replace: true });
        }
      });

      // Also check current session immediately in case auth already completed
      const checkSession = async () => {
        try {
          console.log('🔍 Checking for existing session...');
          // Supabase's detectSessionInUrl should have processed hash-based OAuth already
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Session error:', sessionError);
          }
          
          if (session) {
            console.log('✅ Session found immediately:', {
              user: session.user?.email,
              expiresAt: session.expires_at,
            });
            hasNavigated = true;
            if (timeoutId) clearTimeout(timeoutId);
            subscription.unsubscribe();
            navigate('/', { replace: true });
            return;
          }
          
          console.log('⏳ No session yet, waiting for OAuth token exchange...');
          
          // If no session yet, wait a bit for OAuth token exchange to complete
          timeoutId = setTimeout(async () => {
            if (hasNavigated) {
              console.log('Already navigated, skipping retry');
              return;
            }
            
            console.log('🔄 Retrying session check...');
            try {
              const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
              
              if (retryError) {
                console.error('❌ Retry session error:', retryError);
              }
              
              if (retrySession) {
                console.log('✅ Session found on retry:', {
                  user: retrySession.user?.email,
                });
                hasNavigated = true;
                subscription.unsubscribe();
                navigate('/', { replace: true });
              } else {
                // Still no session after delay - likely a failed OAuth flow
                console.warn('❌ No session established after OAuth callback');
                console.warn('Current URL:', window.location.href);
                console.warn('Hash:', window.location.hash);
                console.warn('Search:', window.location.search);
                console.warn('This usually means:');
                console.warn('  1. OAuth callback URL not in Supabase Redirect URLs');
                console.warn('  2. Google OAuth redirect URI mismatch');
                console.warn('  3. Session not being stored properly');
                hasNavigated = true;
                subscription.unsubscribe();
                navigate('/login?error=no_session', { replace: true });
              }
            } catch (error) {
              console.error('❌ Auth callback retry error:', error);
              hasNavigated = true;
              subscription.unsubscribe();
              navigate('/login?error=callback_failed', { replace: true });
            }
          }, 3000); // Wait 3 seconds for OAuth token exchange
        } catch (error) {
          console.error('❌ Auth callback error:', error);
          hasNavigated = true;
          if (timeoutId) clearTimeout(timeoutId);
          subscription.unsubscribe();
          navigate('/login?error=callback_error', { replace: true });
        }
      };

      checkSession();

      // Cleanup subscription and timeout on unmount
      return () => {
        subscription.unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    };

    exchangeCode();
  }, [navigate, searchParams]);

  return <LoadingScreen message="Connexion en cours..." />;
};

export default AuthCallback;

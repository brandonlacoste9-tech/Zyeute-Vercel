/**
 * OAuth Callback Handler
 * Handles the OAuth redirect from providers like Google
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingScreen } from '@/components/LoadingScreen';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback with detectSessionInUrl: true
        // This page just provides a loading state while the session is being established
        
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Successful login - redirect to home
          navigate('/', { replace: true });
        } else {
          // No session - redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return <LoadingScreen message="Connexion en cours..." />;
};

export default AuthCallback;

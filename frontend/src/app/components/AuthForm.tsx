import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const AuthForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (isLoading) return; // Don't check if already loading
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error.message);
          return;
        }

        if (session) {
          router.push('/projects');
        }
      } catch (error) {
        console.error('Error in checkSession:', error);
      }
    };

    checkSession();
  }, [router, isLoading]); // Add isLoading as a dependency

  return (
    <div>AuthForm component content</div>
  );
};

export default AuthForm; 
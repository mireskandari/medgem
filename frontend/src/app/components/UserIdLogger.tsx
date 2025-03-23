'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';

export default function UserIdLogger() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.error('\x1b[36m%s\x1b[0m', '🔑 Current User UID:', user.id); // Cyan color with emoji
    } else {
      console.error('\x1b[33m%s\x1b[0m', '⚠️ No user is currently logged in'); // Yellow color with emoji
    }
  }, [user]);

  // This component doesn't render anything
  return null;
} 
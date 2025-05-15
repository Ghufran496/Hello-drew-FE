'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserData {
  id: number;
  is_active: boolean;
}

// Only these welcome paths are allowed for logged-in users
const ALLOWED_WELCOME_PATHS = ['/welcome', '/welcome/account-setup', '/welcome/plans', '/welcome/payment'];

export function WelcomeWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: userData, isLoading } = useLocalStorage<UserData>('user_onboarding');

  useEffect(() => {
    if (isLoading) return;

    try {
      // Special case for user 211 - allow all access
      if (userData?.id === 211) {
        return;
      }

      // Handle active users (except 211)
      if (userData?.is_active) {
        router.push('/coming-soon');
        return;
      }

      // Handle welcome page flow
      if (pathname === '/welcome' && userData?.id) {
        router.push('/welcome/plans');
        return;
      }

      // For welcome subpaths
      if (pathname.startsWith('/welcome/')) {
        if (!ALLOWED_WELCOME_PATHS.includes(pathname)) {
          // Stay on plans page if we're coming from welcome
          if (pathname === '/welcome/plans') {
            return;
          }
          router.push('/welcome/plans');
        }
      }

    } catch (error) {
      console.error('Error in access control:', error);
      router.push('/login');
    }
  }, [router, userData, isLoading, pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen p-4">
      {children}
    </main>
  );
} 
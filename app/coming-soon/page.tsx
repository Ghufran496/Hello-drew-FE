'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComingSoon() {
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem('user_onboarding');
    if (!userDataStr) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      if (!userData.is_active) {
        router.push('/welcome/plans');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('user_onboarding');
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Image
            src="/logo-light.svg"
            alt="Logo"
            width={200}
            height={200}
            className="mx-auto"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
        >
          Coming Soon
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-600 mb-8"
        >
          We&apos;re working hard to bring you something amazing. Stay tuned!
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="animate-wave flex space-x-1">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <div className="w-2 h-8 bg-primary rounded-full"></div>
          </div>

          <Button 
            onClick={handleLogout}
            variant="outline"
            className="mt-4"
          >
            Logout
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
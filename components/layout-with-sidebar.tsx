'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ChatBotIcon } from "@/components/chat/chat-bot-icon";
import { PersistentCall } from "@/components/persistent-call";
import Loading from '@/app/(userDashboard)/dashboard/loading';
import { SidebarMobile } from './sidebar-mobile';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserData {
  id: number;
  is_active: boolean;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}

export function LayoutWithSidebar({ children, title }: { children: React.ReactNode, title: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { data: userData, isLoading: isStorageLoading } = useLocalStorage<UserData>('user_onboarding');

  useEffect(() => {
    if (isStorageLoading) {
      return;
    }

    try {
      if (!userData?.id) {
        router.push('/login');
        return;
      }

      // Check if user is allowed to access dashboard
      if (userData.id !== 211) {
        if (userData.is_active) {
          router.push('/coming-soon');
        } else {
          router.push('/welcome/plans');
        }
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing user data:', error);
      router.push('/login');
    }
  }, [router, userData, isStorageLoading]);

  if (isLoading || isStorageLoading || !userData?.id) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen  bg-[#fcfcfd] w-[100vw] md:w-auto overflow-hidden ">
      <div className="hidden md:flex fixed left-0 top-0 h-full">
        <Sidebar />
      </div>
      <div className="md:hidden fixed left-0 top-0 h-full z-[9999]">
        <SidebarMobile />
      </div>
      <div className="lg:flex-1 lg:ml-[130px] md:ml-[80px] w-[100vw]">
        <div className="md:p-8 p-2" >
          <Header title={title} />
          {children}
        </div>
      </div>
      <PersistentCall />
      {title === "Dashboard" && (
        <ChatBotIcon />
      )}
    </div>
  );
}
'use client';

import {
  LayoutGrid,
  Users,
  Calendar,
  Video,
  Phone,
  PieChart,
  NetworkIcon as Network2,
  Settings,
  LogOut,
  Loader2,
  Square,
  Headset,
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRetellCall } from '@/hooks';
import { Agents } from '@/lib/constants';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const sidebarItems = [
  { icon: LayoutGrid, href: '/dashboard' },
  { icon: Users, href: '/leads' },
  { icon: Calendar, href: '/appointments' },
  { icon: Video, href: '/meetings' },
  { icon: Phone, href: '/calls' },
  { icon: PieChart, href: '/reports' },
  { icon: Network2, href: '/integrate' },
  { icon: Headset, href: '/agents' },
  { icon: Settings, href: '/settings' },
  { icon: LogOut, href: '/' },
];

export function SidebarMobile() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeAgent] = React.useState<string>(Agents[0].agent_id);
  const { endCall, startCall, status, error } = useRetellCall(activeAgent);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isLeadProfile = pathname.startsWith('/leads/');

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 w-full bg-[#1E1E1E] z-[9999] flex flex-row items-center py-3 space-x-6 rounded-none border-t-[2px] border-[#FFFFFF1F] shadow-lg overflow-x-auto justify-between"
    >
      <div className="flex items-center justify-center space-y-0 space-x-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            className="w-10"
            width={100}
            height={100}
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full  cursor-pointer flex items-center justify-center"
        >
          <div className="w-full relative h-[40px] flex items-center justify-center">
            <div className="relative inline-block z-10">
              {status !== 'connecting' && (
                <>
                  <div
                    className={cn(
                      'absolute left-1/2 top-1/2 h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 transition-all',
                      {
                        'bg-primary/10 animate-pulse scale-110':
                          status === 'active',
                      }
                    )}
                  />
                  <div
                    className={cn(
                      'absolute left-1/2 top-1/2 h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 transition-all',
                      {
                        'bg-primary/30 animate-pulse scale-105':
                          status === 'active',
                      }
                    )}
                  />
                </>
              )}
              <button
                className="relative border-4 border-white/20 h-14 w-14 rounded-full bg-primary text-primary-foreground transition-all duration-500 hover:scale-100 active:scale-95 shadow-none hover:shadow-md disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Activate microphone"
                disabled={status === 'connecting'}
                onClick={() => {
                  if (status === 'active') {
                    endCall();
                  } else {
                    startCall();
                  }
                }}
              >
                {status === 'active' ? (
                  <Square className="mx-auto w-6 h-6 fill-primary-foreground" />
                ) : status === 'connecting' ? (
                  <Loader2 className="mx-auto w-6 h-6 animate-spin" />
                ) : (
                  <Image
                    src="/Microphone.svg"
                    alt=""
                    className="mx-auto w-8 h-8 md:w-4 md:h-4"
                    width={40}
                    height={40}
                  />
                )}
              </button>
            </div>
            <Image
              className={cn('object-contain', {
                'animate-pulse': status === 'active',
              })}
              src="/sound-wave.svg"
              alt=""
              fill
            />
          </div>
        </motion.div>
        {!!error && (
          <p className="mx-auto text-center text-destructive mb-3">{error}</p>
        )}
      </div>
      <div className="flex-1 flex flex-row items-center space-x-6">
        {sidebarItems.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => item.href && router.push(item.href)}
            className={`w-10 h-10 cursor-pointer rounded-full flex items-center justify-center transition-colors shadow-md 
              ${
                pathname === item.href ||
                (item.href === '/leads' && isLeadProfile)
                  ? 'bg-white text-[#0357f8]'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
          >
            <item.icon className="w-6 h-6" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

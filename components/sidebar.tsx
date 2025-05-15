'use client';

import {
  LayoutGrid,
  Calendar,
  Video,
  Phone,
  PieChart,
  NetworkIcon as Network2,
  Settings,
  LogOut,
  Loader2,
  Square,
  Users,
  FileSignature as Contract,
  Headset,
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRetellCall } from '@/hooks';
import { Agents } from '@/lib/constants';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCall } from '@/app/context/CallContext';
import { FaUsers } from 'react-icons/fa';

const sidebarItems = [
  { icon: LayoutGrid, href: '/dashboard' },
  { icon: FaUsers, href: '/leads' },
  { icon: Calendar, href: '/appointments' },
  { icon: Contract, href: '/contracts' },
  { icon: Video, href: '/meetings' },
  { icon: Phone, href: '/calls' },
  { icon: PieChart, href: '/reports' },
  { icon: Network2, href: '/integrate' },
  { icon: Users, href: '/team' },
  { icon: Headset, href: '/agents' },
  { icon: Settings, href: '/settings' },
  { icon: LogOut, href: '/' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeAgent] = React.useState<string>(Agents[0].agent_id);
  const { status, error } = useRetellCall(activeAgent);
  const [isVisible, setIsVisible] = React.useState(false);
  const {
    isCallActive,
    startCall: callContextStartCall,
    endCall: callContextEndCall,
  } = useCall();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isLeadProfile = pathname.startsWith('/leads/');

  const handleCallClick = () => {
    if (isCallActive) {
      callContextEndCall();
    } else {
      callContextStartCall();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="fixed left-[10px] transform -translate-x-1/2 w-[90vw] md:w-24 
        bg-[#1E1E1E] z-100 mt-2 flex flex-row md:flex-col items-center py-4 md:py-8 space-x-6 md:space-x-0 md:space-y-6 
        rounded-full border border-[#FFFFFF1F] shadow-lg overflow-x-auto md:overflow-hidden"
    >
      <div className="flex flex-row md:flex-col items-center space-y-0 md:space-y-4 space-x-4 md:space-x-0">
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
          className="w-14 h-14 rounded-full cursor-pointer flex items-center justify-center"
        >
          <div className="w-full relative h-[40px] flex items-center justify-center">
            <div className="relative inline-block z-10">
              {status !== 'connecting' && (
                <>
                  <div
                    className={cn(
                      'absolute left-1/2 top-1/2 h-[20px] md:h-20 w-[20px] md:w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-700/5 transition-all',
                      {
                        'bg-gray-700/10 animate-pulse scale-110':
                          status === 'active',
                      }
                    )}
                  />
                  <div
                    className={cn(
                      'absolute left-1/2 top-1/2 h-[20px] md:h-18 w-[20px] md:w-18 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-700/10 transition-all',
                      {
                        'bg-gray-700/30 animate-pulse scale-105':
                          status === 'active',
                      }
                    )}
                  />
                </>
              )}
              <button
                className="relative border border-white/20 h-14 md:h-12 w-14 md:w-12 rounded-full bg-[linear-gradient(157.54deg,#548EFD_20.66%,#0357F8_61.43%)] text-gray-700 transition-all duration-500 hover:scale-100 active:scale-95 shadow-none hover:shadow-md disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Activate microphone"
                disabled={status === 'connecting'}
                onClick={handleCallClick}
              >
                {isCallActive ? (
                  <Square className="mx-auto w-6 h-6 md:w-6 md:h-6 fill-white" />
                ) : status === 'connecting' ? (
                  <Loader2 className="mx-auto w-6 h-6 md:w-6 md:h-6 animate-spin" />
                ) : (
                  <Image
                    src="/Microphone.svg"
                    alt=""
                    className="mx-auto w-4 h-4 md:w-6 md:h-6"
                    width={30}
                    height={30}
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
          <p className="mx-auto text-center text-destructive">{error}</p>
        )}
      </div>

      <div className="flex-1 flex flex-row md:flex-col items-center space-x-6 md:space-x-0 md:space-y-4">
        {sidebarItems.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => item.href && router.push(item.href)}
            className={`w-12 h-12 cursor-pointer rounded-full flex items-center justify-center transition-colors shadow-md 
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

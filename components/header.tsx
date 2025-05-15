'use client'

import { Bell, Search, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface UserData {
  id: number;
  name: string;
  drew_voice_accent: {
    personal_drew_id: string;
  };
  image: string;
}

export function Header({title}: { title: string }) {
  const router = useRouter();
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user_onboarding");
      router.push('/login');
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex md:flex-row  flex-col items-center justify-between mb-8"
    >
      {title === "Dashboard" ? (
   <motion.div
   initial={{ opacity: 0, x: -20 }}
   animate={{ opacity: 1, x: 0 }}
   transition={{ delay: 0.2, duration: 0.5 }}
 >
   <motion.h1 
     className="text-2xl font-bold"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ delay: 0.4, duration: 0.3 }}
   >
     Welcome Back, {userData?.name?.split(' ')[0] || 'User'}!
   </motion.h1>
   <motion.p 
     className="text-[#667287]"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ delay: 0.5, duration: 0.3 }}
   >
     Ready to conquer today?
   </motion.p>
 </motion.div>
      ): (
        <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      className="flex md:flex-row  flex-col items-center "
      >
        <motion.h1 
          className="text-3xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {title}
        </motion.h1>
      
      </motion.div>
      )}
   
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search.."
            className="pl-10 pr-4 py-2 rounded-full border border-gray-200 w-64 focus:outline-none focus:ring-2 focus:ring-[#0357f8]"
          />
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="relative p-2 hover:bg-gray-100 rounded-full"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="w-10 h-10 cursor-pointer">
                <AvatarImage className='bg-transparent ' src={userData?.image} />
                <AvatarFallback>R</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

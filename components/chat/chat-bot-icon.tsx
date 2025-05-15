'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChatInterface } from './chat-interface';
import Image from 'next/image';

export function ChatBotIcon() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 md:bottom-8 right-8 z-50 flex items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mr-4"
          >
            <ChatInterface onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-primary to-primary text-black p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        <Image src="/ChatsCircle.svg" className='text-black' alt="Chat Bot Icon" width={32} height={32} />
      </motion.button>
    </div>
  );
} 
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatService } from '@/lib/chat-service';
import { Loader2 } from 'lucide-react';
interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onClose: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatServiceRef = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(parsedMessages);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem("user_onboarding");
        if (!userData) {
          setIsLoading(false);
          return;
        }

        interface UserData {
          id: number;
          name: string;
        }

        const user: UserData = JSON.parse(userData);
        
        // Initialize chat service
        chatServiceRef.current = new ChatService(
          user.id.toString(),
          user.name
        );

        // Connect and handle incoming messages
        chatServiceRef.current.connect((content: string) => {
          const newMessage: Message = {
            content,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, newMessage]);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Chat initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !chatServiceRef.current) return;

    // Add user message to chat
    const userMessage: Message = {
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send message through WebSocket
    chatServiceRef.current.sendChatMessage(input);
    setInput('');
  };

  const handleClose = () => {
    // Save messages before closing
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-[250px] h-[300px] md:w-[350px] md:h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b bg-white text-black rounded-t-lg">
        <h3 className="font-semibold">Chat Bot</h3>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4">
        <div className="relative">
          <Input
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="w-full pr-10"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
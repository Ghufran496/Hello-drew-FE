'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRetellCall } from "@/hooks";
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CallContextType {
  isCallActive: boolean;
  startCall: () => void;
  endCall: () => void;
  callState: ReturnType<typeof useRetellCall>;
}

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>("agent_bdbd9c244432ce047c21f88a6c");
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');

  useEffect(() => {
    if (userData?.drew_voice_accent?.personal_drew_id) {
      setActiveAgent(userData.drew_voice_accent.personal_drew_id);
    }
  }, [userData]);

  const callState = useRetellCall(activeAgent);

  const startCall = () => {
    setIsCallActive(true);
    callState.startCall();
  };

  const endCall = () => {
    setIsCallActive(false);
    callState.endCall();
  };

  return (
    <CallContext.Provider value={{ isCallActive, startCall, endCall, callState }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
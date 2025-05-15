"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProgressContextType {
  progress: number;
  setProgress: (progress: number) => void;
  step: number;
  setStep: (step: number) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  return (
    <ProgressContext.Provider value={{ progress, setProgress, step, setStep }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 
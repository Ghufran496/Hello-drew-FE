'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T | null = null) {
  const [value, setValue] = useState<T | null>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        setValue(item ? JSON.parse(item) : initialValue);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      setValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  const setData = (newValue: T) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setValue(newValue);
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return { data: value, setData, isLoading };
}
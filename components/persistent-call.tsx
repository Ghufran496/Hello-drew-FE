'use client';

import { useCall } from "@/app/context/CallContext";
import {  PhoneOff } from "lucide-react";

export function PersistentCall() {
  const { isCallActive, endCall } = useCall();

  if (!isCallActive) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-full px-6 py-3 flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Call in progress</span>
      </div>
      <button
        onClick={endCall}
        className="p-2 hover:bg-red-50 rounded-full transition-colors"
      >
        <PhoneOff className="w-5 h-5 text-red-500" />
      </button>
    </div>
  );
} 
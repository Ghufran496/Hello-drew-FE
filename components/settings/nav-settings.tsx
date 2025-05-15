'use client'

import { motion } from 'framer-motion'
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const sidebarItems = [
  "User Profile",
  "Access Levels & Teams",
  "Notifications",
  "Customize Drew",
  "Password Management"
];

interface NavSettingsProps {
  onSelect: (item: string) => void;
}

export function NavSettings({ onSelect }: NavSettingsProps) {
  const [activeItem, setActiveItem] = useState<string>(sidebarItems[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col justify-start"
    >
      <div className="block md:hidden relative w-full">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex justify-between items-center w-full p-3 border rounded-xl bg-white shadow-sm text-[#667287] font-medium"
          aria-expanded={isDropdownOpen}
        >
          {activeItem}
          <ChevronDown className={`transform transition-all ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute w-full bg-white border rounded-xl shadow-md mt-2 z-10">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveItem(item);
                  onSelect(item);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-start p-3 cursor-pointer transition-all hover:bg-gray-100
                  ${activeItem === item ? "bg-gray-200 font-semibold" : ""}`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-col gap-1">
        {sidebarItems.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setActiveItem(item);
              onSelect(item);
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-auto text-start rounded-xl p-3 gap-4 font-semibold cursor-pointer transition-all
              ${activeItem === item ? "bg-primary/10 text-black" : "text-[#667287] hover:bg-primary/10"}`}
          >
            {item}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

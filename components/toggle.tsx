"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SmallToggleSwitch() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div
      className=""
      onClick={() => setIsOn(!isOn)}
    >
      <motion.div
        className="relative w-12 h-6 rounded-full cursor-pointer"
        animate={{
          backgroundColor: isOn ? "#2354F5" : "#ccc",
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{
            x: isOn ? 20 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </motion.div>
    </div>
  );
}

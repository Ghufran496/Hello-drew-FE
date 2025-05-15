"use client"

import { motion } from "framer-motion"

interface TimelineEvent {
  day: string
  events: Array<{
    time: string
    title: string
  }>
}

const timelineData: TimelineEvent[] = [
  {
    day: "Mon", 
    events: [{ time: "06:00 AM", title: "Call with John" }]
  },
  { day: "Tue", events: [] },
  { day: "Wed", events: [] },
  {
    day: "Thu",
    events: [{ time: "07:00 AM", title: "Call with Deby" }]
  },
  {
    day: "Fri", 
    events: [{ time: "09:00 AM", title: "Call with Vany" }]
  },
  { day: "Sat", events: [] },
  { day: "Sun", events: [] }
]

export function Timeline() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6"
    >
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl font-semibold mb-6"
      >
        Timeline of Interaction
      </motion.h2>
      <div className="grid grid-cols-7 gap-4">
        {timelineData.map((day, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="space-y-2"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + (0.1 * index), duration: 0.3 }}
              className="text-sm text-gray-600"
            >
              {day.day}
            </motion.div>
            {day.events.map((event, eventIndex) => (
              <motion.div
                key={eventIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (0.1 * index), duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#0357f8] text-white text-xs p-2 rounded-lg cursor-pointer"
              >
                {event.title}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Meetings() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Meetings</h2>
          <Button variant="link" className="text-[#0357f8]">See All</Button>
        </div>
        
        <div className="space-y-4">
          {[
            { date: "January 10, 2024", status: "Confirmed" },
            { date: "January 12, 2024", status: "Pending" },
            { date: "February 25, 2024", status: "Reschedule" },
            { date: "February 27, 2024", status: "Confirmed" },
          ].map((meeting, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1), duration: 0.3 }}
              key={i} 
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/logo.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span>3+</span>
                  <span>{meeting.date}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                meeting.status === "Confirmed" ? "bg-green-100 text-green-600" :
                meeting.status === "Pending" ? "bg-yellow-100 text-yellow-600" :
                "bg-blue-100 text-blue-600"
              }`}>
                {meeting.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Last Meeting Summaries</h2>
          <Button variant="link" className="text-[#0357f8]">Download Transcript</Button>
        </div>

        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mb-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span>3+</span>
                  <span className="font-medium">Quarterly Review with XYZ Realty</span>
                </div>
                <div className="text-sm text-[#667287]">10 January 2024</div>
              </div>
            </div>
          </motion.div>

          {[1, 2, 3].map((_, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1), duration: 0.3 }}
              key={i} 
              className="p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-[#667287]">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

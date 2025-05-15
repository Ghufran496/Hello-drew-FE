"use client"

import { Phone, Calendar, Star, Settings } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Line, LineChart, Area, AreaChart, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts"
import { motion } from "framer-motion"

// Sample data for the charts
const callsData = [
  { date: "Jan", calls: 15 },
  { date: "Feb", calls: 18 },
  { date: "Mar", calls: 16 },
  { date: "Apr", calls: 20 },
  { date: "May", calls: 22 },
  { date: "Jun", calls: 19 },
  { date: "Jul", calls: 24 },
]

// const leadData = [
//   { value: 50 },
//   { value: 80 },
//   { value: 100 },
// ]

const teamData = [
  { week: "W1", activity: 15 },
  { week: "W2", activity: 18 },
  { week: "W3", activity: 21 },
  { week: "W4", activity: 24 },
]

export function Metrics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* Calls Made Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-black"
              >
                <Phone className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-sm text-[#667287]">Calls made</span>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex items-baseline gap-2 mb-2"
          >
            <span className="text-3xl font-bold">24</span>
            <span className="text-sm text-green-500">+10%</span>
          </motion.div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={callsData}>
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#0357f8" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Appointments Scheduled Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-black"
              >
                <Calendar className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-sm text-[#667287]">Appointments Scheduled</span>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex items-baseline gap-2 mb-2"
          >
            <span className="text-3xl font-bold">80%</span>
            <span className="text-sm text-[#667287]">success rate</span>
          </motion.div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="60%" 
                outerRadius="100%" 
                data={[{ value: 80 }]} 
                startAngle={90} 
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  fill="#0357f8"
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Lead Pipeline Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-black"
              >
                <Star className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-sm text-[#667287]">Lead Pipeline</span>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Start', value: 100 },
                  { name: 'End', value: 0 },
                ]}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <Area
                  dataKey="value"
                  stroke="none"
                  fill="#0357f8"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Team Activity Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-black"
              >
                <Settings className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-sm text-[#667287]">Team Activity</span>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="text-3xl font-bold mb-4"
          >
            24
          </motion.div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={teamData}>
                <Area
                  type="monotone"
                  dataKey="activity"
                  fill="#0357f8"
                  stroke="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

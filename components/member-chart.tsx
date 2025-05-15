"use client"

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion";

const mockData = [
  { date: "Jan 1", calls: 15, appointments: 18, deals: 12 },
  { date: "Jan 2", calls: 20, appointments: 15, deals: 17 },
  { date: "Jan 3", calls: 12, appointments: 14, deals: 15 },
  { date: "Jan 4", calls: 18, appointments: 16, deals: 13 },
  { date: "Jan 5", calls: 14, appointments: 12, deals: 16 },
  { date: "Jan 6", calls: 16, appointments: 19, deals: 14 },
  { date: "Jan 7", calls: 19, appointments: 15, deals: 18 },
];

export function MembersChart() {
  const items = [
    { color: "bg-blue-600", label: "Calls Made" },
    { color: "bg-blue-400", label: "Appointments Scheduled" },
    { color: "bg-purple-400", label: "Deals Closed" },
  ]
  
  return (
    <Card className="text-xs md:text-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className=" text-sm md:text-xl">Member Activity</CardTitle>
        <div className="flex items-center gap-2">
        {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <span className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-gray-700 text-xs md:text-md">{item.label}</span>
        </div>
      ))}
          <Select defaultValue="hours">
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Weekly</SelectItem>
              {/* <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="seconds">Second</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="h-[300px] relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={{ stroke: 'black' }} 
                interval={0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                domain={[0, 'dataMax + 5']}
              />
              <Tooltip />
              <CartesianGrid stroke="#ccc" strokeDasharray="8 8" vertical={false} />
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="calls" stroke="#2563eb" fillOpacity={1} fill="url(#colorCalls)" />
              <Area type="monotone" dataKey="appointments" stroke="#60a5fa" fillOpacity={1} fill="url(#colorAppointments)" />
              <Area type="monotone" dataKey="deals" stroke="#c084fc" fillOpacity={1} fill="url(#colorDeals)" />
              <Line 
                type="monotone" 
                dataKey="calls" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="appointments" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#60a5fa", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="deals" 
                stroke="#c084fc" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#c084fc", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  )
}

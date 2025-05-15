"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jhon", calls: 12, appointments: 8, deals: 4 },
  { name: "Thanq", calls: 18, appointments: 12, deals: 6 },
  { name: "Samuel", calls: 22, appointments: 15, deals: 8 },
  { name: "Andri", calls: 19, appointments: 13, deals: 7 },
  { name: "Victoria", calls: 14, appointments: 9, deals: 5 },
  { name: "Yolanda", calls: 11, appointments: 7, deals: 3 },
  { name: "Toni", calls: 9, appointments: 6, deals: 2 },
  { name: "Shiqa", calls: 13, appointments: 8, deals: 4 },
  { name: "Trolino", calls: 16, appointments: 11, deals: 5 },
]

export function TeamActivity() {
  return (
    <Card className="h-full relative">
      <div className="absolute top-0 left-0 w-full h-full bg-white  pointer-events-none">
        <CardHeader>
          <CardTitle className="text-xl">Team Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="calls" stackId="a" fill="#0357f8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="appointments" stackId="a" fill="#0357f8" opacity={0.7} radius={[4, 4, 0, 0]} />
                <Bar dataKey="deals" stackId="a" fill="#0357f8" opacity={0.4} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </div>
      {/* <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <div className="cursor-pointer z-10">
          <LockedFeature />
        </div>
      </div> */}
    </Card>
  )
}
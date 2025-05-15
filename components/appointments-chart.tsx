"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import axios from "axios";
import { motion } from "framer-motion";
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Appointment = {
  status: "scheduled" | "pending" | "missed";
};

type AppointmentData = {
  name: string;
  value: number;
  color: string;
};

interface UserData {
  id: number;
  drew_voice_accent?: {
    personal_drew_id: string;
  };
}

export function AppointmentsChart() {
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');
  const userId = userData?.id;
  const [data, setData] = useState<AppointmentData[]>([
    { name: "Scheduled", value: 0, color: "#0357f8" },
    { name: "Pending", value: 0, color: "#fbcc12" },
    { name: "Missed", value: 0, color: "#fd3458" },
  ]);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/analytics/appointments", {
          userId: userId,
        });
        const appointmentRecords: Appointment[] = response.data.appointmentRecords;

        const scheduled = appointmentRecords.filter(
          (appointment) => appointment.status.toLowerCase() === "scheduled"
        ).length;
        const pending = appointmentRecords.filter(
          (appointment) => appointment.status.toLowerCase() === "pending"
        ).length;
        const missed = appointmentRecords.filter(
          (appointment) => appointment.status.toLowerCase() === "missed"
        ).length;

        const newData: AppointmentData[] = [
          { name: "Scheduled", value: scheduled, color: "#0357f8" },
          { name: "Pending", value: pending, color: "#fbcc12" },
          { name: "Missed", value: missed, color: "#fd3458" },
        ];

        setData(newData);
        setTotalAppointments(scheduled + pending + missed);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Appointments Scheduled
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs lg:text-md">
        <motion.div 
          className="flex"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-[300px] w-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  cornerRadius={10}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-lg lg:text-4xl font-bold">{totalAppointments}</div>
                <div className="text-sm text-[#667287]">Appointments</div>
              </motion.div>
            </div>
          </div>
          <div className="flex flex-col justify-center ml-8">
            {data.map((item) => (
              <motion.div
                key={item.name}
                className="flex flex-col justify-center items-start mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * data.indexOf(item) }}
              >
                <div className="text-normal text-[#667287] flex items-center gap-1">
                  <span
                    className="w-[4px] h-5 rounded-xl inline-block"
                    style={{ backgroundColor: item.color }}
                  ></span>{" "}
                  {item.name}
                </div>
                <div className="text-lg lg:text-2xl font-semibold">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

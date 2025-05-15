"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import axios from "axios";
import { motion } from "framer-motion";
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}
type Appointment = {
  status: "scheduled" | "pending" | "missed";
};

type AppointmentData = {
  value: number;
  color: string;
};

interface ResponseRatesProps {
  textResponseRate?: number;
  emailOpenRate?: number;
  emailClickRate?: number;
}

export function ResponseRates({ 
  textResponseRate, 
  emailOpenRate, 
}: ResponseRatesProps) {
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');
  const userId = userData?.id;
  const [percentage, setPercentage] = useState<number>(0);
  const [data, setData] = useState<AppointmentData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/analytics/conversion", {
          userId: userId,
        });
        const appointmentRecords: Appointment[] = response.data.appointmentRecords;

        const scheduled = appointmentRecords.filter(
          (appointment) => appointment.status === "scheduled"
        ).length;
        const total = appointmentRecords.length;

        const calculatedPercentage = total > 0 ? Math.round((scheduled / total) * 100) : 0;

        setPercentage(calculatedPercentage);
        setData([
          { value: calculatedPercentage, color: "#0258f7" },
          { value: 100 - calculatedPercentage, color: "#E0E0E0" },
        ]);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
      }
    };

    fetchData();
  }, [userId, percentage, data]);

  const dataForChart = textResponseRate !== undefined ? [
    {
      name: "Response Rate",
      value: textResponseRate,
      color: "#0258f7"
    },
    {
      name: "Remaining",
      value: 100 - textResponseRate,
      color: "#E0E0E0"
    }
  ] : [
    {
      name: "Open Rate",
      value: emailOpenRate || 0,
      color: "#0258f7"
    },
    {
      name: "Remaining",
      value: 100 - (emailOpenRate || 0),
      color: "#E0E0E0"
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {textResponseRate !== undefined ? "Response Rate" : "Email Open Rate"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <motion.div 
          className="relative w-[300px] h-[300px] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataForChart}
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                cornerRadius={10}
              >
                {dataForChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center top-10 gap-4">
            <motion.div 
              className="text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl font-bold">
                {textResponseRate !== undefined 
                  ? `${Math.round(textResponseRate)}%`
                  : `${Math.round(emailOpenRate || 0)}%`
                }
              </div>
              <p className="text-md mt-10">
                {textResponseRate !== undefined 
                  ? "Response Rate"
                  : "Open Rate"
                }
              </p>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

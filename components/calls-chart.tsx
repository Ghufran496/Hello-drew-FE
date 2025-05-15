"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}

interface CallRecord {
  callTime: string;
  status: "successful" | "missed";
}

interface AggregatedData {
  date: string;
  successful: number;
  missed: number;
}

export function CallsChart() {
  const { data: userData } = useLocalStorage<UserData>("user_onboarding");
  const [data, setData] = useState<AggregatedData[]>([]);
  const userId = userData?.id;
  const [xAxisInterval, setXAxisInterval] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) {
        setXAxisInterval(2);
      } else {
        setXAxisInterval(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      try {
        const response = await fetch("/api/analytics/calls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        const aggregatedData = result.callRecords.reduce(
          (acc: Record<string, AggregatedData>, record: CallRecord) => {
            const date = new Date(record.callTime).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            if (!acc[date]) {
              acc[date] = { date, successful: 0, missed: 0 };
            }
            if (record.status === "successful") {
              acc[date].successful += 1;
            } else if (record.status === "missed") {
              acc[date].missed += 1;
            }
            return acc;
          },
          {}
        );

        const formattedData = Object.values(aggregatedData);
        setData(formattedData as AggregatedData[]);
      } catch (error) {
        console.error("Error fetching call data:", error);
      }
    }

    fetchData();
  }, [userId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Calls made</CardTitle>
        <div className="flex items-center">
          <Select defaultValue="hours">
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="seconds">Second</SelectItem>
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
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: "black" }}
                interval={xAxisInterval}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, "dataMax + 1"]} // Adjust Y-axis to show correct range
              />
              <Tooltip />
              <CartesianGrid
                stroke="#ccc"
                strokeDasharray="8 8"
                vertical={false}
              />
              <defs>
                <linearGradient
                  id="colorSuccessful"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0357f8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0357f8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667287" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#667287" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="successful"
                stroke="#0357f8"
                fillOpacity={1}
                fill="url(#colorSuccessful)"
              />
              <Area
                type="monotone"
                dataKey="missed"
                stroke="#667287"
                fillOpacity={1}
                fill="url(#colorMissed)"
              />
              <Line
                type="monotone"
                dataKey="successful"
                stroke="#0357f8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#0357f8", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="missed"
                stroke="#667287"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#667287", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}

"use client"

import { useEffect, useState } from "react";
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion";
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}

interface CallRecord {
  callTime: string;
  status: 'successful' | 'missed';
}

interface AggregatedData {
  date: string;
  successful: number;
  missed: number;
}

interface ResponseChartProps {
  textMetrics?: {
    sent: number;
    received: number;
    unread: number;
    responseRate: number;
  };
  emailMetrics?: {
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  };
}

export function ResponseChart({ textMetrics, emailMetrics }: ResponseChartProps) {
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');
  const userId = userData?.id;
  const [data, setData] = useState<AggregatedData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/calls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userId }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        const aggregatedData = result.callRecords.reduce((acc: Record<string, AggregatedData>, record: CallRecord) => {
          const date = new Date(record.callTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!acc[date]) {
            acc[date] = { date, successful: 0, missed: 0 };
          }
          if (record.status === 'successful') {
            acc[date].successful += 1;
          } else if (record.status === 'missed') {
            acc[date].missed += 1;
          }
          return acc;
        }, {});

        const formattedData = Object.values(aggregatedData);
        setData(formattedData as AggregatedData[]);
      } catch (error) {
        console.error('Error fetching call data:', error);
      }
    }

    if (userId) {
      fetchData();
    }
    console.log(data);
  }, [userId]); 

  const dataToDisplay = textMetrics ? [
    {
      name: "Sent",
      total: textMetrics.sent,
      color: "#0258f7"
    },
    {
      name: "Received",
      total: textMetrics.received,
      color: "#0258f7"
    },
    {
      name: "Unread",
      total: textMetrics.unread,
      color: "#0258f7"
    }
  ] : emailMetrics ? [
    {
      name: "Sent",
      total: emailMetrics.sent,
      color: "#0258f7"
    },
    {
      name: "Opened",
      total: emailMetrics.opened,
      color: "#0258f7"
    },
    {
      name: "Clicked",
      total: emailMetrics.clicked,
      color: "#0258f7"
    }
  ] : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-md lg:text-xl">
          {textMetrics ? "Text Message Stats" : "Email Stats"}
        </CardTitle>
        <div className="flex items-center">
          <Select defaultValue="minutes">
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
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
            <LineChart data={dataToDisplay}>
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={{ stroke: 'black' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                domain={[0, 'dataMax + 1']}
              />
              <Tooltip />
              <CartesianGrid stroke="#ccc" strokeDasharray="8 8" vertical={false} />
              {dataToDisplay.map((entry) => (
                <Line
                  key={entry.name}
                  type="monotone"
                  dataKey="total"
                  stroke={entry.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: entry.color, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  )
}

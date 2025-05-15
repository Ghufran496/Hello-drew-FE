"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export function ConversionRates({ conversionRate }: { conversionRate: number }) {
  const data = [
    { value: conversionRate, color: "#4CAF50" },
    { value: 100 - conversionRate, color: "#E0E0E0" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Conversion rates</CardTitle>
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
                data={data}
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                cornerRadius={10}
              >
                {data.map((entry, index) => (
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
              <div className="text-4xl font-bold">{Math.round(conversionRate)}%</div>
              <p className="text-md mt-10">calls resulting in booked appointments</p>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const chartData = [
  { x: 1, y: 3 },
  { x: 2, y: 7 },
  { x: 3, y: 10 },
  { x: 4, y: 12 },
  { x: 5, y: 17 },
];

const DataPointLabel = ({ x, y, value }: { x: number; y: number; value: number }) => {
  return (
    <text
      x={x}
      y={y - 10} 
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
      fill="#666" 
    >
      {value}
    </text>
  );
};

export function NewLeadChart() {
  return (
    <Card className="w-full h-64 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`/newlead.svg`}
              className="bg-primary rounded-full"
            />
          </Avatar>
          <div>
            <CardTitle className="text-xl">New Leads</CardTitle>
            <div className="text-sm text-gray-500">May · 13 - 20 · Thu</div>
          </div>
        </div>
        <Select defaultValue="hours">
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hours">7 days</SelectItem>
            <SelectItem value="minutes">14 days</SelectItem>
            <SelectItem value="seconds">21 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <motion.div
          className="flex flex-col items-start space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-xl font-bold">23</div>
          <div className="text-sm text-green-500">+20%</div>
        </motion.div>

        {/* Chart Section */}
        <div className="flex flex-col items-end w-[330px] h-[140px] relative">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" hide />
              <YAxis dataKey="y" hide />
              <Line
                strokeWidth={2}
                data={chartData}
                dot={true}
                activeDot={{ r: 8 }}
                type="monotone"
                dataKey="y"
                stroke="#0357f8"
                tooltipType="none"
                label={(props) => <DataPointLabel {...props} />}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-sm text-gray-500">
            <span className=" text-blue-600 ">+12</span> this week vs{" "}
            <span className=" text-red-600">10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
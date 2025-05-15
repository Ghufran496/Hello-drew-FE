import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BarChartComponent from "./Bar-Chart-CA";

export function ContactAttemptCard() {
  const chartData = [
    { x: 5, y: 6 },
    { x: 6, y: 1 },
    { x: 7, y: 10 },
    { x: 8, y: 48 },
  ];

  return (
    <Card className="w-full h-64 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-row items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`/contactattempts.svg`}
              className="bg-primary rounded-full"
            />
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold">
              Contact Attempts
            </CardTitle>
            <div className="text-sm text-gray-500">May 13-20 · Thu</div>
          </div>
        </div>
        <Select defaultValue="7 day">
          <SelectTrigger className="w-[100px] h-8 rounded-md text-sm">
            <SelectValue placeholder="7 day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7 day">7 day</SelectItem>
            <SelectItem value="14 day">14 day</SelectItem>
            <SelectItem value="21 day">21 day</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex pt-4 justify-between items-center">
        <div className="width-fit">
          <div className="text-xl font-bold text-gray-800">48</div>

          <div className="text-sm text-gray-500 w-fit">
            Todays calls
            <span className="font-semibold text-[#0357F8]">10</span>
          </div>

          <div className="flex text-sm text-green-500">
            Answered Calls
            <span className="font-semibold text-[#0357F8]">1</span>
            <span className="text-green-500 font-semibold">+10%</span>
          </div>
        </div>

        <BarChartComponent data={chartData} />
      </CardContent>
    </Card>
  );
}

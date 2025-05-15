import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MonthlyMinutesCard() {
  return (
    <Card className="w-full h-64 shadow-md space-y-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-row items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`/mmused.svg`}
              className="bg-primary rounded-full"
            />
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold">
              Monthly minutes <br></br> Used
            </CardTitle>
          </div>
        </div>
        <Select defaultValue="Monthly">
          <SelectTrigger className="w-[100px] h-8 rounded-md text-sm">
            <SelectValue placeholder="Monthly" />{" "}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Monthly">Weekly</SelectItem>
            <SelectItem value="seconds">Monthly</SelectItem>
            <SelectItem value="minutes">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col justify-between pt-4 space-y-2">
        <div className="text-xl font-bold text-gray-800">144</div>
        <div className="flex justify-between items-center space-x-6">
          <div className="flex flex-col space-x-1">
            <div className="text-sm text-gray-700 font-medium">
              Remaining Minutes . <span className="text-[#0357F8]">164</span>
            </div>
            <div className="text-sm text-blue-500 font-light">
              Remaining Minutes
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <div className="text-sm text-[#0357F8] font-semibold">112.</div>{" "}
              <div className="text-sm text-gray-700 font-medium">Outbond</div>{" "}
            </div>
            <div className="flex items-baseline space-x-1">
              <div className="text-sm text-[#0357F8] font-semibold">52.</div>{" "}
              <div className="text-sm text-gray-700 font-medium">Inbond</div>{" "}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

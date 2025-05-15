import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import CircularProgressBar from "./CircularProgressBar";

export function TaskManagementCard() {
  return (
    <Card className="w-full h-full md:h-full sm:h-full lg:h-1/6 xl:h-1/6 2xl:h-1/6 shadow-md overflow-y-auto">
      <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
        <CardTitle className="text-lg font-semibold">Task Management</CardTitle>
        <Select defaultValue="Today">
          <SelectTrigger className="w-[100px] h-8 rounded-md text-sm">
            <SelectValue placeholder="Today" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Today">Today</SelectItem>
            <SelectItem value="Tomorrow">Tomorrow</SelectItem>
            <SelectItem value="Next Week">Next Week</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-600 text-white rounded-full text-sm font-normal"
          >
            Add Task +
          </Button>
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <div>
                <CardTitle className="text-blue-500 text-sm font-normal">
                  Lead Follow Up
                </CardTitle>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-500 text-sm font-normal">
                      Listing Management
                    </CardTitle>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Thursday, May 20. 2025
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CircularProgressBar percentage={21} />
            </div>
          </div>
          <ul className="mt-2 space-y-2">
            <li className="bg-[#F6F6F9] p-4 rounded-sm">
              <TaskItem description="Follow up with John & Lisa about their pending offer, confirm any counter offers and next steps." />
            </li>
            <li className="bg-[#F6F6F9] p-4 rounded-sm">
              <TaskItem description="Send follow-up emails to potential buyers who viewed 123 Main St.last weekend." />
            </li>
            <li className="bg-[#F6F6F9] p-4 rounded-sm">
              <TaskItem description="Update CRM with new lead information and tag hot prospects for priority follow up." />
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface TaskItemProps {
  description: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ description }) => {
  return (
    <div className="flex items-start space-x-2">
      <div className="text-blue-500 mt-1">&#x2726;</div> 
      <div className="flex-1">
        <div className="text-gray-700 text-sm">{description}</div>
        <div className="flex space-x-4 mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 p-0 hover:bg-transparent"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 p-0 hover:bg-transparent"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

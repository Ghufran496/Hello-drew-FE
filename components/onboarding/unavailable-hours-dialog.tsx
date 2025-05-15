import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "@/components/ui/button";
import { WheelPicker } from "@/components/onboarding/wheel-picker";

type BaseProps = {
  onSuccess: (start: string, end: string) => void;
};

type UnavailableHoursDialogProps = BaseProps &
  (
    | {
        trigger: React.ReactNode;
        open?: never;
        onOpenChange?: never;
      }
    | {
        trigger?: never;
        open: boolean;
        onOpenChange: (v: boolean) => void;
      }
  );

const hourItems = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: index + 1
}));

const ampmItems = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" }
];

export function UnavailableHoursDialog({
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: UnavailableHoursDialogProps) {
  const [startHour, setStartHour] = useState(hourItems[5].value);
  const [startAmpm, setStartAmpm] = useState(ampmItems[0].value);

  const [endHour, setEndHour] = useState(hourItems[5].value);
  const [endAmpm, setEndAmpm] = useState(ampmItems[0].value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-[28rem]">
        <DialogTitle>Add Time</DialogTitle>
        <div className="flex  items-center gap-4 mt-4">
          <div>
            <WheelPicker
              hourItems={hourItems.map(item => ({ ...item, label: item.label.toString() }))}
              hourValue={startHour}
              onHourChange={(value) => setStartHour(value as number)}
              ampmItems={ampmItems}
              ampmValue={startAmpm}
              onAmpmChange={(value) => setStartAmpm(value as string)}
            />
          </div>
          <div className="text-3xl font-bold"> - </div>
          <div>
            <WheelPicker
              hourItems={hourItems.map(item => ({ ...item, label: item.label.toString() }))}
              hourValue={endHour}
              onHourChange={(value) => setEndHour(value as number)}
              ampmItems={ampmItems}
              ampmValue={endAmpm}
              onAmpmChange={(value) => setEndAmpm(value as string)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose
            onClick={() => {
              onSuccess(
                `${startHour} ${startAmpm}`,
                `${endHour} ${endAmpm}`
              );
            }}
            asChild
          >
            <Button className="w-full py-6 font-bold text-lg" disabled={!startHour || !startAmpm || !endHour || !endAmpm}>
              Add
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

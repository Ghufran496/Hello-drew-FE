import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

export type Leads = "0-50" | "50-100" | "100+";

type BaseProps = {
  leads?: Leads;
  onLeadsChange: (lead: Leads) => void;
  onSuccess: () => void;
};

type LeadsDialogProps = BaseProps &
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

export function LeadsDialog({
  leads,
  onLeadsChange,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: LeadsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>How many leads do you juggle each month?</DialogTitle>
        <DialogDescription className="sr-only">
          Select how many leads you get each month for us to find the right
          package for you.
        </DialogDescription>
        <RadioGroup
          className="gap-4 my-4"
          value={leads}
          onValueChange={(v) => onLeadsChange(v as Leads)}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value={"0-50"} id={"0-50"} />
            <Label htmlFor="0-50">
              <strong>0–50:</strong> Small but mighty. Drew’s here to scale with
              you.
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value={"50-100"} id={"50-100"} />
            <Label htmlFor="50-100">
              <strong>50–100:</strong> Steady hustle! Let’s make it even
              smoother.
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value={"100+"} id={"100+"} />
            <Label htmlFor="100+">
              <strong>100+:</strong> Power agent in action! Drew’s got your back
            </Label>
          </div>
        </RadioGroup>
        <DialogFooter>
          <DialogClose
            onClick={() => {
              onSuccess();
            }}
            asChild
          >
            <Button size="lg" disabled={!leads}>
              Submit
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

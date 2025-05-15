"use client";

import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type BaseProps = {
  className?: string;
  name: string;
  features: string[] | null;
  price?: number;
};

type PackageCardProps = BaseProps &
  (
    | {
        onSelect: () => void;
        buttonLabel?: string;
      }
    | {
        onSelect?: never;
        buttonLabel?: never;
      }
  );

export function PackageCard({
  onSelect,
  buttonLabel,
  features,
  name,
  price,
  className,
}: PackageCardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl p-6 border",
        className
      )}
    >
      <h3 className="text-primary text-lg">{name}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:p-5 mb-3">
        {features?.map((feature) => (
          <p key={feature} className="flex items-start gap-3 leading-snug">
            <span
              className={
                "rounded-full p-0.5 bg-primary text-primary-foreground"
              }
            >
              <Check size={16} />
            </span>

            <span className={"text-sm text-muted-foreground"}>{feature}</span>
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          {price ? (
            <div className="font-bold flex items-center justify-start w-fit">
              <span className="text-2xl">${price / 100}</span>
              <span className="ml-2.5 text-sm">/Month</span>
            </div>
          ) : (
            <p className="font-bold text-sm">Custom Pricing</p>
          )}
        </div>
        {onSelect && (
          <Button variant={"secondary"} size={"lg"} onClick={onSelect}>
            {buttonLabel ?? "Select"}
          </Button>
        )}
      </div>
    </div>
  );
}

'use client';

import { LeadProfile } from "@/components/lead-profile";
import { MeetingsTab } from "@/components/meetings-tab";

interface LeadProfileWrapperProps {
  leadId: string;
}

export function LeadProfileWrapper({ leadId }: LeadProfileWrapperProps) {
  return (
    <div className="flex flex-col gap-4">
      <LeadProfile leadId={leadId} />
      <MeetingsTab />
    </div>
  );
} 
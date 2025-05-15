'use client'
import { LayoutWithSidebar } from "@/components/layout-with-sidebar";
import { LeadProfileWrapper } from "@/components/lead-profile-wrapper";
import { useParams } from 'next/navigation'


export default function LeadProfilePage() {
  const params = useParams();
  return (
    <LayoutWithSidebar title={"Lead Details"}>
      <LeadProfileWrapper leadId={params.id as string} />
    </LayoutWithSidebar>
  );
}
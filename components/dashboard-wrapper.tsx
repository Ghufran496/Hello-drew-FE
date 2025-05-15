"use client";

import { CallsChart } from "@/components/calls-chart";
// import { AppointmentsChart } from "@/components/appointments-chart";
// import { LeadsFunnel } from "@/components/leads-funnel";
// import { TeamActivity } from "@/components/team-activity";
import { UpcomingMeetings } from "@/components/upcoming-meetings";
// import { PostMeetingInsights } from "@/components/post-meeting-insights";
import { LeadsTable } from "./leads-table";
import { AppointmentsTable } from "./appoinments-table";
import { IntegrationsTable } from "./integration-table";
import { MeetingsTable } from "./meeting-table";
import { CallsTable } from "./calls-table";
import { ReportsData } from "./reports-data";
import { Setting } from "./settings/setting";
import { NewLeadChart } from "./newlead-chart";
import { ContactAttemptCard } from "./contact-attempt";
import { MonthlyMinutesCard } from "./monthly-minutes";
import { TaskManagementCard } from "./task-managment";
// import { PersistentCall } from "./persistent-call";
// import { Sidebar } from "@/components/sidebar";
// import { Header } from "@/components/header";
// import { ChatBotIcon } from "@/components/chat/chat-bot-icon";
// import { TeamTable } from "./team-table";
import { LayoutWithSidebar } from "./layout-with-sidebar";
import { ContractData } from "./contract-table";
import { TeamTable } from "./team-table";
import { HouseCardList } from "./propertiesCard";

export function DashboardWrapper({ title }: { title: string }) {
  return (
    <LayoutWithSidebar title={title}>
      {title === 'Dashboard' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-6 mb-6">
            <NewLeadChart />
            <ContactAttemptCard />
            <MonthlyMinutesCard />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
            <div className="md:col-span-3">
              <CallsChart />
            </div>
            <div className="md:col-span-3">
              <HouseCardList />
              {/* <AppointmentsChart /> */}
            </div>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
            <div className="md:col-span-2">
              <LeadsFunnel />
            </div>
            <div className="md:col-span-4">
              <TeamActivity />
            </div>
          </div> */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskManagementCard />
            <UpcomingMeetings />
            {/* <PostMeetingInsights /> */}
          </div>
        </>
      )}
      {title === "Leads" && <LeadsTable />}
      {title === "Appointments" && <AppointmentsTable />}
      {title === "Virtual Meetings" && <MeetingsTable />}
      {title === "Calls" && <CallsTable />}
      {title === "Integrations Management" && <IntegrationsTable />}
      {title === "Reports & Analytics" && <ReportsData />}
      {title === "Settings" && <Setting />}
      {title === "Calls & Communication" && <CallsTable />}
      {title === "Contract Monitoring System" && <ContractData />}
      {title === "Team Activity" && <TeamTable />}
    </LayoutWithSidebar>
  );
}

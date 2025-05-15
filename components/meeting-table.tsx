'use client';

import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ScheduleForm } from "./form/schedule-form";
import { MeetingDetails } from "./meeting-details";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Meeting {
  id: number;
  meetingTime: string;
  status: string;
  title: string;
  meetingApp: string;
  participantDetails: {
    lead: {
      id: number;
    };
    duration: number;
    event_id: string | null;
    location: string | null;
    description: string | null;
    calendar_link: string | null;
  };
}

const statuses = ["All", "Upcoming", "Completed", "Cancelled", "In Progress"];

export function MeetingsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: userData } = useLocalStorage<{ id: number }>('user_onboarding');

  useEffect(() => {
    if (!userData?.id) return;

    const fetchMeetings = async () => {
      setIsLoading(true);
      try {
        // Fetch drew lead meetings
        const drewLeadRes = await fetch('/api/analytics/drew-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.id,
            type: 'MEETING'
          })
        });
        const drewLeadData = await drewLeadRes.json();
        console.log(drewLeadData, "drewLeadData");
        // Fetch user lead meetings  
        const userLeadRes = await fetch('/api/analytics/user-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({
            userId: userData.id,
            type: 'MEETING'
          })
        });
        const userLeadData = await userLeadRes.json();
        console.log(userLeadData, "userLeadData");
        // Combine and format meetings data
        const formattedMeetings = [
          ...(drewLeadData.communicationRecords || []),
          ...(userLeadData.communicationRecords || [])
        ].map(meeting => ({
          id: meeting.id,
          meetingTime: meeting.created_at,
          status: meeting.status?.toLowerCase() || "scheduled",
          participantDetails: {
            lead: {
              id: meeting.lead_id || 0,
            },
            duration: meeting.details?.duration || 1800,
            event_id: meeting.details?.event_id || null,
            location: meeting.details?.location || null,
            description: meeting.description || null,
            calendar_link: meeting.details?.calendar_link || null
          },
          title: meeting.details?.notes || "Virtual Meeting",
          meetingApp: meeting.details?.platform || "Google Meet",
        }));

        setMeetings(formattedMeetings as Meeting[]);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [userData?.id]);

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          meeting.participantDetails.lead.id.toString().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || meeting.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="lg:p-4 w-full ">
      <div className="flex items-center flex-col lg:flex-row justify-between mb-6">
        <div className="flex items-center space-x-4 flex-col md:flex-row">
          <h2 className="text-xl font-semibold">{filteredMeetings.length} Schedule</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-10 md:w-[280px] w-[340px]"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-2  lg:mt-0">
          <div className="relative">
          <Button
            variant="outline"
            className="h-12"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Status: {selectedStatus} <ChevronDown />
          </Button>

            <div className="absolute bg-white shadow-lg rounded-md mt-2 w-40 z-10">
              {showDropdown && (
                <div className="absolute bg-white shadow-lg rounded-md mt-2 w-40 z-10">
                  {statuses.map((status) => (
                    <p
                      key={status}
                      className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${selectedStatus === status ? "font-semibold" : ""}`}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowDropdown(false);
                      }}
                    >
                      {status}
                    </p>
                  ))}
                </div>
              )}

            </div>
          </div>
          <Button onClick={() => setIsScheduleOpen(true)} className="h-12 font-semibold bg-primary text-white">New Schedule <Plus /></Button>
          <ScheduleForm open={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
        </div>
      </div>

      {selectedMeeting && (
        <MeetingDetails open={isMeetingOpen} data={selectedMeeting} onClose={() => setIsMeetingOpen(false)} />
      )}

      <CardContent className="p-6 h-[150vh] md:h-auto">
        <Tabs defaultValue="calls" className="w-full">
          <TabsContent value="calls" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {isLoading ? (
              <div className="col-span-3 flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500"></span>
              </div>
            ) : filteredMeetings.length > 0 ? (
              filteredMeetings.map((meeting, index) => (
                <div key={index} 
                  onClick={() => { setSelectedMeeting(meeting); setIsMeetingOpen(true); }}
                  className="p-6 cursor-pointer hover:-translate-y-2 duration-300 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{meeting.title}</h3>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm",
                      meeting.status === "completed" && "bg-green-50 text-green-600",
                      meeting.status === "scheduled" && "bg-blue-50 text-blue-600", 
                      meeting.status === "cancelled" && "bg-red-100 text-red-600",
                      meeting.status === "in_progress" && "bg-yellow-100 text-yellow-600",
                    )}>
                      {meeting.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <p className="text-sm">
                        {new Date(meeting.meetingTime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {meeting.meetingApp && (
                        <Image 
                          src={meeting.meetingApp === "Microsoft Teams" ? "/teams.svg" : `/${meeting.meetingApp.toLowerCase()}.svg`}
                          alt={meeting.meetingApp}
                          className="w-5 h-5"
                          width={20}
                          height={20}
                        />
                      )}
                      <p className="text-sm">{meeting.meetingApp}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No meetings found</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}
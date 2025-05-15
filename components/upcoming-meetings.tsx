"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import CalendarCarousel from "./CalendarCarousel";

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}
interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface ParticipantDetails {
  lead: Participant;
  duration: number;
  event_id: string;
  calendar_link: string;
}

interface Meeting {
  id: number;
  userId: number;
  appointmentTime: string;
  status: string;
  participantDetails: ParticipantDetails;
  createdAt: string;
}

export function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { data: userData } = useLocalStorage<UserData>("user_onboarding");

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const userId = userData?.id;

        const response = await fetch("/api/analytics/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch meetings");
        }

        const data = await response.json();
        setMeetings(data.appointmentRecords);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, [userData]);

  return (
    <Card className="w-full h-1/6 overflow-y-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
          <Button variant="link" className="text-[#0357f8]">
            See All
          </Button>
        </div>
      </CardHeader>
      <div>
        <CalendarCarousel />
        <Table className="mt-4">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-gray-600 font-medium">Name</TableHead>
              <TableHead className="text-gray-600 font-medium">Time</TableHead>
              <TableHead className="text-gray-600 font-medium">Date</TableHead>
              <TableHead className="text-gray-600 font-medium">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((meeting) => {
              const appointmentDate = new Date(meeting.appointmentTime);
              const formattedTime = appointmentDate.toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }
              );
              const formattedDate = appointmentDate.toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              );
              const displayName =
                meeting.participantDetails.lead.name || "Calendly Lead";
              const initials =
                displayName === "Calendly Lead"
                  ? "CL"
                  : displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("");

              return (
                <TableRow key={meeting.id} className="hover:bg-gray-50">
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/logo.svg`}
                        className="bg-primary rounded-full"
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{displayName}</span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formattedTime}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formattedDate}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button
                        className="bg-primary hover:bg-primary/80 text-white"
                        size="sm"
                        onClick={() =>
                          window.open(meeting.participantDetails.calendar_link)
                        }
                      >
                        Join
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
    </Card>
  );
}

"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import Image from "next/image"

interface UserData {
  id: number;
}

interface Call {
  id: number;
  leadId: number;
  status: string;
  details: {
    duration: string;
    notes?: string;
  };
  leadName?: string;
  createdAt: string;
  type: string;
}

interface Email {
  id: number;
  leadId: number;
  status: string;
  details: {
    subject?: string;
    notes?: string;
  };
  leadEmail?: string;
  createdAt: string;
  type: string;
}

interface Meeting {
  id: number;
  leadId: number;
  status: string;
  details: {
    duration?: string;
    notes?: string;
    platform?: 'zoom' | 'google_meet';
    meeting_link?: string;
  };
  leadName?: string;
  createdAt: string;
  type: string;
}

interface Text {
  id: number;
  leadId: number;
  status: string;
  details: {
    message?: string;
    notes?: string;
  };
  leadPhone?: string;
  createdAt: string;
  type: string;
}

export function MeetingsTab() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [texts, setTexts] = useState<Text[]>([]);
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isLoadingTexts, setIsLoadingTexts] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      if (!userData?.id) return;

      try {
        const response = await fetch('/api/analytics/drew-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userData.id, type: "CALL" }),
        });

        if (!response.ok) throw new Error('Failed to fetch calls');

        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        
        // Process the communicationRecords array from the response
        if (data.communicationRecords && Array.isArray(data.communicationRecords)) {
          const callsWithLeadNames = await Promise.all(
            data.communicationRecords.map(async (call: Call) => ({
              id: call.id,
              leadId: call.leadId,
              status: call.status || 'completed',
              type: call.type,
              details: {
                duration: call.details?.duration || "0 minutes",
                notes: call.details?.notes
              },
              leadName: call.leadId ? await fetchLeadName(call.leadId) : undefined,
              createdAt: call.createdAt || new Date().toISOString()
            }))
          );
          
          console.log('Processed calls:', callsWithLeadNames);
          setCalls(callsWithLeadNames);
        }
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEmails = async () => {
      if (!userData?.id) return;

      try {
        const response = await fetch('/api/analytics/drew-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userData.id, type: "EMAIL" }),
        });

        if (!response.ok) throw new Error('Failed to fetch emails');

        const data = await response.json();
        
        if (data.communicationRecords && Array.isArray(data.communicationRecords)) {
          const emailsWithLeadInfo = await Promise.all(
            data.communicationRecords.map(async (email: Email) => ({
              id: email.id,
              leadId: email.leadId,
              status: email.status || 'sent',
              type: email.type,
              details: {
                subject: email.details?.subject,
                notes: email.details?.notes
              },
              leadEmail: email.leadId ? await fetchLeadEmail(email.leadId) : undefined,
              createdAt: email.createdAt || new Date().toISOString()
            }))
          );
          
          setEmails(emailsWithLeadInfo);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setIsLoadingEmails(false);
      }
    };

    const fetchMeetings = async () => {
      if (!userData?.id) return;

      try {
        const response = await fetch('/api/analytics/drew-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userData.id, type: "MEETING" }),
        });

        if (!response.ok) throw new Error('Failed to fetch meetings');

        const data = await response.json();
        
        if (data.communicationRecords && Array.isArray(data.communicationRecords)) {
          const meetingsWithLeadInfo = await Promise.all(
            data.communicationRecords.map(async (meeting: Meeting) => ({
              id: meeting.id,
              leadId: meeting.leadId,
              status: meeting.status || 'scheduled',
              type: meeting.type,
              details: {
                duration: meeting.details?.duration,
                notes: meeting.details?.notes,
                platform: meeting.details?.platform,
                meeting_link: meeting.details?.meeting_link
              },
              leadName: meeting.leadId ? await fetchLeadName(meeting.leadId) : undefined,
              createdAt: meeting.createdAt || new Date().toISOString()
            }))
          );
          
          setMeetings(meetingsWithLeadInfo);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setIsLoadingMeetings(false);
      }
    };

    // Simulating texts data with fake data
    const fetchTexts = async () => {
      setIsLoadingTexts(true);
      const fakeTexts: Text[] = [
        {
          id: 1,
          leadId: 1,
          status: "SENT",
          details: {
            message: "Hi, following up on our conversation",
            notes: "Quick follow-up"
          },
          leadPhone: "+1234567890",
          createdAt: new Date().toISOString(),
          type: "TEXT"
        },
        {
          id: 2,
          leadId: 2,
          status: "DELIVERED",
          details: {
            message: "Meeting confirmed for tomorrow",
            notes: "Confirmation message"
          },
          leadPhone: "+1987654321",
          createdAt: new Date().toISOString(),
          type: "TEXT"
        }
      ];
      setTexts(fakeTexts);
      setIsLoadingTexts(false);
    };

    fetchCalls();
    fetchEmails();
    fetchMeetings();
    fetchTexts();
  }, [userData?.id]);

  const fetchLeadName = async (leadId: number) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      if (response.ok) {
        const data = await response.json();
        return data.name;
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    }
    return undefined;
  };

  const fetchLeadEmail = async (leadId: number) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      if (response.ok) {
        const data = await response.json();
        return data.email;
      }
    } catch (error) {
      console.error('Error fetching lead email:', error);
    }
    return undefined;
  };

  return (
    <div className="p-6">
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <Tabs defaultValue="calls" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-gray-200 rounded-sm py-2 px-0">
                <TabsTrigger value="calls" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Calls
                </TabsTrigger>
                <TabsTrigger value="emails" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Emails
                </TabsTrigger>
                <TabsTrigger value="meetings" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Meetings
                </TabsTrigger>
                <TabsTrigger value="texts" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Texts
                </TabsTrigger>
              </TabsList>
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input type="search" placeholder="Search.." className="pl-10 bg-white border-gray-200" />
              </div>
            </div>

            <TabsContent value="calls" className="grid grid-cols-3 gap-4 pb-8">
              {isLoading ? (
                <div className="col-span-3 text-center py-4">Loading...</div>
              ) : calls.length === 0 ? (
                <div className="col-span-3 text-center py-4">No calls found</div>
              ) : (
                calls.map((call, index) => (
                  <div key={index} className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {call.leadName ? `Call with ${call.leadName}` : 'Call'}
                      </h3>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-sm",
                          call.status === "COMPLETED" && "bg-green-50 text-green-600",
                          call.status === "CANCELLED" && "bg-red-50 text-red-600",
                          call.status === "SCHEDULED" && "bg-blue-50 text-blue-600"
                        )}
                      >
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                    </div>
                    {call.details?.duration !== "0 minutes" && (
                      <div className="text-gray-500 text-sm">
                        Duration: {call.details?.duration}
                      </div>
                    )}
                  
                    {call.details?.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        Notes: {call.details.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="emails">
              <div className="grid grid-cols-2 gap-4 pb-8">
                {isLoadingEmails ? (
                  <div className="text-center py-4">Loading...</div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-4">No emails found</div>
                ) : (
                  emails.map((email, index) => (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-lg mb-1">
                            {email.details?.subject || 'No Subject'}
                          </h3>
                          <div className="text-gray-500 text-sm">
                            To: {email.leadEmail || 'Unknown Recipient'}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-sm",
                            email.status === "SUCCESSFUL" && "bg-green-50 text-green-600", 
                            email.status === "DRAFT" && "bg-gray-50 text-gray-600",
                            email.status === "FAILED" && "bg-red-50 text-red-600"
                          )}
                        >
                          {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                        </span>
                      </div>
                      {email.details?.notes && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {email.details.notes}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(email.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="meetings">
              <div className="grid grid-cols-2 gap-4 pb-8">
                {isLoadingMeetings ? (
                  <div className="text-center py-4">Loading...</div>
                ) : meetings.length === 0 ? (
                  <div className="text-center py-4">No meetings found</div>
                ) : (
                  meetings.map((meeting, index) => (
                    <div key={index} className="p-6 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {meeting.leadName ? `Meeting with ${meeting.leadName}` : 'Meeting'}
                          </h3>
                          {meeting.details?.platform && (
                            <Image 
                              src={`/${meeting.details.platform}.svg`} 
                              alt={meeting.details.platform}
                              className="w-5 h-5"
                              width={20}
                              height={20}
                            />
                          )}
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-sm",
                            meeting.status === "SCHEDULED" && "bg-blue-50 text-blue-600",
                            meeting.status === "COMPLETED" && "bg-green-50 text-green-600",
                            meeting.status === "CANCELLED" && "bg-gray-100 text-gray-600"
                          )}
                        >
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </span>
                      </div>
                      {meeting.details?.duration && (
                        <div className="text-gray-500 text-sm">
                          Duration: {meeting.details.duration}
                        </div>
                      )}
                      {meeting.details?.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          Notes: {meeting.details.notes}
                        </div>
                      )}
                      {meeting.details?.meeting_link && (
                        <a 
                          href={meeting.details.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="mt-2 text-sm text-blue-600 hover:underline block"
                        >
                          Join Meeting
                        </a>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(meeting.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="texts">
              <div className="grid grid-cols-2 gap-4 pb-8">
                {isLoadingTexts ? (
                  <div className="text-center py-4">Loading...</div>
                ) : texts.length === 0 ? (
                  <div className="text-center py-4">No texts found</div>
                ) : (
                  texts.map((text, index) => (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-gray-500 text-sm">
                            To: {text.leadPhone || 'Unknown Number'}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-sm",
                            text.status === "SENT" && "bg-green-50 text-green-600",
                            text.status === "DELIVERED" && "bg-blue-50 text-blue-600",
                            text.status === "FAILED" && "bg-red-50 text-red-600"
                          )}
                        >
                          {text.status.charAt(0).toUpperCase() + text.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {text.details?.message}
                      </div>
                      {text.details?.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          Notes: {text.details.notes}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(text.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

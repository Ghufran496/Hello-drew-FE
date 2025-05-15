'use client'
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CardContent } from "@/components/ui/card"
import Image from "next/image"
import { ConversionRates } from "./conversion-chart"
import { ResponseChart } from "./response-chart"
import { ResponseRates } from "./response-rate"
import { useEffect, useState } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { LeadCallsChart } from "./lead-calls-chart"
interface CommunicationStats {
  callsMade: string;
  callsAnswered: string;
  callsMissed: string;
  textsSent: string;
  textsReceived: string;
  unreadTexts: string;
  completedCalls: number;
  cancelledCalls: number;
  emailsSent: string;
  emailsOpened: string;
  emailsClicked: string;
  callConversionRate: number;
  textResponseRate: number;
  emailOpenRate: number;
  emailClickRate: number;
}

export function ReportsData() {
  const [stats, setStats] = useState<CommunicationStats>({
    callsMade: "0",
    callsAnswered: "0", 
    callsMissed: "0",
    textsSent: "0",
    textsReceived: "0",
    unreadTexts: "0",
    completedCalls: 0,
    cancelledCalls: 0,
    emailsSent: "0",
    emailsOpened: "0", 
    emailsClicked: "0",
    callConversionRate: 0,
    textResponseRate: 0,
    emailOpenRate: 0,
    emailClickRate: 0
  });

  const { data: userData } = useLocalStorage<{ id: number }>('user_onboarding');

  useEffect(() => {
    async function fetchCommunicationStats() {
      try {
        // Fetch call stats
        const callResponse = await fetch(`/api/analytics/drew-lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userData?.id,
            type: 'CALL'
          })
        });
        const callData = await callResponse.json();
        
        // Fetch text stats
        const textResponse = await fetch(`/api/analytics/drew-lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userData?.id,
            type: 'TEXT'
          })
        });
        const textData = await textResponse.json();

        // Fetch email stats
        const emailResponse = await fetch(`/api/analytics/drew-lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userData?.id,
            type: 'EMAIL'
          })
        });
        const emailData = await emailResponse.json();

        // Process call stats
        const completedCalls = callData.communicationRecords.filter(
          (record: { status: string }) => record.status?.toLowerCase() === 'completed'
        ).length;
        
        const cancelledCalls = callData.communicationRecords.filter(
          (record: { status: string }) => record.status?.toLowerCase() === 'cancelled'
        ).length;

        const callsMade = completedCalls + cancelledCalls;
        const callConversionRate = (completedCalls / callsMade) * 100;

        // Process text stats
        const textsSent = textData.communicationRecords.filter(
          (record: { status: string }) => record.status === 'SENT'
        ).length;

        const textsReceived = textData.communicationRecords.filter(
          (record: { status: string }) => record.status === 'RECEIVED'
        ).length;

        const unreadTexts = textData.communicationRecords.filter(
          (record: { status: string }) => record.status === 'UNREAD'
        ).length;

        const textResponseRate = textsSent > 0 ? (textsReceived / textsSent) * 100 : 0;

        // Process email stats
        const emailsSent = emailData.communicationRecords.filter(
          (record: { status: string }) => record.status?.toLowerCase() === 'sent'
        ).length;

        const emailsOpened = emailData.communicationRecords.filter(
          (record: { status: string }) => record.status?.toLowerCase() === 'opened'
        ).length;

        const emailsClicked = emailData.communicationRecords.filter(
          (record: { status: string }) => record.status?.toLowerCase() === 'clicked'
        ).length;

        const emailOpenRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;
        const emailClickRate = emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0;

        // Update state with all stats
        setStats({
          callsMade: callsMade.toString(),
          callsAnswered: "0",
          callsMissed: "0",
          completedCalls,
          cancelledCalls,
          callConversionRate,
          
          textsSent: textsSent.toString(),
          textsReceived: textsReceived.toString(),
          unreadTexts: unreadTexts.toString(),
          textResponseRate,
          
          emailsSent: emailsSent.toString(),
          emailsOpened: emailsOpened.toString(),
          emailsClicked: emailsClicked.toString(),
          emailOpenRate,
          emailClickRate
        });

      } catch (error) {
        console.error("Error fetching communication stats:", error);
      }
    }

    if (userData?.id) {
      fetchCommunicationStats();
    }
  }, [userData?.id]);

  const calls = [{
    callsMade: stats.callsMade,
    callAnswered: stats.callsAnswered,
    callsMissed: stats.callsMissed,
    completedCalls: stats.completedCalls,
    cancelledCalls: stats.cancelledCalls
  }];

  const texts = [{
    textsSent: stats.textsSent,
    textRecieve: stats.textsReceived,
    textUnread: stats.unreadTexts,
  }];

  const emails = [{
    emailsSent: stats.emailsSent,
    emailsOpened: stats.emailsOpened,
    emailsClicked: stats.emailsClicked
  }];


  const emailMetrics = {
    sent: parseInt(stats.emailsSent),
    opened: parseInt(stats.emailsOpened),
    clicked: parseInt(stats.emailsClicked),
    openRate: stats.emailOpenRate,
    clickRate: stats.emailClickRate
  };

  return (
    <div className="md:p-4 w-full ">
      <div >
        <CardContent className="md:p-6">
          <Tabs defaultValue="calls" className="w-full">
            <div className="flex items-center flex-col md:flex-row justify-between mb-6">
              <TabsList className="bg-gray-200 rounded-sm py-2 px-0">
                <TabsTrigger value="calls" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Calls
                </TabsTrigger>
                <TabsTrigger value="texts" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Texts
                </TabsTrigger>
                <TabsTrigger value="emails" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Emails
                </TabsTrigger>
                {/* <TabsTrigger value="leads" className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6">
                  Leads
                </TabsTrigger> */}
              </TabsList>
              <div className="flex items-center space-x-4 mt-2 md:mt-0 relative left-[80px] md:left-5">
                <Button variant="outline" className="h-12">Weekly <ChevronDown /> </Button>
                <Button className="font-semibold bg-primary text-white h-12">Export <Image src='/export.svg' width={10} height={10} alt="export" /> </Button>
              </div>
            </div>
            <TabsContent value="calls" className="gap-4 pb-8">
              {calls.map((call, index) => (
                <div key={index}>
                  <div className="flex-col md:flex-row flex justify-center items-center gap-2 mb-2">
                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/call.svg" alt={call.callsMade} width={40} height={40} />
                          <p>Calls Made</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{call.callsMade}</span>
                      </div>
                    </div>
                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/inCall.svg" alt="completed calls" width={40} height={40} />
                          <p>Completed Calls</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{call.completedCalls}</span>
                      </div>
                    </div>

                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/endCall.svg" alt="cancelled calls" width={40} height={40} />
                          <p>Cancelled Calls</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{call.cancelledCalls}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full">
                      <LeadCallsChart />
                    </div>
                    <div className="h-auto">
                       <ConversionRates conversionRate={stats.callConversionRate} />
                    </div>
                  </div>
                </div>
              ))}

            </TabsContent>
            <TabsContent value="texts">
              {texts.map((text, index) => (
                <div key={index} >
                  <div className="flex-col md:flex-row flex justify-center items-center gap-2 mb-2">
                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/sent.svg" alt={text.textsSent} width={40} height={40} />
                          <p>Text sent</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{text.textsSent}</span>
                      </div>
                    </div>
                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/recieve.svg" alt={text.textRecieve} width={40} height={40} />
                          <p>Text recieved</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{text.textRecieve}</span>
                      </div>
                    </div>

                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/unread.svg" alt={text.textUnread} width={40} height={40} />
                          <p>Unread text</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{text.textUnread}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between flex-col md:flex-row items-center gap-4">
                    <div className="w-full">
                      <ResponseChart 
                        textMetrics={{
                          sent: parseInt(stats.textsSent),
                          received: parseInt(stats.textsReceived),
                          unread: parseInt(stats.unreadTexts),
                          responseRate: stats.textResponseRate
                        }} 
                      />
                    </div>
                    <div className="h-auto">
                      <ResponseRates textResponseRate={stats.textResponseRate} />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="emails">
              {emails.map((email, index) => (
                <div key={index} >
                  <div className="flex-col md:flex-row flex justify-center items-center gap-2 mb-2">
                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/sent.svg" alt={email.emailsSent} width={40} height={40} />
                          <p>Emails Sent</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{email.emailsSent}</span>
                      </div>
                    </div>
                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/sent.svg" alt={email.emailsOpened} width={40} height={40} />
                          <p>Emails Opened</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{email.emailsOpened}</span>
                      </div>
                    </div>

                    <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                      <div className="flex justify-between items-center ">
                        <div className="flex flex-col gap-2 justify-start items-start">
                          <Image src="/sent.svg" alt={email.emailsClicked} width={40} height={40} />
                          <p>Emails Clicked</p>
                        </div>
                        <span className="text-black text-4xl font-semibold">{email.emailsClicked}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between flex-col md:flex-row items-center gap-4">
                    <div className="w-full">
                      <ResponseChart emailMetrics={emailMetrics} />
                    </div>
                    <div className="h-auto">
                      <ResponseRates 
                        emailOpenRate={stats.emailOpenRate}
                        emailClickRate={stats.emailClickRate}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            {/* <TabsContent value="leads">
              <div>
                No Leads Yet
              </div>
            </TabsContent> */}
          </Tabs>
        </CardContent>
      </div>
    </div>
  )
}
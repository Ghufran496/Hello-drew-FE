'use client';
import { Volume2, ScrollText, ChevronDown, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import CommunicationDrawer from './communication-drawer';

interface Communication {
  id: number;
  type: 'CALL' | 'EMAIL' | 'SMS';
  user_id: number;
  drew_id: string;
  lead_id: number;
  status: string;
  details: {
    transcript?: string;
    recording_url?: string;
    notes?: string;
    cancellation_reason?: string;
  };
  created_at: string;
  updated_at: string;
  lead: {
    id: number;
    user_id: number;
    external_id: string;
    source: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    drip_campaign: string;
    drip_campaign_status: string;
  };
}

interface UserData {
  id: number;
}

export function CallsTable() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: userData, isLoading: isUserDataLoading } =
    useLocalStorage<UserData>('user_onboarding');
  const [playingStates, setPlayingStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(
    null
  );
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedType, setSelectedType] = useState<'CALL' | 'SMS' | 'EMAIL'>(
    'CALL'
  );
  const [activeTab, setActiveTab] = useState('calls');
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedCommId, setSelectedCommId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) {
        setIsLoading(false);
        return;
      }

      setTabLoading(true);
      try {
        const commResponse = await fetch('/api/analytics/drew-lead-join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.id,
            type: selectedType,
          }),
        });

        const commData = await commResponse.json();
        if (commData.communicationRecords) {
          const formattedComms = commData.communicationRecords.map(
            (record: {
              communication: Communication;
              lead: Communication['lead'];
            }) => ({
              ...record.communication,
              lead: record.lead,
            })
          );
          setCommunications(formattedComms);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTabLoading(false);
        setIsLoading(false);
      }
    };

    if (!isUserDataLoading) {
      fetchData();
    }
  }, [userData?.id, isUserDataLoading, selectedType]);

  const handlePlayRecording = (id: number, url: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingStates({});
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;

    if (playingStates[id]) {
      audio.pause();
      setPlayingStates({});
    } else {
      audio.play();
      setPlayingStates({ [id]: true });

      audio.addEventListener('ended', () => {
        setPlayingStates({});
      });
    }
  };

  const handleReadTranscript = (transcript: string) => {
    setSelectedTranscript(transcript);
    setShowTranscriptDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading || isUserDataLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredCommunications = communications.filter(
    (comm) => comm.type === selectedType
  );

  const handleOpenDrawer = (commId: number) => {
    setSelectedCommId(commId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="lg:p-4 w-full">
      <div>
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              if (value === 'calls') setSelectedType('CALL');
              else if (value === 'texts') setSelectedType('SMS');
              else if (value === 'emails') setSelectedType('EMAIL');
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-0">
              <TabsList className="bg-gray-200 rounded-sm py-2 px-0">
                <TabsTrigger
                  value="calls"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6"
                >
                  Calls{' '}
                  {tabLoading && activeTab === 'calls' && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="texts"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6"
                >
                  Texts{' '}
                  {tabLoading && activeTab === 'texts' && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="emails"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-lg rounded-sm px-6"
                >
                  Emails{' '}
                  {tabLoading && activeTab === 'emails' && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                  )}
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-4 relative mt-2 md:mt-0 left-[100px] md:left-0">
                <Button variant="outline" className="font-semibold h-12">
                  Status: All
                  <ChevronDown />
                </Button>
              </div>
            </div>
            {isLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <TabsContent
                  value="calls"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8"
                >
                  {filteredCommunications.map((comm, index) => (
                    <div
                      key={index}
                      onClick={() => handleOpenDrawer(comm?.id)}
                      className="p-3 h-full bg-white border border-gray-200 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2 text-md md:text-xs lg:text-md">
                        <div className="flex justify-start items-center gap-2">
                          <Image
                            src="/logo.svg"
                            alt={comm.lead?.name || ''}
                            width={32}
                            height={32}
                            className="rounded-full bg-primary"
                          />
                          <div>
                            <span className="font-semibold">
                              {comm.lead?.name}
                            </span>
                            <p className="text-gray-600">{comm.lead?.phone}</p>
                            <p className="text-gray-600">{comm.lead?.email}</p>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {formatDate(comm.created_at)}
                        </p>
                      </div>
                      <p className="mt-4 mb-4 text-gray-500">
                        {comm.details?.notes}
                      </p>
                      <div className="flex justify-start items-start gap-4 text-xs">
                        {comm.details?.recording_url && (
                          <button
                            onClick={() =>
                              handlePlayRecording(
                                comm.id,
                                comm.details.recording_url!
                              )
                            }
                            className="font-semibold h-12 bg-primary hover:bg-primary/90 text-black w-full rounded-full flex justify-center items-center hover:-translate-y-2 duration-300 gap-1"
                          >
                            {playingStates[comm.id] ? (
                              <>
                                <Pause className="w-5 h-5 md:w-3 md:h-3 lg:w-5 lg:h-5" />{' '}
                                Pause Recording
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-5 h-5 md:w-3 md:h-3 lg:w-5 lg:h-5" />{' '}
                                Play Recording
                              </>
                            )}
                          </button>
                        )}
                        {comm.details?.transcript && (
                          <button
                            onClick={() =>
                              handleReadTranscript(comm.details.transcript!)
                            }
                            className="h-12 bg-black text-white w-full font-semibold rounded-full flex justify-center items-center gap-1 hover:-translate-y-2 duration-300"
                          >
                            <ScrollText size={20} /> Read Transcript
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent
                  value="texts"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8"
                >
                  {filteredCommunications.map((comm, index) => (
                    <div
                      key={index}
                      className="p-3 h-full bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex justify-start items-center gap-2">
                          <Image
                            src="/logo.svg"
                            alt={comm.lead?.name || ''}
                            width={32}
                            height={32}
                            className="rounded-full bg-primary"
                          />
                          <div>
                            <span className="font-semibold">
                              {comm.lead?.name}
                            </span>
                            <p className="text-gray-600">{comm.lead?.phone}</p>
                            <p className="text-gray-600">{comm.lead?.email}</p>
                          </div>
                        </div>
                        <Image
                          src="/flag.svg"
                          alt="flag"
                          width={20}
                          height={20}
                        />
                      </div>
                      <p className="mt-4 mb-4 text-gray-500">
                        {comm.details?.notes}
                      </p>
                      <div className="flex justify-center items-start gap-4 text-xs md:text-md">
                        <button className="font-semibold h-12 bg-primary text-primary-foreground shadow hover:bg-primary/90 w-full rounded-full flex justify-center items-center hover:-translate-y-2 duration-300 gap-1">
                          Follow Up
                        </button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent
                  value="emails"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8"
                >
                  {filteredCommunications.length === 0 ? (
                    <div>No Emails Yet</div>
                  ) : (
                    filteredCommunications.map(
                      (comm, index) =>
                        comm.details?.notes && (
                          <div
                            key={index}
                            className="p-3 h-full bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex justify-start items-center gap-2">
                                <Image
                                  src="/logo.svg"
                                  alt={comm.lead?.name || ''}
                                  width={32}
                                  height={32}
                                  className="rounded-full bg-primary"
                                />
                                <div>
                                  <span className="font-semibold">
                                    {comm.lead?.name}
                                  </span>
                                  <p className="text-gray-600">
                                    {comm.lead?.phone}
                                  </p>
                                  <p className="text-gray-600">
                                    {comm.lead?.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="mt-4 mb-4 text-gray-500">
                              {comm.details?.notes}
                            </p>
                          </div>
                        )
                    )
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </div>

      {/* Drawer Component */}
      {isDrawerOpen && selectedCommId && (
        <CommunicationDrawer
          selectedCommId={selectedCommId}
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      <Dialog
        open={showTranscriptDialog}
        onOpenChange={setShowTranscriptDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-4">
              Call Transcript
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedTranscript}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

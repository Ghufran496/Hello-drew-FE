'use client'

import * as Dialog from "@radix-ui/react-dialog";
import { X, Clock, CalendarDays, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: "0%", opacity: 1, transition: { type: "spring", stiffness: 200, damping: 30 } },
  exit: { x: "100%", opacity: 0, transition: { ease: "easeInOut", duration: 0.3 } },
};

interface LeadInfo {
  id: number;
  name: string;
  email: string;
  lead_details: {
    picture: {
      small: string;
    }
  }
}

interface MeetingDetailsProps {
  open: boolean;
  onClose: () => void;
  data: {
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
  };
}

export function MeetingDetails({ open, onClose, data }: MeetingDetailsProps) {
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);

  useEffect(() => {
    const fetchLeadInfo = async () => {
      if (!data?.participantDetails?.lead?.id) return;
      
      try {
        const response = await fetch(`/api/leads/${data.participantDetails.lead.id}`);
        if (!response.ok) throw new Error('Failed to fetch lead info');
        const leadData = await response.json();
        setLeadInfo(leadData);
      } catch (error) {
        console.error('Error fetching lead info:', error);
      }
    };

    if (open) {
      fetchLeadInfo();
    }
  }, [data?.participantDetails?.lead?.id, open]);

  if (!data) return null;
  console.log(data);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const meetingDate = formatDate(data.meetingTime);

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                className="fixed inset-0 bg-black/50" 
                variants={overlayVariants} 
                initial="hidden" 
                animate="visible" 
                exit="exit"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div 
                className="fixed top-0 right-0 h-full w-[100vw] md:w-1/2 bg-white p-6 shadow-lg"
                variants={modalVariants} 
                initial="hidden" 
                animate="visible" 
                exit="exit"
              >
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-semibold">Meeting Details</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-gray-500 hover:text-gray-700" aria-label="Close" onClick={onClose}>
                      <X />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="space-y-4">
                  <div className="p-6 h-full space-y-10 bg-white border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-semibold">{data.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        data.status === "scheduled" ? "bg-green-50 text-green-600" :
                        data.status === "completed" ? "bg-blue-50 text-blue-600" :
                        data.status === "cancelled" ? "bg-red-100 text-red-600" :
                        "bg-yellow-100 text-yellow-600"
                      }`}>
                        {data.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col space-y-2">
                        <p className="text-gray-500 text-sm flex gap-2">
                          <CalendarDays color="#667287" /> {meetingDate.month}
                        </p>
                        <p className="text-sm flex text-gray-500 gap-2">
                          <Clock color="#667287" /> {meetingDate.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                         <Image 
                          src={data.meetingApp === "Microsoft Teams" ? "/teams.svg" : `/${data.meetingApp.toLowerCase()}.svg`}
                          alt={data.meetingApp}
                          className="w-5 h-5"
                          width={20}
                          height={20}
                        />
                        <p className="text-sm">{data.meetingApp}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h1 className="font-semibold text-lg">Agenda</h1>
                    <p className="text-[#667287] text-md">{data.title || 'No agenda set'}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold text-lg">Participant</h1>
                      <div className="flex items-center justify-end">
                        <Plus className="cursor-not-allowed opacity-50 text-primary"/> 
                        <p className="text-primary cursor-not-allowed opacity-50">Add</p>
                      </div>
                    </div>

                    <div className="p-6 h-full border-b lg:text-md text-xs overflow-x-scroll lg:overflow-hidden">
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex justify-start items-center gap-2">
                          <Image 
                            src={leadInfo?.lead_details?.picture?.small || "/logo.png"} 
                            alt={leadInfo?.name || "Lead"} 
                            width={50} 
                            height={50} 
                            className="rounded-full" 
                            unoptimized={true}
                          />
                          <div className="flex justify-start items-center mr-12 md:mr-0">
                            <div>
                              <div className="flex justify-start items-center gap-2">
                                <h1>{leadInfo?.name || "Loading..."}</h1>
                                <p className="w-2 rounded-full h-2 bg-[#667287]"></p>
                                <p className="text-[#667287]">Lead</p>
                              </div>
                              <p>{leadInfo?.email || "Loading..."}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2">
                          <Button disabled variant="outline" className="h-8 lg:w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-not-allowed">Remove</Button>
                          <Button disabled className="font-semibold h-8 bg-primary text-white lg:w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-not-allowed">Reminder</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold text-lg cursor-not-allowed opacity-50">Live Transcription</h1>
                      <button className="text-primary cursor-not-allowed opacity-50">
                        <Image className="cursor-not-allowed opacity-50" src='/export.svg' width={10} height={10} alt="export" /> Export
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

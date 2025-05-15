'use client'

import * as Dialog from "@radix-ui/react-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Clock, CalendarDays, X, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Lead {
  id: number;
  name: string;
  email: string;
}

export function ScheduleForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: userData } = useLocalStorage<{ id: number }>('user_onboarding');
  const [success, setSuccess] = useState(false);
  const form = useForm({
    defaultValues: {
      title: "",
      date: new Date(),
      time: new Date(),
      leadId: "",
      platform: "",
      agenda: "",
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];
      
      const response = await fetch(`/api/leads?userId=${userData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch leads');
      
      const data = await response.json();
      console.log(data, "leads data");
      return data as Lead[];
    },
    enabled: !!userData?.id
  });

  const scheduleMutation = useMutation({
    mutationFn: async (values: {
      title: string;
      date: Date;
      time: Date;
      leadId: string;
      platform: string;
      agenda: string;
    }) => {
      if (!userData?.id) {
        throw new Error("User not found");
      }

      const meetingTime = new Date(values.date);
      meetingTime.setHours(values.time.getHours());
      meetingTime.setMinutes(values.time.getMinutes());

      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          leadId: parseInt(values.leadId),
          title: values.title,
          meetingTime: meetingTime.toISOString(),
          platform: values.platform,
          agenda: values.agenda,
        }),
      });

      if (!response.ok) throw new Error('Failed to create meeting');
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    },
    onError: (error) => {
      console.error('Error scheduling meeting:', error);
      toast.error("Failed to schedule meeting");
    }
  });

  async function onSubmit(values: {
    title: string;
    date: Date;
    time: Date;
    leadId: string;
    platform: string;
    agenda: string;
  }) {
    scheduleMutation.mutate(values);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <div className="fixed text-xs  md:text-md  overflow-y-scroll  inset-0 flex justify-center items-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative h-[70vh] overflow-y-scroll overflow-x-hidden md:h-auto"
          >
            {success ? (
              <div className="flex flex-col items-center justify-center h-48">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-100 rounded-full p-4 mb-4"
                >
                  <Check className="w-8 h-8 text-green-600" />
                </motion.div>
                <h2 className="text-xl font-semibold text-green-600">Meeting Scheduled!</h2>
                <p className="text-gray-500 mt-2">Your meeting has been successfully scheduled.</p>
              </div>
            ) : (
              <>
                <Dialog.Title className="text-lg font-semibold">Add Schedule</Dialog.Title>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Title</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Enter title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-center items-center gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <DatePicker
                                  selected={field.value}
                                  onChange={(date) => field.onChange(date)}
                                  className="w-full px-6 py-3 border rounded-full"
                                  dateFormat="MMMM d, yyyy"
                                />
                              </FormControl>
                              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 " color="#667287" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <DatePicker
                                  selected={field.value}
                                  onChange={(time) => field.onChange(time)}
                                  className="w-full px-6 py-3 border rounded-full"
                                  showTimeSelect
                                  showTimeSelectOnly
                                  timeIntervals={15}
                                  timeFormat="hh:mm aa"
                                  dateFormat="hh:mm aa"
                                />
                              </FormControl>
                              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 " color="#667287" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Lead</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a lead" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {leads && leads.length > 0 ? leads.map((lead: Lead) => (
                                <SelectItem key={lead.id} value={lead.id.toString()}>
                                  {lead.name} ({lead.email})
                                </SelectItem>
                              )) : (
                                <SelectItem value="" disabled>No leads available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Platform</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Choose platform" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agenda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Agenda <span className="text-[#667287]">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Enter agenda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      disabled={scheduleMutation.isPending} 
                      type="submit" 
                      className={`w-full h-12 mt-4 text-lg font-semibold ${scheduleMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {scheduleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add
                    </Button>
                  </form>
                </Form>

                <Dialog.Close asChild>
                  <button className="absolute top-2 right-2 text-gray-500" aria-label="Close" onClick={onClose}>
                    <X />
                  </button>
                </Dialog.Close>
              </>
            )}
          </motion.div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

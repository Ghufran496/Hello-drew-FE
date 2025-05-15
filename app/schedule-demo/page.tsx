'use client';

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addDays, format, setHours, setMinutes, isBefore, isAfter, getDay, isSameDay } from "date-fns";
import Image from 'next/image';
import { Loader2 } from "lucide-react";
import { useMutation } from '@tanstack/react-query';

export default function ScheduleDemo() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Array<{ date: Date; timeSlot: string }>>([]);

  // Function to check if a date is a weekend
  const isWeekend = (date: Date) => {
    const day = getDay(date);
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Fetch booked slots when date changes
  useEffect(() => {
    if (date) {
      fetch(`/api/schedule-demo/booked-slots?date=${date.toISOString()}`)
        .then(res => res.json())
        .then(data => {
          setBookedSlots(data.bookedSlots.map((slot: { scheduledDate: string; timeSlot: string }) => ({
            date: new Date(slot.scheduledDate),
            timeSlot: slot.timeSlot
          })));
        })
        .catch(error => {
          console.error('Error fetching booked slots:', error);
          toast.error('Error loading available times');
        });
    }
  }, [date]);

  // Generate available time slots (9 AM to 2 PM, 30-minute intervals)
  const getTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 14; // 2 PM in 24-hour format

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of [0, 30]) {
        const time = setMinutes(setHours(new Date(), hour), minute);
        const timeString = format(time, "h:mm a");
        
        // Check if this slot is booked
        const isBooked = bookedSlots.some(bookedSlot => 
          isSameDay(bookedSlot.date, date!) && 
          bookedSlot.timeSlot === timeString
        );

        if (!isBooked) {
          slots.push(timeString);
        }
      }
    }
    return slots;
  };

  const scheduleMutation = useMutation({
    mutationFn: async (formData: {
      date: Date;
      timeSlot: string;
      name: string;
      email: string;
      phone: string;
      companyName: string;
    }) => {
      const response = await fetch('/api/schedule-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule demo');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Demo scheduled successfully!");
      setIsScheduled(true);
    },
    onError: () => {
      toast.error("Failed to schedule demo");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !name || !email || !companyName) {
      toast.error("Please fill in all required fields");
      return;
    }

    scheduleMutation.mutate({
      date,
      timeSlot,
      name,
      email,
      phone,
      companyName,
    });
  };

  if (isScheduled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="p-8 max-w-2xl w-full mx-4 text-center shadow-lg">
          <div className="mb-6">
            <Image
              src="/logo-light.svg"
              alt="Drew Logo"
              width={180}
              height={60}
              className="h-12 w-auto mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Demo Successfully Scheduled!</h1>
          <div className="space-y-4 text-gray-600">
            <p className="text-lg">Thank you for scheduling a demo with Drew, {name}!</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">Your demo is scheduled for:</p>
              <p className="text-xl text-blue-700">{format(date!, 'MMMM d, yyyy')} at {timeSlot} PST</p>
            </div>
            <p>We&apos;ve sent a confirmation email to {email} with all the details.</p>
            <p className="text-sm mt-6">
              Need to make changes? Contact us at{' '}
              <a href="mailto:support@hellodrew.ai" className="text-blue-600 hover:text-blue-700">
                support@hellodrew.ai
              </a>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo-light.svg"
                alt="Drew Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Schedule a Demo with Drew
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience how Drew, your AI-powered real estate teammate, can revolutionize your business
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <Card className="p-6 lg:col-span-3 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Select Date & Time</h2>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      isBefore(date, today) || // Disable past dates
                      isAfter(date, addDays(today, 30)) || // Disable dates more than 30 days ahead
                      isWeekend(date) // Disable weekends
                    );
                  }}
                  className="rounded-lg border-2 p-6 mx-auto w-full max-w-[420px]"
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    day_today: "bg-gray-100 text-gray-900",
                    day_disabled: "text-gray-300",
                    head_cell: "text-gray-600 font-semibold text-center w-14",
                    cell: "h-14 w-14 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    button: "h-14 w-14 p-0 font-normal hover:bg-blue-50 aria-selected:opacity-100",
                    nav_button: "h-8 w-8 p-0 hover:bg-transparent",
                    table: "w-full border-collapse",
                    head_row: "flex",
                    row: "flex w-full mt-2",
                  }}
                />
              </div>
              
              {date && (
                <div className="space-y-4 mt-8">
                  <Label className="text-gray-700 text-lg">
                    Available Times (Monday - Friday, 9 AM - 2 PM PST)
                  </Label>
                  <Select 
                    onValueChange={setTimeSlot} 
                    value={timeSlot}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder={
                        getTimeSlots().length === 0 
                          ? "No available times" 
                          : "Select a time"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getTimeSlots().length === 0 ? (
                        <SelectItem value="none" disabled>
                          No available times for this date
                        </SelectItem>
                      ) : (
                        getTimeSlots().map((slot) => (
                          <SelectItem key={slot} value={slot} className="py-3">
                            {slot}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>

            <Card className="p-6 lg:col-span-2 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Your Information</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="companyName" className="text-gray-700">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(123) 456-7890"
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mt-6"
                  disabled={!date || !timeSlot || !name || !email || !companyName || scheduleMutation.isPending}
                >
                  {scheduleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Demo'
                  )}
                </Button>
              </form>
            </Card>
          </div>

          <div className="mt-12 text-center text-sm text-gray-600">
            <p>Need help? Contact us at <a href="mailto:support@hellodrew.ai" className="text-blue-600 hover:text-blue-700">support@hellodrew.ai</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
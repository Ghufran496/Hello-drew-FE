"use client";

import React, { useState } from "react";

import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { SideImage } from "@/components/onboarding/side-image";

interface Integration {
  platformName: string;
}

interface CalendlyEventGuest {
  name?: string;
  email?: string;
}

interface CalendlyLocation {
  join_url?: string;
}

interface CalendlyCalendarEvent {
  external_id?: string;
  html_link?: string;
}

interface CalendlyAppointment {
  start_time: string;
  end_time: string;
  status: string;
  event_guests: CalendlyEventGuest[];
  location?: CalendlyLocation;
  meeting_notes_plain?: string;
  calendar_event?: CalendlyCalendarEvent;
}

interface UserOnboarding {
  id: number;
  name: string;
  package_id: number;
  password: string;
  brokerage_name: string;
  drew_tone: string;
  drew_name: string;
  drew_voice_accent: string;
  monthly_leads: number;
  personal_website: string;
  team_website: string;
  unavailable_hours: string[];
}

export default function GoLivePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async () => {
    const user = JSON.parse(localStorage.getItem('user_onboarding') || '{}') as UserOnboarding;

    if (user && user.id) {
      setIsLoading(true);
      try {
        const integrationResponse = await fetch(`/api/integrations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (integrationResponse.ok) {
          const { userIntegrations } = await integrationResponse.json();
          const calendlyIntegration = userIntegrations.find(
            (integration: Integration) => integration.platformName === 'calendly'
          );

          if (calendlyIntegration) {
            // Fetch Calendly appointments if integration exists
            const appointmentsResponse = await fetch(`/api/onboarding/calendly/fetch-appointments?userId=${user.id}`);
            if (appointmentsResponse.ok) {
              const appointmentsData = await appointmentsResponse.json();
              
              // Store appointments in appointments table
              const storeAppointmentsResponse = await fetch('/api/appointments/store', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId: user.id,
                  appointments: appointmentsData.appointments.collection.map((appointment: CalendlyAppointment) => ({
                    userId: user.id,
                    appointmentTime: appointment.start_time,
                    status: appointment.status,
                    participantDetails: {
                      lead: {
                        id: null,
                        name: appointment.event_guests[0]?.name || '',
                        email: appointment.event_guests[0]?.email || '',
                        phone: ''
                      },
                      duration: (new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / 1000,
                      event_id: appointment.calendar_event?.external_id,
                      location: appointment.location?.join_url || '',
                      description: appointment.meeting_notes_plain || '',
                      calendar_link: appointment.calendar_event?.html_link || ''
                    }
                  }))
                })
              });

              if (!storeAppointmentsResponse.ok) {
                console.error('Failed to store appointments');
              }
            }
          }
        }

        // Update user data
        const updateResponse = await fetch('/api/user/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            updateData: {
              name: user.name,
              package_id: user.package_id,
              password: user.password,
              brokerage_name: user.brokerage_name,
              drew_tone: user.drew_tone,
              drew_name: user.drew_name,
              drew_voice_accent: user.drew_voice_accent,
              monthly_leads: user.monthly_leads,
              personal_website: user.personal_website,
              team_website: user.team_website,
              unavailable_hours: user.unavailable_hours
            }
          })
        });

        const data = await updateResponse.json();
        if (data.error) {
          console.error('Failed to update user:', data.error);
        } else {
          console.log('User updated successfully:', data);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error('User not found in local storage');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="max-w-lg mx-auto w-full flex flex-col justify-center items-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center">
            <h2 className="text-4xl font-bold text-[#171b1a] text-center">
              You&apos;re Ready to Roll! 🎉
            </h2>
          </div>

          <div className="pt-3">
            <h3 className="text-base font-medium text-center">
              Welcome to Drew&apos;s world. Ready to make magic?
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4 pt-4"
        >
          <div>
            <div className="">
              <Button size="lg" disabled={isLoading} type="submit" onClick={handleSuccess} className="font-bold py-8 px-20 flex items-center text-lg gap-2">
                Get Started
                <ArrowRight className="text-white w-12 h-12" />
                {isLoading && <Loader2 className="text-white animate-spin w-12 h-12" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <SideImage />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft,  Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressBar from "@/components/onboarding/progressBar";
import { useProgress } from "@/app/context/ProgressContext";

import { Switch } from "@/components/ui/switch";
import { UnavailableHoursDialog } from "@/components/onboarding/unavailable-hours-dialog";
import LockedFeature from "@/components/onboarding/locked-feature";
import { UnavailableHours } from "@/components/onboarding/unavailable-hours";
import { IntegrationSwitch } from "@/components/onboarding/integeration-switch";

export default function AvailabilitySettingsPage() {
  const router = useRouter();
  const { progress, setProgress, step, setStep } = useProgress();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timings, setTimings] = useState<{ start: string; end: string }[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCalendlyLoading, setIsCalendlyLoading] = useState(false);
  const [isGoogleCalendarSynced, setIsGoogleCalendarSynced] = useState(false);
  const [isCalendlySynced, setIsCalendlySynced] = useState(false);

  useEffect(() => {
    setProgress(16 * 3);
    setStep(3);
  }, [setProgress, setStep]);

  const handleDeleteTiming = (index: number) => {
    setTimings((prevTimings) => prevTimings.filter((_, i) => i !== index));
  };

  const handleSuccess = async () => {
    setIsGoogleLoading(true);
    setIsCalendlyLoading(true);
    const session = localStorage.getItem("unavailable_hours_session");
    const newUnavailableHours = timings.map((timing) => ({
      start: timing.start,
      end: timing.end,
    }));

    if (session) {
      const parsedSession = JSON.parse(session);
      parsedSession.unavailable_hours = newUnavailableHours;
      localStorage.setItem(
        "unavailable_hours_session",
        JSON.stringify(parsedSession)
      );
    } else {
      const newSession = {
        unavailable_hours: newUnavailableHours,
      };
      localStorage.setItem(
        "unavailable_hours_session",
        JSON.stringify(newSession)
      );
    }

    setIsGoogleLoading(false);
    setIsCalendlyLoading(false);

    const integrationSession = localStorage.getItem("integration_session");
    if (integrationSession) {
      const parsedIntegrationSession = JSON.parse(integrationSession);
      // if (
      //   parsedIntegrationSession.integrations.google_calendar === "inactive"
      // ) {
      //   try {
      //     console.log("Removing Google Calendar integration");
      //     const response = await fetch("/api/integrations/remove", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({ platformName: "google_calendar", userId }),
      //     });

      //     if (!response.ok) {
      //       console.error("Failed to remove Google Calendar integration");
      //     }
      //   } catch (error) {
      //     console.error("Error removing Google Calendar integration:", error);
      //   }
      // }

      if (parsedIntegrationSession.integrations.calendly === "inactive") {
        try {
          console.log("Removing Calendly integration");
          const response = await fetch("/api/integrations/remove", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ platformName: "calendly", userId }),
          });

          if (!response.ok) {
            console.error("Failed to remove Calendly integration");
          }
        } catch (error) {
          console.error("Error removing Calendly integration:", error);
        }
      }
    }
    else {
      const integrationSession = {
        userId: userId,
        integrations: {
          google_calendar: "inactive",
          calendly: "inactive",
        },
      };
      localStorage.setItem("integration_session", JSON.stringify(integrationSession));
    }
    // Redirect to the next page
    router.push("/welcome/drew-personality");
  };

  const handleSwitchChange = async (checked: boolean, platform: string) => {
    if (platform === "Google Calendar") {
      if (checked) {
        setIsGoogleLoading(true);
        try {
          const response = await fetch(
            `/api/onboarding/google_calendar/login?userId=${userId}`
          );
          if (response.ok) {
            const { url } = await response.json();
            if (url) {
              window.location.href = url;
            }
          } else {
            console.error("Failed to generate auth URL");
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setIsGoogleLoading(false);
        }
      } else {
        const session = localStorage.getItem("integration_session");
        if (session) {
          const parsedSession = JSON.parse(session);
          parsedSession.integrations.google_calendar = "inactive";
          localStorage.setItem("integration_session", JSON.stringify(parsedSession));
          setIsGoogleCalendarSynced(false);
        }
      }
    } else if (platform === "Calendly") {
      if (checked) {
        setIsCalendlyLoading(true);
        try {
          const response = await fetch(
            `/api/onboarding/calendly/login?userId=${userId}`,
            {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
              },
            }
          );
          if (response.ok) {
            const { url } = await response.json();
            if (url) {
              window.location.href = url;
            }
          } else {
            console.error("Failed to generate Calendly auth URL");
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setIsCalendlyLoading(false);
        }
      } else {
        const session = localStorage.getItem("integration_session");
        if (session) {
          const parsedSession = JSON.parse(session);
          parsedSession.integrations.calendly = "inactive";
          localStorage.setItem("integration_session", JSON.stringify(parsedSession));
          setIsCalendlySynced(false);
        }
      }
    }
  };

  const checkIntegrations = async (userId: string) => {
    try {
      setIsGoogleLoading(true);
      setIsCalendlyLoading(true);
      const response = await fetch('/api/integrations', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.userIntegrations.length > 0) {
          const session = {
            userId: userId,
            integrations: {
              google_calendar: "inactive",
              calendly: "inactive",
            },
          };

          data.userIntegrations.forEach((integration: { platformName: string }) => {
            if (integration.platformName === "google_calendar") {
              setIsGoogleCalendarSynced(true);
              session.integrations.google_calendar = "active";
            }
            if (integration.platformName === "calendly") {
              setIsCalendlySynced(true);
              session.integrations.calendly = "active";
            }
          });

          localStorage.setItem("integration_session", JSON.stringify(session));
        }
      } else {
        console.error("Failed to check integrations");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsGoogleLoading(false);
      setIsCalendlyLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_onboarding");
      if (!userData) {
        router.push("/welcome");
        return;
      }
      const parsedUser = JSON.parse(userData);
      setUserId(parsedUser.id ?? null);
    }
    const unavailableHoursSession = localStorage.getItem(
      "unavailable_hours_session"
    );
    if (unavailableHoursSession) {
      const parsedSession = JSON.parse(unavailableHoursSession);
      if (parsedSession.unavailable_hours) {
        setTimings(parsedSession.unavailable_hours);
      }
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      checkIntegrations(userId);
    }
  }, [userId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="max-w-lg mx-auto w-full py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-2"
        >
          <div className="py-4 flex items-center space-x-2">
            <Button
              asChild
              className="[&_svg]:size-6"
              variant="ghost"
              size="icon"
            >
              <Link href="/welcome/setup-phone">
                <ArrowLeft />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-[#171b1a]">
              Let&apos;s Get You Ready
            </h2>
            <p className="text-lg">{step}/6</p>
          </div>

          <ProgressBar progress={progress} />

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-medium">
              Define Availability Settings
            </h3>
            <p className="text-sm text-muted-foreground">
              Sync your calendar and never miss a chance to wow a client.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6 "
        >
          <div className="flex flex-col gap-2 border border-gray-200 rounded-xl p-4 bg-white">
          <IntegrationSwitch
              platform={{ name: "Calendly", icon: "calendly.svg" }}
              isLoading={isCalendlyLoading}
              isSynced={isCalendlySynced}
              onSwitchChange={handleSwitchChange}
            />
            <IntegrationSwitch
              platform={{ name: "Google Calendar", icon: "calendar.png" }}
              isLoading={isGoogleLoading}
              isSynced={isGoogleCalendarSynced}
              onSwitchChange={handleSwitchChange}
            />
           
            <div className="flex items-center py-3 justify-between ">
              <div className="flex flex-row items-center gap-3">
                <div className="icon">
                  <Image
                    src="/outlook.png"
                    alt="calendar"
                    width={35}
                    height={20}
                    className="opacity-50"
                  />
                </div>
                <div>
                  <h3 className="text-md opacity-50 font-medium">Outlook</h3>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <LockedFeature />
                  <Switch disabled={true} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">
                Blocking unavailable hours
              </h3>
              <div
                className="cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
              >
                <h3 className="text-md text-primary">+ Add</h3>
              </div>
            </div>
            {timings.length > 0 && (
              <UnavailableHours timings={timings} onDelete={handleDeleteTiming} />
            )}
          </div>

          <div>
            <div className="">
              <Button
                size="lg"
                type="button"
                className="font-bold py-2 px-20"
                onClick={handleSuccess}
                disabled={isGoogleLoading || isCalendlyLoading}
              >
                Next
                {isGoogleLoading ||
                  (isCalendlyLoading && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="animate-spin" />
                    </div>
                  ))}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:block relative">
        <div className="h-[calc(100vh-2rem)] w-full sticky top-4">
          <Image
            src="/welcome.svg"
            alt="HelloDrew Logo"
            width={200}
            height={40}
            className="h-full w-full px-6"
          />
        </div>
      </div>

      <UnavailableHoursDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={(start, end) => {
          console.log("Unavailable hours added:", { start, end });
          setTimings((prevTimings) => [...prevTimings, { start, end }]);
        }}
      />
    </div>
  );
}

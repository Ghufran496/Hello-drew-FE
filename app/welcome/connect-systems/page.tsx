"use client";

import React, { useEffect } from "react";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressBar from "@/components/onboarding/progressBar";
import { useProgress } from "@/app/context/ProgressContext";
import CrmAccordion from "@/components/onboarding/crm-accordion";
import LeadPlatformAccordion from "@/components/onboarding/lead-platform-accordion";
import InsightsAccordion from "@/components/onboarding/insights-accordion";
import { SideImage } from "@/components/onboarding/side-image";

export default function ConnectSystemsPage() {
  const router = useRouter();
  const { progress, setProgress, step, setStep } = useProgress();

  useEffect(() => {
    setProgress(100);
    setStep(6);
  }, [setProgress, setStep]);

  const handleSuccess = () => {
    // Redirect to the next page
    router.push("/welcome/go-live");
  };

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
              <Link href="/welcome/drew-personality">
                <ArrowLeft />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-[#171b1a]">
              Let’s Get You Ready
            </h2>
            <p className="text-lg">{step}/6</p>
          </div>

          <ProgressBar progress={progress} />

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-medium">Connect Your Systems</h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6 "
        >
          <div className="flex flex-col gap-2 border border-gray-200 rounded-xl  p-4 bg-white">
            <CrmAccordion />
          </div>
          <div className="flex flex-col gap-2 border border-gray-200 rounded-xl  p-4 bg-white">
            <LeadPlatformAccordion />
          </div>

          <div className="flex flex-col gap-2 border border-gray-200 rounded-xl  p-4 bg-white">
            <InsightsAccordion />
          </div>

          <div>
            <div className="">
              <Button
                size="lg"
                type="submit"
                onClick={handleSuccess}
                className="font-bold py-2 px-20"
              >
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

     <SideImage />
    </div>
  );
}

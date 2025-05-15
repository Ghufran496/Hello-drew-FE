"use client";

import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressBar from "@/components/onboarding/progressBar";
import { useProgress } from "@/app/context/ProgressContext";
import { CRMSelection } from "@/components/onboarding/crm-selection";
import { SideImage } from "@/components/onboarding/side-image";

const Header = ({ step }: { step: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.5 }}
    className="space-y-2"
  >
    <div className="py-4 flex items-center space-x-2">
      <Button asChild className="[&_svg]:size-6" variant="ghost" size="icon">
        <Link href="/welcome/drew-personality">
          <ArrowLeft />
        </Link>
      </Button>
    </div>
    <div className="flex items-center justify-between">
      <h2 className="text-4xl font-bold text-[#171b1a]">Let’s Get You Ready</h2>
      <p className="text-lg">{step}/6</p>
    </div>
  </motion.div>
);



const NextButton = ({ handleSuccess }: { handleSuccess: () => void }) => (
  <div>
    <Button size="lg" type="submit" onClick={handleSuccess} className="font-bold py-2 px-20">
      Next
    </Button>
  </div>
);



export default function IntegerateCrmPage() {
  const router = useRouter();
  const { progress, setProgress, step, setStep } = useProgress();
  const [gotoCrm, setGotoCrm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_onboarding");
      if (!userData) {
        router.push("/welcome");
        return;
      }
      const parsedUserData = JSON.parse(userData);
      setGotoCrm(parsedUserData.goto_crm);
    }
  }, [router]);

  useEffect(() => {
    setProgress(16 * 5);
    setStep(5);
  }, [setProgress, setStep]);

  const handleSuccess = () => {
    const userData = localStorage.getItem("user_onboarding");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      parsedUserData.goto_crm = gotoCrm;
      localStorage.setItem("user_onboarding", JSON.stringify(parsedUserData));
    }
    router.push("/welcome/connect-systems");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="max-w-lg mx-auto w-full py-8 space-y-8">
        <Header step={step} />
        <ProgressBar progress={progress} />
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-medium">Integrate Lead Systems</h3>
          <p className="text-sm text-muted-foreground">
            What’s your go-to CRM? Let’s make Drew your new best friend.
          </p>
        </div>
        <CRMSelection gotoCrm={gotoCrm} setGotoCrm={ setGotoCrm} />
        <NextButton handleSuccess={handleSuccess} />
      </div>
      <SideImage />
    </div>
  );
}

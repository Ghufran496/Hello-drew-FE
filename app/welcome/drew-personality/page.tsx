"use client";

import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressBar from "@/components/onboarding/progressBar";
import { useProgress } from "@/app/context/ProgressContext";
import { FormField, FormMessage, FormItem, FormControl, FormLabel, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OnboardingStep5Values } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingStep5Schema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { ToneSelector } from "@/components/onboarding/tone-selector";
import { VoiceOptions } from "@/components/onboarding/voice-options";
import { VoiceAccents } from "@/components/onboarding/voice-accents";
import { SideImage } from "@/components/onboarding/side-image";
import { PERSONAL_AGENT, OUTBOUND_AGENT } from "@/lib/constants";
import { DrewVoiceAccent } from "@/lib/types";

export default function DrewPersonalityPage() {
  const router = useRouter();
  const { progress, setProgress, step, setStep } = useProgress();
  const [drewTone, setDrewTone] = useState<string>("");
  const [selectedAccent, setSelectedAccent] = useState<string>("");
  const [drewVoiceOption, setDrewVoiceOption] = useState<string>("");
  const [drewVoiceAccent, setDrewVoiceAccent] = useState<DrewVoiceAccent>({
    personal_drew_id: "",
    outbound_drew_id: ""
  });

  const form = useForm<OnboardingStep5Values>({
    resolver: zodResolver(onboardingStep5Schema),
    defaultValues: {
      name: ""
    },
  });

  useEffect(() => {
    setProgress(16 * 4);
    setStep(4);
  }, [setProgress, setStep]);

  const handleToneChange = (tone: string) => {
    setDrewTone(tone);
    updateVoiceAccents(drewVoiceOption, selectedAccent);
  };

  const handleVoiceOptionChange = (option: string) => {
    console.log('Voice option changed:', option);
    setDrewVoiceOption(option);
    if (selectedAccent) {
      updateVoiceAccents(option, selectedAccent);
    }
  };

  const handleAccentChange = (accent: string) => {
    console.log('Accent changed:', accent);
    setSelectedAccent(accent);
    if (drewVoiceOption) {
      updateVoiceAccents(drewVoiceOption, accent);
    }
  };

  const updateVoiceAccents = (voiceOption: string, accent: string) => {
    if (!voiceOption || !accent) return;

    console.log('Updating voice accents with:', { voiceOption, accent });
    const accentLower = accent.toLowerCase();
    
    // Find agents that match the exact voice option and accent
    const personalAgent = PERSONAL_AGENT.find(agent => 
      agent.name === voiceOption && 
      agent.accent === accentLower
    );

    const outboundAgent = OUTBOUND_AGENT.find(agent => 
      agent.name === voiceOption && 
      agent.accent === accentLower
    );

    if (personalAgent && outboundAgent) {
      const voiceAccent = {
        personal_drew_id: personalAgent.agent_id,
        outbound_drew_id: outboundAgent.agent_id
      };
      
      setDrewVoiceAccent(voiceAccent);

      // Update localStorage
      try {
        const userData = localStorage.getItem('user_onboarding');
        if (userData) {
          const parsedData = JSON.parse(userData);
          const updatedData = {
            ...parsedData,
            drew_voice_accent: voiceAccent,
            drew_accent: accent,
            drew_voice_option: voiceOption
          };
          localStorage.setItem('user_onboarding', JSON.stringify(updatedData));
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
  };

  async function handleSubmit(data: OnboardingStep5Values, e?: React.BaseSyntheticEvent) {
    e?.preventDefault();
    const userData = localStorage.getItem("user_onboarding");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      parsedUserData.drew_tone = drewTone;
      parsedUserData.drew_voice_accent = drewVoiceAccent;
      parsedUserData.drew_name = form.getValues("name");
      localStorage.setItem("user_onboarding", JSON.stringify(parsedUserData));
    }
    router.push("/welcome/connect-systems");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_onboarding");
      if (!userData) {
        router.push("/welcome");
        return;
      }
      const parsedUserData = JSON.parse(userData);
      setDrewTone(parsedUserData.drew_tone || "");
      setDrewVoiceOption(parsedUserData.drew_voice_option || "");
      setSelectedAccent(parsedUserData.drew_accent || "");
      setDrewVoiceAccent(parsedUserData.drew_voice_accent || {
        personal_drew_id: "",
        outbound_drew_id: ""
      });
      form.setValue("name", parsedUserData.drew_name || "");
    }
  }, [router, form]);

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
            <Button asChild className="[&_svg]:size-6" variant="ghost" size="icon">
              <Link href="/welcome/availability-settings">
                <ArrowLeft />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-[#171b1a]">Let&apos;s Get You Ready</h2>
            <p className="text-lg">{step}/6</p>
          </div>
          <ProgressBar progress={progress} />
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-medium">Customize Drew&apos;s Personality</h3>
            <p className="text-sm text-muted-foreground">
              Who should Drew be for your clients? Friendly? Polished? It&apos;s your call.
            </p>
          </div>
        </motion.div>
        <Form {...form}>
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <ToneSelector drewTone={drewTone} setDrewTone={handleToneChange} />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rename Drew</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`e.g., "Agent AI" or "Team Bot"`}
                      className="w-full px-5"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <VoiceOptions 
              drewVoiceAccent={drewVoiceAccent} 
              setDrewVoiceAccent={handleVoiceOptionChange}
            />
            <VoiceAccents 
              drewVoiceAccent={drewVoiceAccent}
              setDrewVoiceAccent={handleAccentChange}
              selectedAccent={selectedAccent}
            />
            <div>
              <div className="">
                <Button size="lg" type="submit" className="font-bold py-2 px-20">
                  Next
                </Button>
              </div>
            </div>
          </motion.form>
        </Form>
      </div>
      <SideImage />
    </div>
  );
}

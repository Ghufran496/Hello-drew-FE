"use client";

import React from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import axios from "axios";

import { useAudioDevices } from "./use-audio-devices";

export function useRetellCall(agentId: string) {
  const client = React.useMemo(() => new RetellWebClient(), []);

  const { inputDeviceId, outputDeviceId } = useAudioDevices();

  const [status, setStatus] = React.useState<
    "idle" | "connecting" | "active" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);

  const startCall = React.useCallback(async () => {
    if (status === "connecting" || status === "active") {
      return;
    }

    setStatus("connecting");

    try {
      const userData = localStorage.getItem("user_onboarding");
      const parsedUserData = userData ? JSON.parse(userData) : null;
      const personalDrewId = parsedUserData?.drew_voice_accent?.personal_drew_id;
      
      // Get previous call insights
      const insightsResponse = await axios.post("/api/analytics/user-drew", {
        userId: parsedUserData?.id,
        type: "CALL",
      });
      const latestCall = insightsResponse.data.communicationRecords?.[0];
      const isFirstInteraction = !latestCall;
      const previousNotes = latestCall?.details?.notes || '';
      const { data } = await axios.post("/api/public-call", {
        agent_id: personalDrewId || "agent_88ed77157d6b84958ebb2ab6c9",
        retell_llm_dynamic_variables: {
          user_id: (parsedUserData?.id).toString(),
          user_name: parsedUserData?.name,
          bot_name: "Drew",
          first_interaction: isFirstInteraction.toString(),
          additional_information: previousNotes,
          drew_id: personalDrewId || "agent_88ed77157d6b84958ebb2ab6c9"
        }
      });

      await client.startCall({
        accessToken: data.access_token,
        captureDeviceId: inputDeviceId,
        playbackDeviceId: outputDeviceId,
        sampleRate: 24000,
      });

      setStatus("active");
    } catch (error) {
      setStatus("error");
      setError(error instanceof Error ? error.message : "Failed to start call");
    }
  }, [client, inputDeviceId, outputDeviceId, status, agentId]);

  const endCall = React.useCallback(() => {
    if (status === "idle") return;

    try {
      client.stopCall();
      setStatus("idle");
      setError(null);
    } catch {
      setStatus("idle");
      setError("Failed to end call");
    }
  }, [client, status]);

  return {
    status,
    agent: agentId,
    error,
    startCall,
    endCall,
  };
}
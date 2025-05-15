import { Label } from "@/components/ui/label";
import Image from "next/image";
import { DrewVoiceAccent } from "@/lib/types";
import { useState, useEffect } from "react";

interface VoiceOptionsProps {
  drewVoiceAccent: DrewVoiceAccent | null;
  setDrewVoiceAccent: (option: string) => void;
}

const tones = ["Friendly", "Polished", "Humorous"];

export function VoiceOptions({  setDrewVoiceAccent }: VoiceOptionsProps) {
  const [activeTone, setActiveTone] = useState<string>("");

  useEffect(() => {
    const userData = localStorage.getItem("user_onboarding");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.drew_voice_option) {
        setActiveTone(parsedUserData.drew_voice_option);
      }
    }
  }, []);

  const handleToneChange = (tone: string) => {
    setActiveTone(tone);
    setDrewVoiceAccent(tone);
  };

  const handleAudioPlay = (tone: string, index: number) => {
    const audio = new Audio(`/${tone.toLowerCase()}.wav`);
    const waveContainer = document.getElementById(`wave-container-${index}`);
    const allWaveContainers = document.querySelectorAll('[id^="wave-container-"]');
    const isAnyPlaying = Array.from(allWaveContainers).some(container =>
      container.classList.contains('animate-wave')
    );

    if (!isAnyPlaying && waveContainer) {
      waveContainer.classList.add('animate-wave');
      audio.play();
      audio.onended = () => {
        waveContainer.classList.remove('animate-wave');
      };
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>Voice Options</Label>
      <div className="flex justify-center gap-4">
        {tones.map((tone, index) => {
          const isActive = activeTone === tone;

          return (
            <label
              key={`voice-${index}`}
              className={`flex items-center px-4 gap-2 cursor-pointer border-[1px] rounded-full py-2 ${isActive ? 'border-primary bg-blue-100' : ''}`}
            >
              <input
                type="radio"
                name="drew-voice"
                value={tone}
                className="form-radio hidden"
                checked={isActive}
                onChange={() => handleToneChange(tone)}
              />
              <Image
                src={`/PlayCircle.svg`}
                alt={`Drew's ${tone} tone`}
                width={40}
                height={40}
                onClick={() => handleAudioPlay(tone, index)}
                className="cursor-pointer"
              />
              <span className="text-base">{tone}</span>
              <div id={`wave-container-${index}`} className="ml-1 flex gap-1">
                <div className="w-[3px] h-3 bg-primary rounded-full"></div>
                <div className="w-[3px] h-4 bg-primary rounded-full"></div>
                <div className="w-[3px] h-2 bg-primary rounded-full"></div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
import React from "react";

export function useAudioDevices() {
  const [audioDevices, setAudioDevices] = React.useState<{
    inputDeviceId: string;
    outputDeviceId: string;
  }>({
    inputDeviceId: "default",
    outputDeviceId: "default",
  });

  React.useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const inputDevice = devices.find(
          (device) => device.kind === "audioinput"
        );
        const outputDevice = devices.find(
          (device) => device.kind === "audiooutput"
        );

        setAudioDevices({
          inputDeviceId: inputDevice?.deviceId || "default",
          outputDeviceId: outputDevice?.deviceId || "default",
        });
      } catch (err) {
        console.error("Failed to enumerate devices:", err);
      }
    }

    getDevices();
  }, []);

  return {
    ...audioDevices,
  };
}
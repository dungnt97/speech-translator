"use client";

import { useState, useCallback, useRef } from "react";

export function useAudioDevices() {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isSystemAudio, setIsSystemAudio] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startSystemAudioCapture = useCallback(async () => {
    try {
      // Request screen sharing with system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: { ideal: 1 },
          height: { ideal: 1 },
          frameRate: { ideal: 1 },
        } as any,
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
          channelCount: 2,
          sampleRate: 48000,
        },
      });

      // Check if we got audio track
      const audioTrack = displayStream.getAudioTracks()[0];
      if (!audioTrack) {
        displayStream.getTracks().forEach((track) => track.stop());
        throw new Error(
          "No audio track found. Please make sure to select 'Share audio' when sharing."
        );
      }

      // Create a new stream with only the audio track
      const audioStream = new MediaStream([audioTrack]);

      // Stop video tracks to save resources
      displayStream.getVideoTracks().forEach((track) => track.stop());

      // Store the stream reference
      mediaStreamRef.current = audioStream;

      console.log("System audio capture started successfully");
      return audioStream;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          throw new Error(
            "Access denied. Please allow screen sharing and select 'Share audio' option."
          );
        }
        if (err.name === "NotReadableError") {
          throw new Error(
            "Could not start system audio capture. Please check your system settings."
          );
        }
        if (err.name === "NotSupportedError") {
          throw new Error(
            "System audio capture is not supported in this browser. Please try Chrome or Edge."
          );
        }
        console.error("System audio capture error:", err);
        throw new Error(err.message || "Failed to capture system audio");
      }
      throw new Error("Failed to capture system audio. Please try again.");
    }
  }, []);

  const stopAudioCapture = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Audio track stopped:", track.label);
      });
      mediaStreamRef.current = null;
      console.log("System audio capture stopped");
    }
  }, []);

  const handleDeviceChange = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId);
  }, []);

  const handleSystemAudioToggle = useCallback(
    (enabled: boolean) => {
      setIsSystemAudio(enabled);
      if (!enabled) {
        stopAudioCapture();
      }
    },
    [stopAudioCapture]
  );

  return {
    selectedDevice,
    isSystemAudio,
    handleDeviceChange,
    handleSystemAudioToggle,
    startSystemAudioCapture,
    stopAudioCapture,
  };
}

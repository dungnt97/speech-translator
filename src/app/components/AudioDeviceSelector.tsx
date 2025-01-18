"use client";

import { useEffect, useState } from "react";

interface AudioDeviceSelectorProps {
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  onSystemAudioToggle: (enabled: boolean) => void;
  isSystemAudio: boolean;
}

export function AudioDeviceSelector({
  selectedDevice,
  onDeviceChange,
  onSystemAudioToggle,
  isSystemAudio,
}: AudioDeviceSelectorProps) {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(
          (device) => device.kind === "audioinput"
        );
        setAudioDevices(audioInputs);

        if (audioInputs.length > 0 && !selectedDevice) {
          onDeviceChange(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Error accessing audio devices:", err);
        setError(
          "Could not access audio devices. Please check your permissions."
        );
      }
    };

    getAudioDevices();
  }, [selectedDevice, onDeviceChange]);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <input
          type="checkbox"
          id="systemAudio"
          checked={isSystemAudio}
          onChange={(e) => onSystemAudioToggle(e.target.checked)}
          className="w-4 h-4 sm:w-5 sm:h-5 rounded 
            border-gray-300 dark:border-gray-600
            text-blue-600 dark:text-blue-500 
            focus:ring-blue-500 dark:focus:ring-blue-400
            bg-white dark:bg-gray-700
            transition-colors duration-200"
        />
        <label
          htmlFor="systemAudio"
          className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
        >
          Capture System Audio (requires screen sharing)
        </label>
      </div>

      {!isSystemAudio && (
        <div className="space-y-2">
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
            Select Audio Input Source
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="w-full p-2 sm:p-3 rounded-lg 
              border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              text-sm sm:text-base
              focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200"
            disabled={isSystemAudio}
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label ||
                  `Audio Input ${device.deviceId.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div
          className="text-sm sm:text-base text-red-600 dark:text-red-400 
          bg-red-50 dark:bg-red-900/30 
          border border-red-200 dark:border-red-800
          p-2 sm:p-3 rounded-lg"
        >
          {error}
        </div>
      )}
    </div>
  );
}

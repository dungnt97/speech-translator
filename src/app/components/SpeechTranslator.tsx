"use client";

import { useCallback, useState } from "react";
import { AudioDeviceSelector } from "./AudioDeviceSelector";
import { TranslationDisplay } from "./TranslationDisplay";
import { useAudioDevices } from "../hooks/useAudioDevices";
import { useTranslation } from "../hooks/useTranslation";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { ThemeToggle } from "./ThemeToggle";

export default function SpeechTranslator() {
  const [isVisible, setIsVisible] = useState(true);
  const {
    selectedDevice,
    isSystemAudio,
    handleDeviceChange,
    handleSystemAudioToggle,
    startSystemAudioCapture,
    stopAudioCapture,
  } = useAudioDevices();

  const {
    englishText,
    vietnameseText,
    isTranslating,
    error,
    translateText,
    setError,
    clearAll,
  } = useTranslation();

  const handleTranscriptUpdate = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      translateText(text);
    },
    [translateText]
  );

  const {
    isListening,
    startMicrophoneRecognition,
    startSystemAudioRecognition,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useSpeechToText(handleTranscriptUpdate);

  const handleToggleListening = async () => {
    try {
      if (isListening) {
        stopListening();
        stopAudioCapture();
      } else {
        if (isSystemAudio) {
          const stream = await startSystemAudioCapture();
          if (!stream) {
            throw new Error("Failed to get system audio stream");
          }
          await startSystemAudioRecognition(stream);
        } else {
          await startMicrophoneRecognition();
        }
      }
      setError(null);
    } catch (err) {
      console.error("Error toggling listening:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start listening"
      );
      stopListening();
      stopAudioCapture();
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg text-red-600 dark:text-red-400 text-center">
          Your browser doesn&apos;t support speech recognition.
          <br />
          Please try Chrome or Edge.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:py-8 md:py-12 bg-background">
      {/* Theme and Visibility Controls - Always visible */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <button
          onClick={toggleVisibility}
          className="p-2 rounded-lg 
            bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700
            border border-gray-200 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors duration-200
            w-10 h-10 flex items-center justify-center"
          title={isVisible ? "Hide Interface" : "Show Interface"}
        >
          {isVisible ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>

      <div
        className={`max-w-7xl mx-auto space-y-6 sm:space-y-8 transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r 
            from-accent to-accent-hover bg-clip-text text-transparent"
          >
            English to Vietnamese Translator
          </h1>
          <p className="text-sm sm:text-base text-muted">
            Speak naturally in English and get instant Vietnamese translations
          </p>
        </div>

        {/* Audio Source Selection */}
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <AudioDeviceSelector
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
            onSystemAudioToggle={handleSystemAudioToggle}
            isSystemAudio={isSystemAudio}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleToggleListening}
            className={`
              w-full sm:w-auto px-6 py-3 rounded-full font-medium
              transition-all duration-200
              flex items-center justify-center gap-2
              ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-accent hover:bg-accent-hover text-white"
              }
            `}
          >
            {isListening ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Start Recording</span>
              </>
            )}
          </button>

          <button
            onClick={clearAll}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-medium
              bg-white hover:bg-gray-100 text-gray-700
              dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300
              border border-gray-200 dark:border-gray-700
              transition-all duration-200"
          >
            Clear All
          </button>
        </div>

        {/* Status Indicator */}
        {isListening && (
          <div className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 animate-pulse">
            Listening... {englishText && "| Speech detected"}
          </div>
        )}

        {/* Translation Display */}
        <TranslationDisplay
          englishText={englishText}
          vietnameseText={vietnameseText}
          isTranslating={isTranslating}
          error={error}
        />
      </div>
    </div>
  );
}

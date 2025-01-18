"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import type { WebSpeechRecognition } from "../types/speech";

// Helper function to get supported MIME type
function getSupportedMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/wav",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
}

export function useSpeechToText(onTranscriptUpdate: (text: string) => void) {
  const { transcript, browserSupportsSpeechRecognition, resetTranscript } =
    useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedRef = useRef("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionInstanceRef = useRef<WebSpeechRecognition | null>(null);

  // Watch for transcript changes from microphone
  useEffect(() => {
    if (!transcript || !isListening) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (transcript !== lastProcessedRef.current) {
      timerRef.current = setTimeout(() => {
        lastProcessedRef.current = transcript;
        onTranscriptUpdate(transcript);
      }, 500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [transcript, isListening, onTranscriptUpdate]);

  const startSystemAudioRecognition = useCallback(
    async (stream: MediaStream) => {
      try {
        // Check if MediaRecorder is supported
        if (!window.MediaRecorder) {
          throw new Error("MediaRecorder is not supported in this browser");
        }

        const mimeType = getSupportedMimeType();
        if (!mimeType) {
          throw new Error("No supported audio MIME type found");
        }

        console.log("Using MIME type:", mimeType);

        // Create MediaRecorder instance with supported MIME type
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          audioBitsPerSecond: 128000,
        });

        // Handle audio data
        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            try {
              // Convert blob to base64
              const blob = event.data;
              const reader = new FileReader();

              reader.onloadend = async () => {
                try {
                  const base64Audio = reader.result as string;
                  console.log("Sending audio chunk for transcription...");

                  const response = await fetch("/api/transcribe", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ audio: base64Audio }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    console.error("Transcription API error:", data);
                    throw new Error(data.error || "Transcription failed");
                  }

                  if (data.text && data.text.trim()) {
                    console.log("Received transcription:", data.text);
                    onTranscriptUpdate(data.text);
                  }
                } catch (err) {
                  console.error("Error processing audio:", err);
                }
              };

              reader.onerror = () => {
                console.error("Error reading audio data");
              };

              reader.readAsDataURL(blob);
            } catch (err) {
              console.error("Error handling audio data:", err);
            }
          }
        };

        // Handle errors
        mediaRecorder.onerror = (event: any) => {
          console.error("MediaRecorder error:", event);
          throw new Error("MediaRecorder error occurred");
        };

        // Handle stop event
        mediaRecorder.onstop = () => {
          console.log("MediaRecorder stopped");
        };

        // Start recording with shorter chunks for more frequent updates
        mediaRecorder.start(2000); // Capture in 2-second chunks
        mediaRecorderRef.current = mediaRecorder;
        setIsListening(true);
        lastProcessedRef.current = "";

        console.log("MediaRecorder started successfully");
      } catch (err) {
        console.error("Error starting system audio recognition:", err);
        throw err;
      }
    },
    [onTranscriptUpdate]
  );

  const startMicrophoneRecognition = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      throw new Error("Browser doesn't support speech recognition");
    }

    try {
      await SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
      });
      setIsListening(true);
      lastProcessedRef.current = "";
    } catch (err) {
      console.error("Error starting microphone recognition:", err);
      throw err;
    }
  }, [browserSupportsSpeechRecognition]);

  const stopListening = useCallback(() => {
    // Stop MediaRecorder if active
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping MediaRecorder:", err);
      }
      mediaRecorderRef.current = null;
    }

    // Stop Web Speech API if active
    if (recognitionInstanceRef.current) {
      recognitionInstanceRef.current.stop();
      recognitionInstanceRef.current = null;
    }

    SpeechRecognition.stopListening();
    setIsListening(false);
    resetTranscript();
    lastProcessedRef.current = "";
  }, [resetTranscript]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    startMicrophoneRecognition,
    startSystemAudioRecognition,
    stopListening,
    browserSupportsSpeechRecognition,
  };
}

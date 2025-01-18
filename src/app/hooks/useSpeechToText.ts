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
  const transcriptBufferRef = useRef<string>("");

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
        if (!window.MediaRecorder) {
          throw new Error("MediaRecorder is not supported in this browser");
        }

        const mimeType = getSupportedMimeType();
        if (!mimeType) {
          throw new Error("No supported audio MIME type found");
        }

        console.log("Using MIME type:", mimeType);

        // Create MediaRecorder with better quality settings
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          audioBitsPerSecond: 128000,
        });

        let audioChunks: Blob[] = [];
        let chunkCount = 0;
        const MAX_CHUNKS = 4; // Process every 4 chunks (12 seconds with 3s chunks)

        // Handle audio data
        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
            chunkCount++;

            // Process chunks when we have enough or on stop
            if (chunkCount >= MAX_CHUNKS) {
              const combinedBlob = new Blob(audioChunks, { type: mimeType });
              processAudioChunk(combinedBlob);
              audioChunks = []; // Clear processed chunks
              chunkCount = 0;
            }
          }
        };

        const processAudioChunk = async (blob: Blob) => {
          try {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const base64Audio = reader.result as string;
                console.log("Processing audio chunk...");

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
                  // Append new text to buffer and update
                  const newText = data.text.trim();
                  transcriptBufferRef.current +=
                    (transcriptBufferRef.current ? " " : "") + newText;
                  console.log(
                    "Updated transcript:",
                    transcriptBufferRef.current
                  );
                  onTranscriptUpdate(transcriptBufferRef.current);
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
        };

        // Handle errors
        mediaRecorder.onerror = (event: any) => {
          console.error("MediaRecorder error:", event);
          throw new Error("MediaRecorder error occurred");
        };

        // Handle stop event
        mediaRecorder.onstop = () => {
          console.log("MediaRecorder stopped");
          // Process any remaining chunks
          if (audioChunks.length > 0) {
            const finalBlob = new Blob(audioChunks, { type: mimeType });
            processAudioChunk(finalBlob);
          }
          audioChunks = [];
          chunkCount = 0;
          transcriptBufferRef.current = ""; // Clear buffer on stop
        };

        // Start recording with chunks
        mediaRecorder.start(3000); // 3-second chunks
        mediaRecorderRef.current = mediaRecorder;
        setIsListening(true);
        lastProcessedRef.current = "";
        transcriptBufferRef.current = ""; // Clear buffer on start

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

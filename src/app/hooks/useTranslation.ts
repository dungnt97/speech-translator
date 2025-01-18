"use client";

import { useState, useCallback, useRef } from "react";

export function useTranslation() {
  const [englishText, setEnglishText] = useState("");
  const [vietnameseText, setVietnameseText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translationQueueRef = useRef<string[]>([]);
  const isTranslatingRef = useRef(false);

  const processTranslationQueue = useCallback(async () => {
    if (isTranslatingRef.current || translationQueueRef.current.length === 0)
      return;

    isTranslatingRef.current = true;
    const textToTranslate = translationQueueRef.current.pop();
    translationQueueRef.current = []; // Clear queue since we're taking the latest

    if (textToTranslate) {
      setIsTranslating(true);
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToTranslate }),
        });

        if (!response.ok) throw new Error("Translation failed");

        const { translatedText } = await response.json();
        setVietnameseText(translatedText);
        setError(null);
      } catch (err) {
        console.error("Translation error:", err);
        setError("Translation failed. Please try again.");
      } finally {
        setIsTranslating(false);
        isTranslatingRef.current = false;

        // Process next item in queue if any
        if (translationQueueRef.current.length > 0) {
          processTranslationQueue();
        }
      }
    }
  }, []);

  const translateText = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      setEnglishText(text);
      translationQueueRef.current.push(text);
      processTranslationQueue();
    },
    [processTranslationQueue]
  );

  const clearAll = useCallback(() => {
    setEnglishText("");
    setVietnameseText("");
    setError(null);
    translationQueueRef.current = [];
    isTranslatingRef.current = false;
    setIsTranslating(false);
  }, []);

  return {
    englishText,
    vietnameseText,
    isTranslating,
    error,
    translateText,
    setError,
    clearAll,
  };
}

"use client";

import { useState, useCallback, useRef } from "react";

// Split text into smaller chunks while preserving sentence boundaries where possible
function splitIntoChunks(text: string, maxLength: number = 200): string[] {
  // Remove extra whitespace
  text = text.trim().replace(/\s+/g, " ");

  // Initialize result array
  const chunks: string[] = [];

  // If text is shorter than maxLength, return it as a single chunk
  if (text.length <= maxLength) {
    return [text];
  }

  // Split text into sentences first
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = "";

  for (let sentence of sentences) {
    sentence = sentence.trim();

    // If a single sentence is longer than maxLength, split it into words
    if (sentence.length > maxLength) {
      const words = sentence.split(/\s+/);
      let tempChunk = "";

      for (const word of words) {
        if ((tempChunk + " " + word).length > maxLength) {
          if (tempChunk) {
            chunks.push(tempChunk.trim());
          }
          tempChunk = word;
        } else {
          tempChunk = tempChunk ? `${tempChunk} ${word}` : word;
        }
      }

      if (tempChunk) {
        currentChunk = tempChunk;
      }
    }
    // If adding this sentence would exceed maxLength, start a new chunk
    else if (currentChunk.length + sentence.length + 1 > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
    // Otherwise, add to current chunk
    else {
      currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    }
  }

  // Add the last chunk if not empty
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  // Log chunk sizes for debugging
  chunks.forEach((chunk, i) => {
    console.log(`Chunk ${i + 1} length:`, chunk.length);
    console.log(`Chunk ${i + 1}:`, chunk);
  });

  return chunks;
}

export function useTranslation() {
  const [englishText, setEnglishText] = useState("");
  const [vietnameseText, setVietnameseText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translationQueueRef = useRef<string[]>([]);
  const isTranslatingRef = useRef(false);
  const translatedChunksRef = useRef<string[]>([]);
  const translationCacheRef = useRef<Map<string, string>>(new Map());

  const processTranslationQueue = useCallback(async () => {
    if (isTranslatingRef.current || translationQueueRef.current.length === 0)
      return;

    isTranslatingRef.current = true;
    const textToTranslate = translationQueueRef.current.pop();
    translationQueueRef.current = []; // Clear queue since we're taking the latest

    if (textToTranslate) {
      setIsTranslating(true);
      try {
        // Split text into smaller chunks
        const chunks = splitIntoChunks(textToTranslate);
        translatedChunksRef.current = [];
        let hasNewTranslations = false;

        // Translate each chunk
        for (const chunk of chunks) {
          // Check cache first
          const cachedTranslation = translationCacheRef.current.get(chunk);
          if (cachedTranslation) {
            console.log("Using cached translation for:", chunk);
            translatedChunksRef.current.push(cachedTranslation);
            continue;
          }

          hasNewTranslations = true;
          console.log("Translating new chunk:", chunk);
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: chunk }),
          });

          if (!response.ok) throw new Error("Translation failed");

          const { translatedText } = await response.json();

          // Cache the translation
          translationCacheRef.current.set(chunk, translatedText);
          translatedChunksRef.current.push(translatedText);

          // Only update UI if we have new translations
          if (hasNewTranslations) {
            setVietnameseText(translatedChunksRef.current.join(" "));
          }
        }

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
    translatedChunksRef.current = [];
    // Don't clear the cache when clearing the UI
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

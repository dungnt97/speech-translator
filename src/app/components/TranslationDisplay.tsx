"use client";

import { useEffect, useRef } from "react";

interface TranslationDisplayProps {
  englishText: string;
  vietnameseText: string;
  isTranslating: boolean;
  error: string | null;
}

export function TranslationDisplay({
  englishText,
  vietnameseText,
  isTranslating,
  error,
}: TranslationDisplayProps) {
  const englishTextareaRef = useRef<HTMLTextAreaElement>(null);
  const vietnameseTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (englishTextareaRef.current) {
      englishTextareaRef.current.scrollTop =
        englishTextareaRef.current.scrollHeight;
    }
  }, [englishText]);

  useEffect(() => {
    if (vietnameseTextareaRef.current) {
      vietnameseTextareaRef.current.scrollTop =
        vietnameseTextareaRef.current.scrollHeight;
    }
  }, [vietnameseText]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div className="space-y-2">
        <label className="block font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300">
          English
        </label>
        <textarea
          ref={englishTextareaRef}
          value={englishText}
          readOnly
          className="w-full h-[300px] sm:h-[400px] p-3 sm:p-4 rounded-xl
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-blue-500
            resize-none text-sm sm:text-base leading-relaxed
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
            dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
            transition-colors duration-200
            placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder="Start speaking in English..."
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Vietnamese
        </label>
        <textarea
          ref={vietnameseTextareaRef}
          value={vietnameseText}
          readOnly
          className="w-full h-[300px] sm:h-[400px] p-3 sm:p-4 rounded-xl
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-blue-500
            resize-none text-sm sm:text-base leading-relaxed
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
            dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
            transition-colors duration-200
            placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder="Vietnamese translation will appear here..."
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div
          className="col-span-1 md:col-span-2 p-3 sm:p-4 rounded-lg 
          bg-red-50 dark:bg-red-900/30 
          text-red-600 dark:text-red-400
          text-sm sm:text-base border border-red-200 dark:border-red-800"
        >
          {error}
        </div>
      )}

      {isTranslating && (
        <div className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 p-2">
          <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full" />
          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Translating...
          </span>
        </div>
      )}
    </div>
  );
}

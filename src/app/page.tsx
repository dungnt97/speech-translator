"use client";

import dynamic from "next/dynamic";

// Disable SSR for SpeechTranslator
const SpeechTranslator = dynamic(
  () => import("./components/SpeechTranslator"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading translator...</div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <SpeechTranslator />
    </main>
  );
}

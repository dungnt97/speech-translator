import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  let tempFilePath: string | null = null;

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const { audio } = await req.json();
    if (!audio) {
      throw new Error("No audio data provided");
    }

    // Extract base64 data
    const matches = audio.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid audio data format");
    }

    const [, mimeType, base64Data] = matches;
    console.log("Processing audio with MIME type:", mimeType);

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length === 0) {
      throw new Error("Empty audio data");
    }

    // Create a temporary file
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`);

    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, buffer);
    console.log("Audio file saved:", tempFilePath);

    // Create a file object from the temporary file
    const file = fs.createReadStream(tempFilePath);

    // Transcribe using Whisper API
    console.log("Starting transcription...");
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
      response_format: "json",
    });

    // Clean up temporary file
    if (tempFilePath) {
      fs.unlinkSync(tempFilePath);
      console.log("Temporary file cleaned up");
    }

    if (!transcription.text) {
      throw new Error("No transcription result");
    }

    console.log("Transcription successful:", transcription.text);
    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    // Clean up temporary file in case of error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("Temporary file cleaned up after error");
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }

    console.error("Transcription error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to transcribe audio";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

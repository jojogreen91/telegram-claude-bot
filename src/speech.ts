import { SpeechClient } from "@google-cloud/speech";

const client = new SpeechClient();

export async function transcribeVoice(audioBuffer: Buffer): Promise<string> {
  const [response] = await client.recognize({
    audio: { content: audioBuffer.toString("base64") },
    config: {
      encoding: "OGG_OPUS" as const,
      sampleRateHertz: 48000,
      languageCode: "ko-KR",
      alternativeLanguageCodes: ["en-US"],
    },
  });

  const transcript = response.results
    ?.map((r) => r.alternatives?.[0]?.transcript)
    .filter(Boolean)
    .join(" ");

  if (!transcript) {
    throw new Error("Could not transcribe voice message.");
  }

  return transcript;
}

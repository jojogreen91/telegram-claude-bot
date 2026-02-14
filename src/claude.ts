import { query } from "@anthropic-ai/claude-agent-sdk";
import { config } from "./config.js";

// In-memory session storage per chat
const sessions = new Map<string, string>();

export function getSessionId(chatId: string): string | undefined {
  return sessions.get(chatId);
}

export function clearSession(chatId: string): void {
  sessions.delete(chatId);
}

export function setSessionId(chatId: string, sessionId: string): void {
  sessions.set(chatId, sessionId);
}

export async function runClaude(
  prompt: string,
  projectDir: string,
  chatId: string,
): Promise<string> {
  const existingSessionId = sessions.get(chatId);
  const textParts: string[] = [];
  let resultText = "";
  let newSessionId: string | undefined;

  const conversation = query({
    prompt,
    options: {
      cwd: projectDir,
      allowedTools: ["Read", "Edit", "Write", "Bash", "Grep", "Glob"],
      permissionMode: "acceptEdits",
      maxTurns: config.maxTurns,
      ...(existingSessionId ? { resume: existingSessionId } : {}),
    },
  });

  for await (const message of conversation) {
    if (message.type === "system" && message.subtype === "init") {
      newSessionId = (message as any).session_id;
    } else if (message.type === "assistant" && (message as any).message?.content) {
      for (const block of (message as any).message.content) {
        if ("text" in block && block.text) {
          textParts.push(block.text);
        }
      }
    } else if (message.type === "result") {
      const result = message as any;
      if (result.subtype === "success" && result.result) {
        resultText = result.result;
      } else if (result.subtype?.startsWith("error")) {
        const errors = result.errors?.join("\n") || "Unknown error";
        resultText = `Error: ${errors}`;
      }
    }
  }

  // Save session ID for future resumption
  if (newSessionId) {
    sessions.set(chatId, newSessionId);
  }

  // Prefer the final result text; fall back to collected assistant text
  return resultText || textParts[textParts.length - 1] || "No response from Claude.";
}

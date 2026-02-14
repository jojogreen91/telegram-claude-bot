import TelegramBot from "node-telegram-bot-api";
import { config } from "./config.js";
import { runClaude, clearSession, getSessionId } from "./claude.js";

const MAX_MESSAGE_LENGTH = 4096;

// Per-chat working directory
const chatProjectDirs = new Map<string, string>();

function getProjectDir(chatId: string): string {
  return chatProjectDirs.get(chatId) || config.defaultProjectDir;
}

function isAllowed(chatId: number): boolean {
  return String(chatId) === config.allowedChatId;
}

function splitMessage(text: string): string[] {
  const parts: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= MAX_MESSAGE_LENGTH) {
      parts.push(remaining);
      break;
    }
    // Try to split at a newline near the limit
    let splitAt = remaining.lastIndexOf("\n", MAX_MESSAGE_LENGTH);
    if (splitAt <= 0) splitAt = MAX_MESSAGE_LENGTH;
    parts.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  return parts;
}

export function startBot(): TelegramBot {
  const bot = new TelegramBot(config.telegramBotToken, { polling: true });

  bot.onText(/\/new/, (msg) => {
    if (!isAllowed(msg.chat.id)) return;
    const chatId = String(msg.chat.id);
    clearSession(chatId);
    bot.sendMessage(msg.chat.id, "New session started.");
  });

  bot.onText(/\/session/, (msg) => {
    if (!isAllowed(msg.chat.id)) return;
    const chatId = String(msg.chat.id);
    const sessionId = getSessionId(chatId);
    bot.sendMessage(
      msg.chat.id,
      sessionId ? `Current session: ${sessionId}` : "No active session.",
    );
  });

  bot.onText(/\/dir(?:\s+(.+))?/, (msg, match) => {
    if (!isAllowed(msg.chat.id)) return;
    const chatId = String(msg.chat.id);
    const newDir = match?.[1]?.trim();
    if (newDir) {
      chatProjectDirs.set(chatId, newDir);
      bot.sendMessage(msg.chat.id, `Working directory set to: ${newDir}`);
    } else {
      bot.sendMessage(msg.chat.id, `Current directory: ${getProjectDir(chatId)}`);
    }
  });

  bot.on("message", async (msg) => {
    if (!isAllowed(msg.chat.id)) return;
    if (!msg.text || msg.text.startsWith("/")) return;

    const chatId = String(msg.chat.id);
    const projectDir = getProjectDir(chatId);

    const statusMsg = await bot.sendMessage(msg.chat.id, "Processing...");

    try {
      const result = await runClaude(msg.text, projectDir, chatId);
      // Delete the "Processing..." message
      await bot.deleteMessage(msg.chat.id, statusMsg.message_id);

      const parts = splitMessage(result);
      for (const part of parts) {
        await bot.sendMessage(msg.chat.id, part);
      }
    } catch (err: any) {
      await bot.deleteMessage(msg.chat.id, statusMsg.message_id);
      await bot.sendMessage(msg.chat.id, `Error: ${err.message || err}`);
    }
  });

  console.log("Telegram bot is running...");
  return bot;
}

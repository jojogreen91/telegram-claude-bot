import { config } from "./config.js";
import { startBot } from "./bot.js";

console.log(`Bot token: ${config.telegramBotToken.slice(0, 8)}...`);
console.log(`Allowed chat ID: ${config.allowedChatId}`);
console.log(`Default project dir: ${config.defaultProjectDir}`);

startBot();

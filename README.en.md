# telegram-claude-bot

**English** | [한국어](README.md)

Control Claude Code from your phone. Send a Telegram message, and Claude Code runs locally on your Mac — reads, edits, commits, and pushes code for you.

```
You (Telegram) → Bot → Claude Code (your Mac) → Your codebase
```

## Why

You're on the couch, on the bus, in bed. You think of a code change. You open Telegram, type what you want, and Claude does it on your machine. No laptop needed.

## How it works

- **Telegram long polling** — no port forwarding, no server, no deploy
- **Claude Agent SDK** — runs Claude Code programmatically with full tool access (Read, Edit, Write, Bash, Grep, Glob)
- **Voice message support** — voice messages are transcribed via Google Cloud STT and sent to Claude
- **Session persistence** — Claude remembers context within a conversation. Start fresh anytime with `/new`
- **Chat ID whitelist** — only you can use your bot

## Setup

### 1. Create a Telegram bot

1. Message **@BotFather** on Telegram
2. `/newbot` → pick a name → get your **API token**

### 2. Get your chat ID

1. Message **@userinfobot** on Telegram
2. Copy your **Id** number

### 3. Prerequisites

- Node.js 18+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated (`claude` CLI must work)
- (For voice messages) [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) setup with a service account key file

### 4. Install & configure

```bash
git clone https://github.com/jojogreen91/telegram-claude-bot.git
cd telegram-claude-bot
npm install
cp .env.example .env
```

Edit `.env`:

```
TELEGRAM_BOT_TOKEN=your_bot_token
ALLOWED_CHAT_ID=your_chat_id
PROJECT_DIR=/path/to/your/project
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

### 5. Run

```bash
npm start
```

That's it. Your Mac needs to stay on — the bot polls Telegram for messages.

## Commands

| Command | Description |
|---------|-------------|
| `/new` | Start a fresh Claude session |
| `/session` | Show current session ID |
| `/dir /some/path` | Change working directory |
| `/dir` | Show current working directory |

Anything else you type is sent directly to Claude Code as a prompt.

## Examples

```
You: Fix the typo in README.md
Claude: (reads file, edits it, responds with what changed)

You: Add a .gitignore for Node projects
Claude: (creates .gitignore with standard Node entries)

You: Run the tests and fix any failures
Claude: (runs tests via Bash, reads errors, edits code, re-runs)

You: /dir /Users/me/other-project
Bot: Working directory set to: /Users/me/other-project

You: /new
Bot: New session started.
```

## Architecture

```
src/
├── index.ts    # Entry point
├── config.ts   # Env vars
├── bot.ts      # Telegram bot logic
├── claude.ts   # Claude Agent SDK wrapper + session management
└── speech.ts   # Google Cloud STT (voice → text)
```

- **Polling, not webhooks** — no need to expose a port or set up ngrok
- **`permissionMode: "acceptEdits"`** — file edits are auto-approved for hands-free operation
- **`maxTurns: 10`** — prevents runaway loops
- **Message splitting** — responses over 4096 chars are split across multiple messages

## Security

- Bot token and chat ID are in `.env` (gitignored)
- `ALLOWED_CHAT_ID` ensures only your Telegram account can interact with the bot
- Claude Code's built-in safety checks still apply

## License

MIT

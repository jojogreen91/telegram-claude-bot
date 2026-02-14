# telegram-claude-bot

[English](README.md) | **한국어**

핸드폰 텔레그램으로 메시지를 보내면, 내 맥에서 Claude Code가 돌아간다. 코드 읽기, 수정, 커밋, 푸시까지 전부.

```
나 (텔레그램) → 봇 → Claude Code (내 맥) → 내 코드베이스
```

## 왜 만들었나

소파에서, 버스에서, 침대에서. 코드 고칠 게 생각났다. 텔레그램 열고 타이핑하면 Claude가 내 컴퓨터에서 알아서 해준다. 노트북 안 켜도 된다.

## 어떻게 동작하나

- **텔레그램 롱 폴링** — 포트포워딩 없음, 서버 없음, 배포 없음
- **Claude Agent SDK** — Claude Code를 프로그래밍 방식으로 실행 (Read, Edit, Write, Bash, Grep, Glob 전부 사용)
- **세션 유지** — 대화 맥락을 기억함. `/new`로 언제든 초기화
- **채팅 ID 화이트리스트** — 본인만 사용 가능

## 설치

### 1. 텔레그램 봇 생성

1. 텔레그램에서 **@BotFather**에게 메시지
2. `/newbot` → 이름 정하기 → **API 토큰** 받기

### 2. 내 채팅 ID 확인

1. 텔레그램에서 **@userinfobot**에게 메시지
2. **Id** 숫자 복사

### 3. 사전 준비

- Node.js 18+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 설치 및 인증 완료 (`claude` CLI가 동작해야 함)

### 4. 설치 및 설정

```bash
git clone https://github.com/jojogreen91/telegram-claude-bot.git
cd telegram-claude-bot
npm install
cp .env.example .env
```

`.env` 수정:

```
TELEGRAM_BOT_TOKEN=봇_토큰
ALLOWED_CHAT_ID=내_채팅_ID
PROJECT_DIR=/작업할/프로젝트/경로
```

### 5. 실행

```bash
npm start
```

끝. 맥이 켜져 있어야 한다 — 봇이 텔레그램을 폴링하고 있으니까.

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/new` | 새 Claude 세션 시작 |
| `/session` | 현재 세션 ID 확인 |
| `/dir /경로` | 작업 디렉토리 변경 |
| `/dir` | 현재 작업 디렉토리 확인 |

그 외 모든 메시지는 Claude Code에 프롬프트로 전달된다.

## 사용 예시

```
나: README.md에 오타 고쳐줘
Claude: (파일 읽고, 수정하고, 뭘 바꿨는지 알려줌)

나: Node용 .gitignore 만들어줘
Claude: (.gitignore 생성)

나: 테스트 돌리고 실패하는 거 고쳐줘
Claude: (Bash로 테스트 실행, 에러 읽고, 코드 수정, 재실행)

나: /dir /Users/me/other-project
봇: Working directory set to: /Users/me/other-project

나: /new
봇: New session started.
```

## 구조

```
src/
├── index.ts    # 진입점
├── config.ts   # 환경변수
├── bot.ts      # 텔레그램 봇 로직
└── claude.ts   # Claude Agent SDK 래퍼 + 세션 관리
```

- **폴링 방식** — 포트 열거나 ngrok 설정할 필요 없음
- **`permissionMode: "acceptEdits"`** — 파일 수정 자동 승인 (무인 실행)
- **`maxTurns: 10`** — 무한 루프 방지
- **메시지 분할** — 4096자 초과 응답은 자동으로 나눠서 전송

## 보안

- 봇 토큰과 채팅 ID는 `.env`에 저장 (gitignore 적용)
- `ALLOWED_CHAT_ID`로 본인 외 접근 차단
- Claude Code 자체 안전장치 적용

## 라이선스

MIT

# AI Playground UI

A modern Next.js application featuring a two-column chat interface for real-time streaming AI responses. Users can send messages with Enter (Shift+Enter for newline), view side-by-side responses from multiple AI models, and enjoy a fixed bottom input area for a smooth chat experience.

## Key Features

- **Next.js (App Router)** client-side chat interface
- **Dual chat columns** for comparing AI models (e.g., GPT5 vs GPT5mini)
- **Streaming AI responses** that display progressively as they arrive
- **Multiple API calls per message** (streaming + secondary requests)
- **Send button feedback** with disabled state and loader during requests
- **Responsive layout**: scrollable message area with fixed bottom composer
- **Reusable components**: Chat, ChatColumn, MessageList, Composer, etc.

## Prerequisites

- Node.js 18+ (or compatible)
- npm, yarn, or pnpm
- Optional: AI backend supporting HTTP streaming

## Setup Instructions

### 1. Install Dependencies

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn
```

### 2. Configure Environment

- Create a `.env.local` file at the project root
- Example configuration:
  ```env
  NEXT_PUBLIC_API_BASE=http://localhost:3001
  ```
- Ensure your API provides `/ai/stream` and `/ai/extra` endpoints.

### 3. Run Development Server

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev
```

Open http://localhost:3000 in your browser.

### 4. Build & Production

```bash
npm run build
npm start
```

## Project Structure

- `src/app/chat/page.tsx` — Main chat page, handles state, streaming, and API calls
- `src/app/chat/ChatColumn.tsx` — Displays a single chat column (per model)
- `src/components/` — Shared UI components (MessageBubble, MessageList, Composer, etc.)
- `src/shared/` — Utilities and helpers (e.g., `streamModelReply`)
- `src/app/layout.tsx` — Layout wrapper with `flex flex-col min-h-screen`

## API Requirements

- **Streaming endpoint:** `/ai/stream` (POST, streams AI response chunks)


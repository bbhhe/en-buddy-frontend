# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (Vite)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

## Architecture

This is an English learning chat application frontend built with React 19, Vite, and Tailwind CSS v4.

### Project Structure

```
src/
├── api/          # Axios HTTP client and API functions
├── components/   # Reusable UI components (Button, Card, Input)
├── features/     # Feature-based modules
│   ├── chat/     # Chat interface (ChatPage, MessageList, ChatInput)
│   └── study/    # Study features (DailyTakeaway, AnalysisResult)
├── hooks/        # Custom React hooks (useChat)
├── store/        # React Context for global state (AppContext)
└── main.jsx      # Application entry point
```

### Key Patterns

- **Feature-based organization**: Each feature (chat, study) is self-contained with its own components
- **Barrel exports**: Directories use `index.js` files for clean imports
- **Global state**: `AppProvider` wraps the app providing user context via React Context
- **API layer**: Centralized axios instance in `src/api/index.js` with base URL from `VITE_API_BASE_URL` env var (defaults to `http://localhost:8080`)
- **Custom hooks**: `useChat` encapsulates chat message state and API communication

### Styling

- Tailwind CSS v4 with the Vite plugin (`@tailwindcss/vite`)
- CSS custom properties defined in `src/index.css` for theming (colors like `--forest-*`, shadows, fonts)
- Inline styles reference CSS variables for consistency

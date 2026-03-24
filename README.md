# Claude Plan Viewer

A web app for browsing and reading [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plan files. Plans are implementation documents that Claude Code generates during the planning phase of complex tasks — this viewer makes them easy to browse, search, and read with proper markdown rendering.

![Light and dark theme support](https://img.shields.io/badge/theme-light%20%2F%20dark-blueviolet)

## Features

- **Plan browser** — lists all plans from `~/.claude/plans/` with titles, timestamps, and file sizes
- **Markdown rendering** — syntax-highlighted code blocks, GFM tables, task lists, and more
- **Search** — filter plans by title or filename in real-time
- **Light/dark theme** — toggle between themes, respects OS preference, persists choice
- **Live updates** — polls for new plans every 5 seconds so plans appear as Claude Code creates them

## How It Works

Claude Code stores plan files as markdown in `~/.claude/plans/`. This app uses a Vite plugin to serve those files via a local API (`/api/plans`), making them accessible to the browser. The app works in both development (`vp dev`) and preview (`vp preview`) modes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Vite+](https://vite.dev/plus/) (`vp` CLI) — or use `npx vite-plus` if not installed globally

### Install and Run

```bash
# Clone the repo
git clone https://github.com/your-username/claude-plan-viewer.git
cd claude-plan-viewer

# Install dependencies
vp install

# Start development server
vp dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Configuration

By default, the app reads plans from `~/.claude/plans/`. To change the directory, edit `vite.config.ts`:

```ts
plansApiPlugin({ plansDir: "/path/to/your/plans" });
```

## Tech Stack

- [React](https://react.dev/) 19
- [TanStack Router](https://tanstack.com/router) — type-safe routing
- [TanStack Query](https://tanstack.com/query) — data fetching with polling and caching
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [react-markdown](https://github.com/remarkjs/react-markdown) + [rehype-highlight](https://github.com/rehypejs/rehype-highlight) — markdown rendering with syntax highlighting
- [Vite+](https://vite.dev/plus/) — build toolchain

## Development

```bash
# Run dev server
vp dev

# Type check + lint + format
vp check

# Auto-fix formatting
vp check --fix

# Build for production
vp build

# Preview production build
vp preview
```

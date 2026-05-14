# AI Browser

A web app for discovering, comparing, and tracking AI tools across 15+ categories like Video, Code, Image, Music, Writing, and more. Built with React + Vite.

## Features

- **Browse AI Tools** — Cards organized by category with horizontal scroll rows, a hero carousel for featured tools, and curated collections (Rising Stars, Best Free, etc.)
- **Tool Detail Pages** — Full info for each tool including strengths, weaknesses, pricing, specialty, and a YouTube demo link
- **Favorites** — Heart button on every card and detail page. Favorites are saved to localStorage and shown in a dedicated "Your Favorites" row
- **AI Search** — Keyword search across all tools with smart scoring and follow-up questions to narrow results
- **AI Research** — After searching, click "Want AI to research the best tools for this?" to have Claude analyze and rank the most popular tools with reasoning
- **AI Tool Generation** — Describe a tool you want and Claude Code will generate it and add it to the database

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) (optional — needed for AI generation and AI research features)

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/Lukas0092/AI-browser.git
   cd AI-browser
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Open in your browser**

   The terminal will show a local URL (usually `http://localhost:5173`). Open it in your browser.

## Build for Production

```bash
npm run build
```

The output goes to the `dist/` folder. You can preview the production build with:

```bash
npm run preview
```

## AI Features Setup

The AI generation and AI research features require [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed globally:

```bash
npm install -g @anthropic-ai/claude-code
```

Make sure you have a valid Anthropic API key configured for Claude Code. These features only work during development (`npm run dev`), not in the production build.

## Project Structure

```
src/
  App.jsx              — Main app with state, favorites, routing
  App.css              — All styles
  components/
    AiSearch.jsx       — AI assistant panel (search, generate, recommend)
    CategorySection.jsx — Horizontal scrollable tool row
    ToolCard.jsx       — Individual tool card with heart button
    ToolDetail.jsx     — Full tool detail page
    CategoryIcon.jsx   — SVG icons for each category
    CategoryNav.jsx    — Sticky category navigation bar
    HeroSection.jsx    — Featured tools carousel
    Header.jsx         — App header
public/
  data.json            — Tool database (categories, tools, collections)
vite.config.js         — Vite config + AI generation/recommend API endpoints
scripts/               — Data management utilities
```

## Tech Stack

- React 19
- Vite 8
- Claude Code CLI (for AI features)
- No additional UI libraries — pure CSS

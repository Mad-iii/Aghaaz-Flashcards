# Aghaaz Flashcards

A lead management and client flow platform featuring an admin dashboard, flow builder, and flashcard-based client interactions, backed by Supabase.

## Features

- **Admin Dashboard** — centralized view for managing leads and activity
- **Flow Builder** — design and customize client-facing flows
- **Client Flow** — guided, flashcard-style experience for clients
- **Lead Data Management** — capture, view, and organize lead information
- **Admin Lock Screen** — secure access control for the admin area
- **Configurable Settings** — adjust app behavior from a dedicated settings panel

## Tech Stack

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Backend / Database:** Supabase

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A [Supabase](https://supabase.com/) project (URL + API key)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mad-iii/Aghaaz-Flashcards.git
cd Aghaaz-Flashcards
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

Then open `.env` and set:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Never commit your `.env` file. It's already excluded via `.gitignore`.

### 4. Run the app locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLockScreen.tsx
│   │   ├── ClientFlow.tsx
│   │   ├── FlowBuilder.tsx
│   │   ├── LeadData.tsx
│   │   ├── Settings.tsx
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── data.ts
│   ├── main.tsx
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Deployment

This project is set up to deploy easily on [Vercel](https://vercel.com/). Connect the GitHub repository to a Vercel project and set the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.

## License

This project is privately maintained. All rights reserved unless otherwise specified.
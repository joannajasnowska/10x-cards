# 10x-cards generator

## Project Description

10x-cards generator is a web-based application designed to enhance learning by automatically generating educational flashcards using artificial intelligence. The system enables users to generate flashcards from pasted text and also supports manual creation, editing, and deletion of flashcards. Key features include secure user authentication, input validation, integrated spaced repetition for flashcard review, and logging of AI-generated outputs.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, user authentication, API support)
- **AI Integration:** Utilizes Openrouter.ai for communication with LLM models
- **Testing:**
  - **Unit & Component:** Vitest, React Testing Library, MSW (Mock Service Worker), Storybook
  - **End-to-End:** Playwright for cross-browser testing, Allure for reporting
- **CI/CD & Hosting:** GitHub Actions and DigitalOcean
- **Node Version:** 22.14.0 (as specified in .nvmrc)

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 10x-cards
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the provided local URL to see the application in action.

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build.
- `npm run astro` - Executes Astro CLI commands.
- `npm run lint` - Lints the codebase.
- `npm run lint:fix` - Lints and automatically fixes issues.
- `npm run format` - Formats the codebase using Prettier.

## Project Scope

10x-cards generator is focused on streamlining the creation and management of educational flashcards to support spaced repetition learning. The project scope includes:

- **AI-Generated Flashcards:** Automatically create flashcards from user-provided text with character limits for concise questions and detailed answers.
- **Manual Flashcard Management:** Create, edit, review, and delete flashcards manually.
- **Review Sessions:** Facilitate efficient learning through spaced repetition algorithms integrated into flashcard review sessions.
- **User Authentication:** Secure registration, login, password management, and account deletion processes.
- **Comprehensive Validation:** Both client-side and server-side validations are implemented to ensure data quality.
- **Activity Logging:** Logs from AI-generated flashcards are stored for accountability and audit purposes.

## Project Status

This project is actively under development. Continuous improvements and new features are being added based on ongoing user feedback and evolving product requirements.

## License

MIT

# Repository Guidelines

## Project Structure & Module Organization

This frontend uses Next.js 14 App Router, React 18, and TypeScript. Routes and layouts live in `src/app/`: `/auth` handles login, `/app` serves store users, and `/backoffice` serves AutoPilot administrators. Reusable UI lives in `src/components/`; shared state lives in `src/contexts/`, `src/hooks/`, and `src/redux/`.

Keep REST contracts in `src/services/`, models in `src/types/`, and helpers in `src/lib/` or `src/utils/`. Static images, icons, fonts, and WASM assets live in `public/`. Tests live in `src/test/`; integration guidance lives in `docs/BACKEND_ALIGNMENT.md`.

## Build, Test, and Development Commands

Use Node 20 or newer and pnpm.

- `pnpm install --frozen-lockfile`: install locked dependencies.
- `pnpm dev`: run development mode at `http://localhost:3001`.
- `pnpm build`: create the production build.
- `pnpm start`: serve the production build on port 3001.
- `pnpm typecheck`: check TypeScript without emitting application code.
- `pnpm lint`: check Next.js and TypeScript ESLint rules.
- `pnpm format:check`: check Prettier formatting.
- `pnpm format` and `pnpm lint:fix`: apply formatting and supported lint fixes.
- `pnpm test:run`: run Vitest once; `pnpm test` runs watch mode.

Configure `.env.local` from `.env.example`. The backend normally runs at `http://localhost:3003`; set `NEXT_PUBLIC_API_URL` and optionally `NEXT_PUBLIC_SOCKET_URL` accordingly. The frontend requires no Docker services of its own.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, single quotes, semicolons, trailing commas, and the configured 100-character print width. Use `@/` imports for `src/`, PascalCase React components, and `use-*.ts` hook filenames. Follow nearby filename conventions. Keep user-facing text in Portuguese and API fields in English. Reuse existing Tailwind tokens, Radix primitives, and shared components.

## Testing Guidelines

Vitest uses jsdom and React Testing Library. Name tests `*.test.ts` or `*.test.tsx`. Test session persistence, permission filtering, request failures, branding cleanup, realtime reconciliation, and human approval of AI suggestions. No numeric coverage threshold is configured. Run relevant tests, lint, type checking, and build before review; verify changed screens on desktop and mobile.

## Commit & Pull Request Guidelines

History uses `feat:` and `docs:` prefixes. Keep commits focused. PRs should describe behavior changes, linked issues, verification, and API assumptions. Include screenshots for visual changes and note environment changes.

## Security & Integration

Treat every `NEXT_PUBLIC_*` value as public. Never expose microservice or provider secrets. Centralize authenticated requests through `src/services/api.client.ts` and session handling through `src/services/session.ts`. Preserve sessions on HTTP 403, clear them on HTTP 401, and check realtime events against the current store. Suggested AI replies require an explicit user send action.

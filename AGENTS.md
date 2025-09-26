# Repository Guidelines

## Project Structure & Module Organization
ScoreBoard separates UI and API work. `frontend/` hosts the React 18 + TypeScript app; keep features inside `src/components`, `src/pages`, `src/services`, `src/theme`, with hooks or stores under `src/hooks` and `src/stores`. `backend/` holds the Express + Sequelize API: domain code in `src/controllers`, `src/services`, `src/models`, and persistence scripts in `migrations/` and `seeders/`. Use `docs/` for reference material, `data/` for datasets, and `tests/` for integration spikes.

## Build, Test, and Development Commands
- `cd frontend && npm install` then `npm start` launches CRA on port 3000.
- `npm run build` writes production assets to `frontend/build/`.
- `npm run test` runs the React Testing Library suite; add `-- --coverage` for reports.
- `npm run typecheck` runs the strict compiler without emitting files.
- `cd backend && npm install` readies the API; use `npm run dev` (nodemon), `npm start` (Node runtime), and `npm run build` to emit `backend/dist/`.
- Database flows: `npm run migrate`, `npm run migrate:undo`, `npm run migrate:reset`, `npm run seed`.

## Coding Style & Naming Conventions
Write new code in TypeScript with strict types; prefer interfaces for objects and narrow unions for enums. Use two-space indentation, trailing commas, and PascalCase filenames for React components, hooks, and contexts (`Dashboard.tsx`, `useSidebar.ts`). Utilities and constants stay camelCase. CRA’s ESLint preset is the baseline; lint before committing, and lean on MUI `sx` props or theme tokens instead of ad hoc inline styles.

## Testing Guidelines
Front-end specs live next to their subjects using `*.test.tsx` or `*.test.ts`. Mock API traffic via Axios interceptors or MSW, and assert UI behavior through Testing Library queries. Backend tests are in progress; when adding them, mirror the service folders inside `backend/tests/` and rely on Jest + Supertest. Run `npm run typecheck` and the relevant test command before pushing.

## Commit & Pull Request Guidelines
Git history follows Conventional Commits (`feat:`, `fix:`, `style:`, `docs:`). Write imperative subjects and add an optional scope (`feat(competition):`). PRs should include a clear summary, linked issues, a checklist of manual or automated checks, and screenshots or recordings for UI changes. Request review from the feature owner and wait for CI parity before merging.

## Security & Configuration Tips
Duplicate `.env.example` into `.env` for both the frontend and backend. Do not commit secrets. Keep DOMPurify sanitizers and Express hardening middleware (Helmet, rate limiting, JWT auth) enabled when adjusting routes, and document any new required env vars in `docs/`.

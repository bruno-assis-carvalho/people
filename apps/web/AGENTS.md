# Project Guidelines

## Architecture

- This project is a React 19 and TypeScript application built with Vite.
- Application routes and layout live in `src/app/`; feature-specific screens and state live in `src/features/`.
- Shared, reusable UI components live in `packages/ui/`.
- Follow the React guidance in [`.agents/skills/reacjs/SKILL.md`](./.agents/skills/reacjs/SKILL.md) for frontend work and the UI component guidance in [`.agents/skills/ui-components/skill.md`](./.agents/skills/ui-components/skill.md) when working in `packages/ui/`.

## Code Style

- Follow the conventions and patterns already present in the surrounding code.
- Use TypeScript types to describe component props and application data.
- Keep changes focused on the feature or component being modified.

## Build and Test

- Run `npm run build` to validate production builds.
- Run `npm run format` to format the project with Oxfmt.

## Conventions

- Keep feature-specific behavior in `src/features/` and reusable presentation components in `packages/ui/`.
- For project-specific frontend workflows and skill routing, see [`.agents/instructions.md`](./.agents/instructions.md).

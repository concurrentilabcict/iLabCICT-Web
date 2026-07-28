# AGENTS.md

# Project Overview

This repository contains a production-quality application.

These instructions are intentionally reusable across projects. Before making changes, inspect the current repository and adapt to the technologies, folder layout, naming conventions, scripts, and architecture that already exist here.

Always prioritize consistency with the existing architecture over introducing new patterns.

---

# Project Discovery

Before writing code:

- Read the README and any local documentation.
- Inspect package files, config files, routing, entry points, and existing modules.
- Identify the active stack from the repository instead of assuming one.
- Find the closest existing implementation before creating something new.
- Reuse components, hooks, utilities, services, models, routes, and patterns whenever possible.
- Keep changes scoped to the requested task.

If this file is copied into another project, treat the stack-specific sections below as conditional. Follow them only when the project uses those tools or equivalent patterns.

---

# Tech Stack

Use the actual stack found in the current project.

When the project uses a frontend stack, follow its existing framework, routing, styling, state management, API, and component patterns.

When the project uses a backend stack, follow its existing server framework, database layer, authentication, validation, error handling, and deployment patterns.

Do not add or replace major technologies without approval.

---

# Architecture

Always follow the existing project architecture.

Before creating anything new:

- Search for an existing implementation.
- Reuse existing components.
- Extend existing modules whenever possible.
- Avoid duplicate logic.
- Match existing file boundaries and ownership.
- Prefer small, focused changes over broad rewrites.

If the repository has clear feature folders, keep work inside the relevant feature. If it has shared modules, only add to them when the code is genuinely reusable.

---

# Folder Structure

Keep folders organized by feature or responsibility.

Use the project's existing root folders. Common frontend examples include:

```text
src/
|-- components/
|-- pages/
|-- hooks/
|-- services/
|-- utils/
|-- types/
|-- constants/
`-- lib/
```

Do not force this exact structure onto a project that already has a different well-established structure. When creating new files, place them where similar files already live.

---

# Component Structure

Every component must have its own folder.

The main component file must always have the same name as the folder.

Example:

```text
components/
    UserCard/
        UserCard.tsx

    Sidebar/
        Sidebar.tsx
        SidebarItem.tsx
        SidebarSection.tsx
        hooks.ts
        types.ts
```

Rules:

- Always create a folder for every component.
- The main component file must have the exact same name as the folder.
- Do not place `.tsx` component files directly inside `/components`.
- Keep all files related to a component inside its own folder.
- For existing components that already follow this rule, continue the same pattern.
- For framework-specific component extensions, follow the nearest existing convention.

## Keep It Simple

Do not split components unnecessarily.

Simple UI components such as:

- Card
- Badge
- Avatar
- Button
- Empty State
- Skeleton
- Alert

should remain a single file unless they become significantly more complex.

Avoid creating files like:

- CardHeader.tsx
- CardBody.tsx
- CardFooter.tsx

unless the component has grown large enough that splitting clearly improves readability and maintainability.

Prefer one well-organized file over multiple tiny files.

---

# Naming Convention

Folders:

- PascalCase

Examples:

- UserCard
- ActivityDialog
- Sidebar

Components:

- PascalCase

Functions:

- camelCase

Variables:

- camelCase

Types:

- PascalCase

Interfaces:

- PascalCase

Enums:

- PascalCase

Constants:

- UPPER_SNAKE_CASE when global
- camelCase when local

For files or directories that belong to framework conventions, routes, generated code, or existing local patterns, follow the project's established convention first.

---

# Type Safety

Use the project's type system and strictness level.

For TypeScript projects:

- Never use `any`.
- Prefer explicit interfaces for object shapes that cross module boundaries.
- Use strict typing.
- Prefer inference when obvious.
- Avoid unnecessary type assertions.

Bad:

```ts
const data: any = response.data;
```

Good:

```ts
const data: Menu[] = response.data;
```

For non-TypeScript projects, preserve equivalent safety through validation, clear data shapes, tests, and readable contracts.

---

# Frontend Rules

Follow this section when the project has a frontend application.

- Use the existing component model.
- Prefer composition over massive components.
- Keep components focused and readable.
- Keep UI behavior accessible and responsive.
- Reuse existing design system components before creating new ones.
- Keep loading, empty, success, and error states consistent with the rest of the app.

For React projects:

- Functional components only.
- Use Hooks.
- No class components.
- One responsibility per component.
- Keep components readable.

---

# Server State and Data Fetching

Use the data-fetching approach already established in the project.

For React Query projects:

- Use `useQuery` for server reads.
- Use `useMutation` for server writes.
- Use `invalidateQueries()` after successful mutations when cache invalidation is enough.
- Avoid manual refetching if invalidation is enough.

For other stacks, follow the existing cache, loader, action, store, service, or API pattern.

---

# API Standards

Use the project's existing API client or request layer.

- Do not bypass the configured client unless the project already does so.
- Keep request and response handling consistent.
- Always handle loading, success, and error states.
- Preserve existing API contracts unless the task explicitly requires changing them.

If the project uses Axios, use the configured Axios instance. Do not use `fetch()` directly unless that is the established project pattern.

When designing API responses, prefer a consistent shape such as:

```json
{
  "success": true,
  "message": "Resource created",
  "data": {}
}
```

---

# Backend Standards

Follow this section when the project has a backend application.

- Follow the existing architecture, such as MVC, service-layer, clean architecture, feature modules, or serverless handlers.
- Keep controllers, handlers, routes, services, models, middleware, and validators aligned with existing responsibilities.
- Validate all external input.
- Never trust client input.
- Return meaningful errors.
- Do not expose sensitive information.

For MVC projects:

- Controllers handle request and response flow.
- Services handle business logic when the project uses services.
- Routes define routing only.
- Models define schema and persistence behavior.
- Middleware handles authentication, validation, and cross-cutting concerns.

---

# Database Standards

Use the database and ORM/query layer already present in the project.

- Validate data before persistence.
- Use schema validation when available.
- Create indexes where appropriate.
- Use migrations when the project has a migration system.
- Prefer soft delete when the project already uses it or when data recovery/auditing matters.
- Do not change existing data models or relationships without understanding downstream impact.

For Mongoose projects:

- Use Mongoose validation.
- Keep schema definitions in models.
- Create indexes where appropriate.

---

# Authentication and Security

Use the existing authentication and authorization approach.

- Protect required endpoints and pages.
- Never expose secrets, tokens, private keys, or sensitive user information.
- Keep credentials in environment variables.
- Preserve session, token, role, and permission behavior unless explicitly asked to change it.

For JWT projects:

- Validate JWTs using the existing middleware.
- Do not store sensitive data in tokens.
- Enforce authorization on protected routes.

---

# UI Guidelines

Use the existing design system and visual language.

When the project uses shadcn/ui, use shadcn/ui components whenever possible.

Preferred style:

- modern
- minimal
- flat
- subtle shadows
- rounded-lg
- consistent spacing

Avoid:

- excessive gradients
- glassmorphism
- inconsistent spacing
- random colors
- decorative UI that does not serve the task

---

# Styling

Use the styling system already present in the project.

For Tailwind projects:

- Prefer utility classes.
- Keep classes organized.
- Match existing responsive patterns.

Suggested class order:

- layout
- spacing
- typography
- colors
- effects

For CSS modules, Sass, styled-components, vanilla CSS, or other systems, follow the established local style.

---

# Code Style

- Prioritize readability.
- Prefer early returns.
- Avoid deep nesting.
- Keep functions focused.
- Remove unused code.
- Keep files concise.
- Do not over-engineer.
- Match the formatting and linting rules already configured.
- Do not rewrite unrelated code.

---

# Error Handling

- Return meaningful messages.
- Do not silently ignore errors.
- Log unexpected errors using the project's existing logging approach.
- Surface user-facing errors in the same style as the rest of the app.
- Avoid leaking internal implementation details to users.

---

# Performance

- Avoid unnecessary renders.
- Memoize only when beneficial.
- Avoid duplicate network requests.
- Keep expensive work out of render paths and request handlers.
- Do not optimize prematurely.

---

# Testing and Verification

Use the verification commands available in the current project.

Before finishing a task, verify what is practical:

- Build succeeds.
- Type checks pass.
- Lint passes.
- Tests pass, when tests exist.
- No duplicated logic was introduced.
- UI is responsive, when UI changed.
- Existing functionality still works.
- Existing components and utilities were reused where appropriate.

If a verification step cannot be run, explain why.

---

# Definition of Done

Before finishing a task, confirm:

- The request is implemented.
- The change follows existing architecture.
- The folder and component naming rules are respected.
- The change is scoped and readable.
- New code has appropriate type safety.
- Relevant loading, empty, success, and error states are handled.
- Verification was run or the limitation was reported.

---

# Forbidden Practices

Do not:

- Use `any` in TypeScript projects.
- Install packages without approval.
- Duplicate components.
- Duplicate utility functions.
- Remove existing functionality unless requested.
- Change API contracts unless requested.
- Introduce new architecture without approval.
- Commit secrets, tokens, keys, or generated credentials.
- Reformat unrelated files.
- Rewrite unrelated code.

---

# AI Instructions

Before writing code:

- Read the existing implementation.
- Follow existing architecture.
- Reuse components.
- Reuse hooks.
- Reuse utilities.
- Keep changes as small as possible.
- Match the existing coding style.
- Do not rewrite unrelated code.
- Explain architectural changes when necessary.

When unsure:

- Prefer consistency with the existing project over personal preference.
- Choose the smallest change that satisfies the task.
- Ask for clarification only when a reasonable assumption would be risky.

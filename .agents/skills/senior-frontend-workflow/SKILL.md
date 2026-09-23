---
name: senior-frontend-workflow
description: Plan, implement, debug, refactor, or review frontend work in React, Next.js, and TypeScript with production-minded decisions and junior-friendly execution steps.
---

# Senior Frontend Workflow

Use this workflow for implementation, refactoring, debugging, and review tasks involving React, Next.js, or TypeScript.

## Before Planning

- Inspect the request and relevant project context before proposing changes.
- If any ambiguity could materially affect the approach or result, ask focused clarifying questions before planning or editing code.
- If the request is sufficiently clear, proceed without unnecessary questions.

## Planning

- Always begin with a planning phase before implementation.
- Plan from the perspective of a senior frontend developer with deep production experience in React, Next.js, and TypeScript.
- Account for maintainability, accessibility, performance, type safety, testing, framework conventions, failure states, and compatibility with the existing codebase when they are relevant.
- Break the plan into ordered, manageable steps that a junior developer can follow.
- For each step, briefly explain its purpose and the implementation principle it demonstrates so the plan also teaches good practice.
- Keep the plan proportional to the task; small changes should have short plans.
- Do not begin implementation until ambiguities that materially affect the work are resolved.

## Implementation

- Follow the agreed plan while adapting when repository evidence reveals a better approach.
- Prefer clear code, descriptive naming, and straightforward structure over explanatory comments.
- Add code comments only when they communicate essential intent or constraints that the code cannot express clearly.
- Preserve all existing user-authored comments. Do not delete or rewrite them unless the user explicitly asks for that change.
- Match the project's established patterns unless doing so would perpetuate a concrete defect or conflict with the user's request.

## Verification

- Verify the result in proportion to the change, using the project's available type checks, tests, linting, or build commands.
- Report the implemented outcome, the verification performed, and any unresolved risks or assumptions.

# ADR-20260209-api-style

## Status

Accepted

## Context

This ADR records a structural or architectural decision for the project.

- **Decision Scope:** `api-style`
- **Proposed Value:** `Server Actions & Server Components`
- **Previous Value:** `GraphQL`
- **Governing Contracts:**
  - lifecycle.md
  - context-contract.md

## Decision Drivers

- Need for explicit architectural governance
- Alignment with project goals defined in `ai.project.json`
- Prevention of accidental technical drift
- Utilization of Next.js App Router features (Server Components, Server Actions)
- Requirement for type safety with Prisma and PostgreSQL
- Simplification of data fetching and mutation logic

## Considered Options

1. **Server Actions & Server Components** (Selected)
   - _Pros:_ Seamless integration with Next.js, direct database access via Prisma, end-to-end type safety, reduced boilerplate.
   - _Cons:_ Tighter coupling to the framework, potential for complexity in client-side cache updates without libraries.

2. **REST API** (Rejected)
   - _Reason:_ Adds unnecessary serialization overhead and boilerplate for internal application communication.

3. **GraphQL** (Rejected/Previous)
   - _Reason:_ Introduces unnecessary complexity (resolvers, schema definition) for a modular monolith architecture; no longer fits the project constraints.

## Decision

We will adopt **`Server Actions & Server Components`** as the authoritative standard for **`api-style`**.

## Consequences

### Positive

- **Performance:** Data fetching occurs on the server, reducing client-side JavaScript and network waterfalls.
- **Type Safety:** TypeScript types are inferred directly from Prisma models and Server Actions, ensuring consistency.
- **Simplicity:** Removes the need for a distinct API layer (controllers, serializers) for internal features.
- **Developer Velocity:** Faster iteration cycles due to reduced context switching between frontend and backend logic.

### Negative / Risks

- **Vendor Lock-in:** High dependency on Vercel/Next.js specific architecture.
- **Testing:** Integration testing requires a running Next.js environment or mocking server boundaries.
- **Security:** Requires vigilance to ensure Server Actions are properly secured (authentication/authorization checks) as they are public endpoints.

## Validation Plan

- Verify that `ai.project.json` reflects this decision.
- Ensure strict linting or CI checks enforce this rule.
- Code reviews must reject traditional API routes (Pages router) or unnecessary REST endpoints.

## Scope & Boundaries

- Applies to: **api-style**
- Strictly forbids: **GraphQL**, **Traditional REST API (for internal use)**

## Impacted Areas

- Codebase structure
- Developer workflow
- Deployment pipeline

## Supersedes / Related ADRs

- None

## Approval

- **Author:** System Governance
- **Date:** 20260209

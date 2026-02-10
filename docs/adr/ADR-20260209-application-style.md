# ADR-20260209-application-style

## Status

Accepted

## Context

This ADR records a structural or architectural decision for the project.

- **Decision Scope:** `application-style`
- **Proposed Value:** `Modular Monolith`
- **Previous Value:** `Microservices`
- **Governing Contracts:**
  - lifecycle.md
  - context-contract.md

## Decision Drivers

- Need for explicit architectural governance
- Alignment with project goals defined in `ai.project.json`
- Prevention of accidental technical drift
- **Reduction of operational overhead (no microservices orchestration required)**
- **Leveraging Next.js App Router for feature-based isolation**
- **Requirement for atomic database transactions via Prisma**

## Considered Options

1. **Modular Monolith** (Selected)
   - _Pros:_ Simplified deployment, shared type system, zero-latency internal communication.
   - _Cons:_ Requires strict linting to prevent tight coupling between modules.

2. **Microservices** (Rejected/Previous)
   - _Reason:_ Introduces distributed system fallacies, network latency, and operational complexity unwarranted for the current team size and traffic scale.

## Decision

We will adopt **`Modular Monolith`** as the authoritative standard for **`application-style`**.

## Consequences

### Positive

- **Operational Simplicity:** Single deployment unit (Vercel/Node) reduces DevOps burden.
- **Type Safety:** End-to-end TypeScript support without sharing DTO packages across repos.
- **Performance:** Internal module communication is in-process (function calls), avoiding network serialization overhead.
- **Data Integrity:** ACID transactions are easier to maintain with a single Prisma client instance.

### Negative / Risks

- **Coupling:** Without strict boundaries (e.g., lint rules), modules may become tightly coupled.
- **Build Time:** CI/CD pipelines run for the entire application; a change in one module triggers a rebuild of the whole app.
- **Scaling Granularity:** Cannot scale specific features independently (though Serverless functions on Vercel mitigate this).

## Validation Plan

- Verify that `ai.project.json` reflects this decision.
- Ensure strict linting or CI checks enforce this rule.
- **Enforce module boundaries via import restrictions (e.g., features cannot import other features directly, only shared kernel).**

## Scope & Boundaries

- Applies to: **application-style**
- Strictly forbids: **Microservices**

## Impacted Areas

- Codebase structure
- Developer workflow
- Deployment pipeline

## Supersedes / Related ADRs

- None

## Approval

- **Author:** System Governance
- **Date:** 20260209

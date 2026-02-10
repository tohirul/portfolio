# ADR-20260209-database-strategy

## Status

Accepted

## Context

The application requires a robust data persistence layer to support the Custom CMS. The data model involves highly relational entities (e.g., Projects, Case Studies, Authors, Tags, Categories).
We evaluated two primary database paradigms:

1.  **Relational (PostgreSQL):** Strict schema enforcement and powerful `JOIN` capabilities.
2.  **Document (MongoDB):** Flexible schema with denormalized data structures.

- **Decision Scope:** `database-strategy`
- **Proposed Value:** `PostgreSQL`
- **Previous Value:** `MongoDB`
- **Governing Contracts:**
  - lifecycle.md
  - context-contract.md

## Decision Drivers

- **Data Integrity:** The CMS requires strict relationships (e.g., "A Project _must_ belong to an Author").
- **Tooling Compatibility:** **Prisma ORM**, our chosen database tool, offers its best type-safety features with relational databases.
- **Ecosystem:** Excellent support for serverless scaling (via Neon/Supabase/Vercel Postgres).

## Considered Options

1. **PostgreSQL** (Selected)
   - _Pros:_ Native support for relational data, ACID compliance for transactions (critical for CMS edits), strict schema prevents "data rot."
   - _Cons:_ Requires migration scripts for schema changes; slightly higher initial setup complexity.

2. **MongoDB** (Rejected/Previous)
   - _Reason:_ Rejected because managing relationships (e.g., joining Projects and Tags) in application code is error-prone and inefficient compared to SQL `JOIN`s.

## Decision

We will adopt **`PostgreSQL`** as the authoritative standard for **`database-strategy`**, managed via **Prisma ORM**.

## Consequences

### Positive

- **Relational Integrity:** We can enforce foreign keys (e.g., deleting a User cascades to delete their Drafts), ensuring the CMS never has "orphaned" data.
- **Type Safety:** The database schema (`schema.prisma`) becomes the single source of truth for TypeScript types.
- **Advanced Querying:** Complex filtering (e.g., "Find all projects with tag 'Next.js' published after 2024") is native and performant.
- **Reliability:** ACID compliance ensures that a CMS save operation either fully succeeds or fully fails—no partial data states.

### Negative / Risks

- **Migration Friction:** Changing the content model (e.g., adding a field to a Case Study) requires running a migration command (`npx prisma migrate dev`), whereas MongoDB would just accept the new field.
- **Scaling Complexity:** While sufficient for an agency portfolio, horizontal scaling (sharding) is historically harder with SQL than NoSQL (though unlikely to be an issue at this scale).

## Validation Plan

- **Configuration Check:** Ensure `ai.project.json` lists `postgres` under `tooling.data.storage_type`.
- **Dependency Check:** `package.json` must include `pg` or `@neondatabase/serverless`.
- **Schema Check:** `schema.prisma` must define `provider = "postgresql"`.

## Scope & Boundaries

- **Applies to:** All primary application data (Users, Content, Settings).
- **Strictly forbids:** Storing relational data in JSON files or NoSQL document stores.

## Impacted Areas

- **Schema Design:** All data models must be defined in `schema.prisma`.
- **Deployment:** Requires a Postgres instance (e.g., Vercel Postgres, Neon, Supabase) linked via `DATABASE_URL`.

## Supersedes / Related ADRs

- Supersedes any implicit decision to use MongoDB.
- Related to `ADR-20260209-content-strategy` (Custom CMS).

## Approval

- **Author:** System Governance
- **Date:** 20260209

# ADR-20260209-content-strategy

## Status

Accepted

## Context

The Agency Portfolio requires a content management system to allow non-technical staff to update case studies, portfolio items, and blog posts.
We evaluated two primary approaches:

1.  **Headless CMS (Sanity/Strapi):** Rapid setup but introduces vendor lock-in and external API dependency.
2.  **Custom Next.js CMS:** Higher initial effort but offers total control, shared type safety, and zero recurring costs.

- **Decision Scope:** `content-strategy`
- **Proposed Value:** `Custom Next.js CMS`
- **Previous Value:** `Headless CMS (Sanity)`
- **Governing Contracts:**
  - lifecycle.md
  - context-contract.md

## Decision Drivers

- **Cost Efficiency:** Requirement to avoid monthly SaaS fees for CMS hosting.
- **Type Safety:** Desire for end-to-end type safety (Database → Admin → Frontend) without external SDK generation.
- **Custom Workflow:** The agency requires specific input fields and validation logic that is cumbersome to configure in off-the-shelf headless solutions.

## Considered Options

1. **Custom Next.js CMS** (Selected)
   - _Pros:_ Deep integration with the App Router, shared components between Admin/Public views, direct database access via Prisma.
   - _Cons:_ Responsibility for building text editors, image upload pipelines, and authentication.

2. **Headless CMS (Sanity)** (Rejected/Previous)
   - _Reason:_ Rejected to eliminate external API latency and ongoing subscription costs.

## Decision

We will adopt **`Custom Next.js CMS`** as the authoritative standard for **`content-strategy`**. The system will be built using **Prisma (ORM)**, **PostgreSQL**, and **Tiptap (Rich Text)**.

## Consequences

### Positive

- **Zero Vendor Lock-in:** The data lives in our own Postgres database; we are not beholden to Sanity's pricing or API changes.
- **Unified Deployment:** The Admin Dashboard and Public Site deploy together on Vercel/Netlify. No "content sync" issues.
- **End-to-End Type Safety:** We share TypeScript interfaces directly between the database (Prisma Client) and the React components. No mismatch between API response and UI.
- **Performance:** Server Components can fetch data directly from the DB (low latency) rather than waiting for an external HTTP API call.

### Negative / Risks

- **High Initial Effort:** We must build the "boring stuff" from scratch: Login screens, Rich Text Editors, Image Uploaders (S3/R2 integration).
- **Maintenance Burden:** We own the bugs. If the WYSIWYG editor breaks, we have to fix it.
- **Missing "Pro" Features:** We lose out on out-of-the-box features like Real-time Collaboration (Google Docs style) and complex Revision History, which Sanity provides for free.

## Validation Plan

- **Schema Check:** Ensure `schema.prisma` contains models for `CaseStudy`, `Project`, and `AdminUser`.
- **Route Check:** Verify existence of protected route group `(admin)` or path `/app/admin`.
- **Build Check:** CI pipeline must build both the public site and admin dashboard successfully.

## Scope & Boundaries

- **Applies to:** All dynamic content (Blogs, Case Studies, Testimonials).
- **Strictly forbids:** Hardcoding content in JSON files or using external CMS APIs (Sanity/Contentful).

## Impacted Areas

- **Database:** Requires a comprehensive SQL schema design (Prisma).
- **Security:** Requires robust Authentication (NextAuth.js/Clerk) and Authorization (Admin vs Public).
- **Assets:** Requires a custom solution for hosting uploaded images (e.g., AWS S3 or Cloudflare R2).

## Supersedes / Related ADRs

- None

## Approval

- **Author:** System Governance
- **Date:** 20260209

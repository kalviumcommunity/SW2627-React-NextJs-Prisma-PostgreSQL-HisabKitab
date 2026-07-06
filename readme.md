# 📒 Hisab Kitab

A digital khatabook/ledger application for shopkeepers — built to replace paper-based bookkeeping with a real-time, multi-user, audit-safe financial ledger.

Shopkeepers add transactions and see a running balance update instantly. Transaction history is paginated, every edit/delete is tracked with a full audit trail, and multiple shopkeepers can never edit the same transaction simultaneously.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Extended Modules](#extended-modules)
- [Architecture Highlights](#architecture-highlights)
- [Project Documentation](#project-documentation)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Team](#team)
- [Team Working Agreement](#team-working-agreement)
- [Role-Based Permissions](#role-based-permissions)

---

## Overview

**Hisab Kitab** solves a simple but high-stakes problem: shopkeepers need to know, at a glance, who owes them money, who they owe money to, and have complete confidence that every entry is accurate, recoverable, and traceable — even when multiple staff members are working on the same ledger at once.

The app is designed to scale to thousands of users from day one, with real-time sync, offline support (PWA), and AI-assisted migration from handwritten paper ledgers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) — Full-stack React framework |
| Database | [PostgreSQL](https://www.postgresql.org/) — Relational database |
| ORM | [Prisma](https://www.prisma.io/) — TypeScript ORM |
| Hosting | [GCP](https://cloud.google.com/) (Cloud Run) |
| CI/CD | [GitHub Actions](https://github.com/features/actions) |
| Real-time | Server-Sent Events (SSE) via Postgres `LISTEN`/`NOTIFY` |
| Notifications | Firebase Cloud Messaging (FCM) — Web Push |
| AI (Paper Migration) | Gemini API (vision extraction) |
| PDF Generation | `@react-pdf/renderer` |
| Scheduling | cron-job.org (pre-launch) → GCP Cloud Scheduler (post-launch) |

---

## Core Features

From the original problem statement:

- ✅ **Add transactions per contact** — race-condition-safe balance updates
- ✅ **Real-time running balance** — pushed live via SSE, no page refresh
- ✅ **Paginated transaction history** — cursor-based, fast at any depth
- ✅ **Edit/delete with full audit trail** — soft deletes only, nothing is ever lost
- ✅ **No simultaneous edits** — hybrid pessimistic + optimistic locking

**Additional MVP-scope features:**

- 🔐 Role-based permissions (Owner / Staff)
- ⏰ Due dates & reminders per contact
- 🔍 Search & filter transactions
- 📎 Receipt/photo attachments
- 🗑️ Trash / Restore (7-day recovery window)
- 🔗 Shareable ledger link & PDF export
- 🏬 Multi-shop support
- 📊 Analytics dashboard
- 📥 Opening balance & bulk CSV import
- 🔔 In-app notifications
- 🌐 Hindi / English language toggle
- 📱 PWA — installable, offline-aware
- 📈 Daily & monthly earnings view

---

## Extended Modules

### 👷 Worker & Salary Management
Track workers (monthly or daily-wage), daily attendance, and salary payments — reusing the same locking, versioning, and audit-trail patterns as the core ledger.

### 📦 Inventory & Loss Tracking
Full product, batch, and stock-movement tracking with expiry alerts, automated loss recording, and a formal Owner-approval workflow for stock adjustments and losses.

### 🤖 AI-Assisted Paper Khata Migration
Shopkeepers can photograph handwritten paper ledgers and have AI (Gemini API) extract contact names and balances — with a mandatory human review step before anything touches the live database.

---

## Architecture Highlights

Key engineering decisions that shape the system (full rationale in the [TRD](#project-documentation)):

- **Hybrid locking** — pessimistic soft-locks (live "being edited by X" UX) backed by optimistic version checks (guaranteed no silent overwrites)
- **Real-time sync** — SSE via Postgres `LISTEN`/`NOTIFY`, no extra infrastructure needed
- **Contact-based ledger model** — one entity for both customers and vendors; direction (due/payable) derived from the transaction sign, never stored separately
- **Soft deletes everywhere** — enables both the audit trail and 7-day Trash/Restore
- **Decimal currency storage** — avoids floating-point rounding errors
- **Row-level locking (`SELECT ... FOR UPDATE`)** — prevents lost updates when concurrent writes hit the same contact
- **Cursor-based pagination** — stays fast regardless of ledger depth
- **Cached rollups** — `EarningsRollup` table keeps dashboards fast at any scale

---

## Project Documentation

| Document | Description | Link |
|---|---|---|
| 📄 **PRD** — Product Requirements Document | Problem statement, goals, and scope | [PRD](https://docs.google.com/document/d/1WI5i9QX0wn2mBeBOIekk9DCzUHMpTaDh/edit?usp=sharing&ouid=114855801448713088340&rtpof=true&sd=true) |
| 🏗️ **TRD** — Technical Requirements Document | Architectural decisions & rationale | [TRD](https://docs.google.com/document/d/1jl6Vo4Gmfop7MOnuhZ1yhuLj2XiarkQz/edit?usp=sharing&ouid=114855801448713088340&rtpof=true&sd=true) |
| 🔄 **App Flow** | Screen-by-screen and API-by-API user flows | [App flow](https://docs.google.com/document/d/1BEJMq3-byJM5s_dYvxP2NArd1vLupGzA/edit?usp=sharing&ouid=114855801448713088340&rtpof=true&sd=true) |
| 🗄️ **Backend Schema** | Database schema / Prisma model reference | [Backend Schema](https://docs.google.com/document/d/1jrDhQfxl0Otl9p3_j8FCBrcob_bJQJXa/edit?usp=sharing&ouid=114855801448713088340&rtpof=true&sd=true) |
| 🚀 **Implementation Plan** | Build sequencing & milestones | [Implementation plan ](https://docs.google.com/document/d/1C-gMUKjzmnzLNZIEwO2C8hJCaj2_wdkA/edit?usp=sharing&ouid=114855801448713088340&rtpof=true&sd=true) |
| **Folder structure** | About the folder structure in depth | [Folder structure]() |
| **Features in depth** | Features explained in depth |  [Features](https://docs.google.com/document/d/1kOmHCT-sPaV1CoSjpUigtokMZtzpZq2u/edit?usp=sharing&ouid=114855801448713088340&rtpof=true&sd=true)|

---

## Folder Structure

```
hisab-kitab/
├── src/
│   ├── app/                        # Next.js App Router — routes ONLY (thin)
│   │   ├── (auth)/                 # login, register
│   │   ├── (dashboard)/            # authenticated area
│   │   │   ├── dashboard/
│   │   │   ├── contacts/
│   │   │   ├── workers/
│   │   │   ├── inventory/
│   │   │   └── settings/
│   │   ├── api/                    # one folder per resource
│   │   │   ├── auth/
│   │   │   ├── contacts/
│   │   │   ├── transactions/
│   │   │   ├── workers/
│   │   │   ├── inventory/
│   │   │   ├── notifications/
│   │   │   ├── paper-import/
│   │   │   ├── sse/                # SSE stream endpoint
│   │   │   └── cron/                # cron-secured routes
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/                 # FRONTEND — presentation only
│   │   ├── ui/                     # dumb, reusable primitives
│   │   ├── layout/                 # nav, sidebar, shop switcher
│   │   └── features/                # feature-scoped components
│   │       ├── contacts/
│   │       ├── transactions/
│   │       ├── dashboard/
│   │       ├── workers/
│   │       └── inventory/
│   │
│   ├── server/                     # BACKEND — all business logic
│   │   ├── services/                # use-case orchestration
│   │   ├── repositories/            # data access layer (wraps Prisma)
│   │   ├── validators/              # zod schemas
│   │   ├── middleware/              # require-session.ts, require-role.ts
│   │   ├── realtime/                # pg-listener.ts (LISTEN/NOTIFY → SSE)
│   │   ├── jobs/                    # cron job handlers
│   │   └── lib/                     # prisma.ts, with-contact-lock.ts, fcm.ts, gemini.ts
│   │
│   ├── hooks/                       # client-side hooks (useSSE, useContact...)
│   ├── lib/                         # shared client-safe utils
│   ├── i18n/                        # Hindi/English strings
│   ├── config/                      # feature flags, constants
│   └── types/                       # shared TS types
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
│
├── infra/
│   ├── gcp/
│   ├── cron/
│   └── docker/
│
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
│
├── scripts/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
│   └── icons/
├── docs/                            # ADRs, feature spec docs
├── .env.example
├── next.config.js
├── tsconfig.json
└── package.json
```

**Key structural rules the team follows:**

1. Frontend/backend separation lives *inside* `src/`, enforced by import direction — `components/` never imports from `server/` directly.
2. Feature-based folders (`contacts`, `transactions`, `workers`, `inventory`, `paper-import`) — minimizes merge conflicts.
3. Thin routes, fat services — `app/api/*/route.ts` only parses requests and calls `server/services/*`.
4. Repository layer isolates all Prisma calls — schema changes have a contained blast radius.
5. One zod validator per resource, shared by API routes and client forms.
6. Docker Compose for local parity and fast onboarding.
7. Tests mirror source structure 1:1.

---

## Getting Started

```bash
# 1. Clone & configure environment
cp .env.example .env

# 2. Start Postgres + app via Docker
docker compose -f docker/docker-compose.dev.yml up -d

# 3. Install dependencies
npm install

# 4. Run database migrations
npm run prisma:migrate:dev

# 5. Seed the database
npm run prisma:seed

# 6. Start the dev server
npm run dev
```

---

## Team

| Member | Role | Technical Strength |
|---|---|---|
| **Jatin Yadav** | Project Admin | React, MongoDB |
| **Sameer Choudhary** | Contributor | React, MongoDB |
| **Anant Sharma** | Contributor | React, MongoDB |

---

## Team Working Agreement

| Category | Value |
|---|---|
| **PR Review Turnaround** | Within same day |
| **How We Handle Blockers** | Raise in standup immediately |
| **Standup Format** | Yesterday / Today / Blockers (each person) |
| **Primary Team Channel** | WhatsApp Group |

> 🎯 **Sprint Commitment:** We will each submit at least one pull request every day, review teammates' PRs within the same day, and immediately raise any blockers during standup so they can be resolved quickly.

**Git conflict rules of thumb:**
- Never add a new export to an existing barrel file — import directly from the specific file.
- One PR = one feature folder where possible.
- Shared files (`schema.prisma`, `types/`, `config/constants.ts`) — keep changes small and merge often.
- Migrations are append-only and generated, never hand-edited or rebased.

---

## Role-Based Permissions

| Action | Owner | Staff |
|---|---|---|
| Add transaction / contact | ✅ | ✅ |
| Edit / delete transaction | ✅ | Configurable (default: own entries) |
| Approve stock ADJUSTMENT / LOSS | ✅ | ❌ Submit only |
| Approve/reject worker salary payment | ✅ | ❌ Record only |
| Manage shop settings, roles | ✅ | ❌ |
| Invite/remove ShopMembers | ✅ | ❌ |
| View dashboard financial totals | ✅ | Configurable |
| Bulk import / paper migration | ✅ | ✅ |
| Trash / restore | ✅ | Configurable |

---

<p align="center">Built with ❤️ for shopkeepers everywhere</p>
Project name - Hisab kitab
Team Members
Member 1 (Project Admin) :- Jatin Yadav
Technical strength :- React, MongoDB

Member 2 :- Sameer Choudhary
Technical strength :- React, MongoDB

Member 3 :- Anant Sharma
Technical strength :- React, MongoDB

| Category                   | Value                                      |
| -------------------------- | ------------------------------------------ |
| **PR Review Turnaround**   | Within same day                            |
| **How We Handle Blockers** | Raise in standup immediately               |
| **Standup Format**         | Yesterday / Today / Blockers (each person) |
| **Primary Team Channel**   | WhatsApp Group                             |

## 🎯 Sprint Commitment

> We will each submit at least one pull request every day, review teammates' PRs within the same day, and immediately raise any blockers during standup so they can be resolved quickly.

## Hisab Kitab — Feature Spec & Design Rationale
Problem Statement
Khatabook wants a digital ledger where shopkeepers add transactions and see a running balance that updates immediately. Transaction history is paginated, each transaction can be edited/deleted with an audit trail, and multiple shopkeepers cannot edit the same transaction simultaneously.
Tech Stack
•	Next.js — Full-stack React framework
•	PostgreSQL — Relational database
•	Prisma — ORM for TypeScript
•	GCP — Cloud platform and hosting
•	GitHub Actions — CI/CD automation
## 1. Core Architectural Decisions (Explained)

1.1 Concurrency Control — how we stop two shopkeepers editing the same transaction
There are two standard ways to solve “prevent simultaneous edits”:
•	Optimistic locking — anyone can open the edit form at any time. Whoever saves first wins; the second person gets a “this was already changed, refresh and retry” error only when they try to save. This is how Google Docs-style conflict resolution works at the data layer — cheap to build, no live signaling needed.
•	Pessimistic locking — the moment someone opens a transaction to edit, it’s locked for everyone else in real time. Others see “being edited by Priya” and can’t even open the form.
We’re using both, layered: - Pessimistic soft-lock as the primary, live-feeling mechanism: lockedBy + lockedAt fields, with a TTL (~2 minutes) that’s refreshed by a heartbeat while the edit form is open, and auto-released on close, disconnect, or timeout. - Optimistic version integer as a safety net underneath: every write checks the version hasn’t changed since it was read. If a lock ever goes stale (crashed tab, browser closed uncleanly), this guarantees we still never get a silent overwrite.
We picked this hybrid because we’re already building live infrastructure for real-time balance updates (see 1.2), so broadcasting lock status over the same channel is nearly free — and it matches the “live app” feel rather than letting people edit for five minutes only to fail on save.

1.2 Real-Time Balance Updates — how the server pushes to the browser
Normal web requests are one-way: the browser asks, the server answers. But if Shopkeeper A adds a transaction, Shopkeeper B — who has the same contact’s ledger open on their screen — needs their balance to update without clicking anything. That needs the server to actively push a message into B’s already-open browser tab.
Three ways to do that: 1. SSE (Server-Sent Events) — B’s browser opens one persistent connection and just listens. Server writes to Postgres → Postgres fires a NOTIFY → our API route (listening via LISTEN) catches it → pushes it down the open connection to B. One-directional (server→browser only), which is all we need. No new infrastructure — built entirely on Postgres, which we already have. 
 2 Managed service (Pusher/Ably) — same result, but a third-party service delivers the message instead of us. Easier setup, but it’s an external paid dependency and another moving part.
 3  Self-hosted Socket.io — full two-directional real-time (browser can also send messages back). More power than we need, and needs its own always-running server process, which is awkward next to a serverless Next.js app on Cloud Run.
Decision: SSE via Postgres LISTEN/NOTIFY. We only ever need server→browser pushes (balance changed, lock acquired/released), never browser→browser messaging — so SSE covers it completely with zero new infrastructure and fits Cloud Run’s serverless model well.

1.3  Auth
Real authentication from day one (not a stubbed fake user), because multi-shopkeeper editing, locking, and the audit trail all require knowing who is doing what from the very first feature we build — retrofitting identity later would mean redoing all three.

1.4 Ledger Model — Contact-based, not one shared shop balance
We considered a single shop-wide cash-book (all shopkeepers reading/writing one running total, like a physical register on the counter) versus per-person ledgers.
Why per-person (“Contact”) won: you told us the UI needs to show total dues, dues for a specific person, and what the shopkeeper owes to vendors — all from one interface. A single shop-wide number can’t answer “how much does Ramesh owe me?”, which is the single most common thing a real Khatabook user asks.
How direction is derived, not stored: instead of separate “Customer” and “Vendor” tables, we use one Contact entity per person/business, because the math is identical either way — only the sign flips: - Contact = a customer → they owe the shop → a due - Contact = a vendor → the shop owes them → a payable
Each transaction is either: - “You Gave” — increases what that contact owes you - “You Got” — decreases what that contact owes you
Running balance = sum(You Gave) − sum(You Got). Positive = they owe you (due). Negative = you owe them (payable). This gives us total dues, total payables, per-person history, and full transaction history all from the same table, for free.

1.5 Deletes — soft delete only
Nothing is ever hard-deleted. isDeleted / deletedAt / deletedBy are set instead. This is required for two things at once: the audit trail (you need the “before” state to log what changed) and the Trash/Restore feature (owners can undo an accidental delete within a grace period of 7 days ).

1.6 Money Storage — Decimal, not float/int
Currency math done with floating-point numbers accumulates rounding errors (classic example: 0.1 + 0.2 !== 0.3 in most languages). We store all amounts as Postgres Decimal types, which represent currency exactly.

1.7 Balance Consistency — preventing race conditions
This is subtly different from the locking in 1.1. Locking (1.1) stops two people editing the same existing transaction. But two shopkeepers can also add two different new transactions for the same contact at almost the same instant — and if both read the “current balance” before either writes, one update can silently overwrite the other (a classic race condition).
Fix: every write that touches a contact’s balance runs inside a single Postgres transaction using SELECT ... FOR UPDATE to row-lock that Contact row. The second writer is physically forced to wait until the first commits, then reads the already-updated balance before applying its own change. No lost updates, guaranteed by the database itself rather than application logic.

1.8 Pagination at Scale
With thousands of transactions per ledger, standard offset/limit pagination (“skip 5000, take 50”) gets slower the deeper you page, because Postgres has to scan and discard every skipped row. We use cursor-based pagination instead, keyed on (createdAt, id) with a composite index — each page is a fast indexed range lookup, regardless of how deep you are. We also cache a balanceAfter snapshot on every transaction row, so the UI never has to recompute a running total  
for a page — it just reads the stored number.

1.9 Daily/Monthly Earnings
Since Hisab Kitab is being built to scale to thousands of users from day one, daily and monthly totals are backed by a cached EarningsRollup table from the start, rather than deferring it until an aggregation query over Transaction.createdAt proves too slow. The rollup stores one row per shop per day — (shopId, date, totalEarned, totalLoss) — and is updated incrementally inside the same database transaction as every write that affects it (new transaction, edit, delete/restore, stock loss), so the rollup and the underlying data can never drift apart — the same “write both together, atomically” pattern already used for the audit trail (2, below). The dashboard reads directly from EarningsRollup — a single indexed row lookup by (shopId, date) — instead of re-aggregating transaction history on every load, which keeps dashboard load times flat regardless of how many transactions a shop has accumulated. Monthly totals are derived by summing the daily rows for that month rather than a separate monthly rollup, since 28–31 indexed row reads is still effectively free.
2. MVP Feature List — Explained
From the original problem statement
•	Add transactions per contact — the core write path; every add goes through the race-condition-safe balance update (1.7).
•	Real-time running balance — via SSE (1.2).
•	Paginated transaction history — cursor-based (1.8).
•	Edit/delete with audit trail — soft delete (1.5) + TransactionAudit log, written in the same database transaction as the change itself, so the audit trail and the data can never drift apart. Every audit row stores who changed it, when, and both the old and new values as JSON snapshots.
•	No simultaneous edits — hybrid locking (1.1).
Additional features (all in scope for MVP)
•	Role-based permissions (Owner/Staff) — e.g. only the Owner can delete a transaction or view the full audit trail; Staff can add/edit freely. Solves “why did Raju delete a ₹5000 entry” by restricting who’s allowed to.
•	Due date + reminders per contact — mark an expected payment date on a contact; the dashboard surfaces contacts that are overdue. One of the most-used features in real Khatabook-style apps.
•	Search & filter transactions — by contact, date range, type, amount. Becomes essential once a shop has hundreds of entries and can’t be scrolled through.
•	Receipt/photo attachment — attach a photo (e.g. a bill or handwritten chit) to a transaction as proof, stored via a GCS bucket URL on the transaction.
•	Trash/restore — since deletes are already soft (1.5), we expose a “Recently Deleted” screen where an Owner can restore an accidental delete within 7 days.
•	Shareable ledger link/PDF export — generate a read-only link or PDF of one contact’s ledger to send via WhatsApp (“here’s what you owe me”) — a very common real-world need for this kind of app.
•	Multi-shop support — a shopkeeper (or staff member) can belong to more than one shop and switch between them, via a ShopMember join table rather than a hard 1:1 link between User and Shop.
•	Analytics dashboard — money in vs out over time, top contacts by due amount, monthly trend — turns raw transactions into something an owner glances at each morning rather than something they have to dig through.
•	Opening balance / bulk import — a shopkeeper migrating off paper isn’t starting from zero; they can set an opening balance per contact, or bulk-import contacts + balances from a CSV instead of manually re-entering old history.
•	In-app notifications — alerts a shopkeeper when a teammate edits/deletes a transaction they created (built on top of the audit trail we already have), plus due-date reminders.
•	Hindi/regional language toggle — worth building in from the start since the target users are Indian shopkeepers; i18n is painful to retrofit later. English + Hindi covers a lot of ground initially.
•	PWA / installable, offline-aware — shopkeepers mostly use phones at the counter, often on patchy network. Installable as a PWA, works offline for viewing, queues writes until back online.
•	Daily & monthly earnings view — see 1.9.
3. ##  Extended Modules — Explained

3.1 Worker & Salary Management
Deliberately reuses the same patterns already built for the core ledger — locking, audit trail, soft delete — rather than inventing a parallel set of rules for a second feature area.
Entities - Worker — belongs to a Shop; payType is MONTHLY or DAILY_WAGE; stores monthlySalary or dailyWageRate accordingly, plus designation, joiningDate, active status. - Attendance — one row per worker per day: PRESENT / ABSENT / HALF_DAY / LEAVE, who marked it, when. - SalaryPayment — a payment record (amount, periodStart/periodEnd, paidOn, paidBy, note, status PAID/PENDING) — carries the same version / lockedBy / lockedAt fields as Transaction (1.1), so two shopkeepers can’t edit the same salary payment simultaneously either. - SalaryAudit — same old-value/new-value/who/when pattern as TransactionAudit.
How pending salary is calculated - MONTHLY workers: monthlySalary × full months since joining/last payment − total paid - DAILY_WAGE workers: (PRESENT days × dailyWageRate) + (HALF_DAY days × dailyWageRate ÷ 2) − total paid, computed from the Attendance log.
This surfaces on the dashboard as a “Salary Payable” figure, sitting alongside the dues/payables already coming from contacts (1.4) — so an owner sees everything the shop owes, to anyone, in one place.

3.2  Inventory & Loss Tracking (Full Inventory)
Entities - Product — belongs to a Shop: name, SKU, category, unit, purchasePrice, sellingPrice, reorderLevel. - ProductBatch — a specific batch of stock for a product, since the same product gets restocked at different times with different expiry dates: batchNumber, quantity, expiryDate, purchaseDate, purchasePrice. - StockEntry — every stock movement (PURCHASE, SALE, ADJUSTMENT, LOSS), with quantity, price/unit, note, and who recorded it. PURCHASE/SALE auto-approve; ADJUSTMENT/LOSS require Owner approval before they count (see the formal approval workflow in section 4). Product.currentStock is a cached running total, updated only on approval, kept in sync the same race-condition-safe way as Contact.balance (1.7) — locked update, no lost updates under concurrent writes. - Loss — created automatically when a batch expires (or manually for damaged/lost stock): links to the Product/ProductBatch, quantity, reason (EXPIRED / DAMAGED / OTHER), lossValue (= quantity × purchasePrice), who recorded it, when.
Expiry alerts A scheduled trigger calls a secured Next.js API route (POST /api/cron/expiry-check) once daily — no separate service to deploy, just an HTTP call into the app that’s already running. The route checks for batches expiring within the configurable lead time (Shop.expiryAlertDays) and creates an in-app Notification — e.g. “12 packets of Bread (Batch #4) expire in 2 days” — reusing the same notification system built for salary/due alerts. The endpoint is protected by a shared-secret header so it can’t be called by anyone else.
Scheduling mechanism — final decision: cron-job.org. Genuinely $0 — no credit card, no billing account, no paid tier to eventually hit. Register the URL + daily schedule in their dashboard; it includes execution history/logs so a failed run is visible, not silent. This is the permanent choice, not a placeholder — there’s no need to migrate to Cloud Scheduler later, since Cloud Scheduler requires enabling GCP billing just to use it and offers no real benefit here for a single low-stakes daily trigger. If this job is ever missed on a given day it costs nothing (it’s a notification, not a balance/payment operation), so a third-party scheduler carries no meaningful risk.
This surfaces on the dashboard as a “Salary Payable” figure, sitting alongside the dues/payables already coming from contacts (1.4) — so an owner sees everything the shop owes, to anyone, in one place.

3.2  Inventory  &  Loss Tracking (Full Inventory)
Entities - Product — belongs to a Shop: name, SKU, category, unit, purchasePrice, sellingPrice, reorderLevel. - ProductBatch — a specific batch of stock for a product, since the same product gets restocked at different times with different expiry dates: batchNumber, quantity, expiryDate, purchaseDate, purchasePrice. - StockEntry — every stock movement (PURCHASE, SALE, ADJUSTMENT, LOSS), with quantity, price/unit, note, and who recorded it. PURCHASE/SALE auto-approve; ADJUSTMENT/LOSS require Owner approval before they count (see the formal approval workflow in section 4). Product.currentStock is a cached running total, updated only on approval, kept in sync the same race-condition-safe way as Contact.balance (1.7) — locked update, no lost updates under concurrent writes. - Loss — created automatically when a batch expires (or manually for damaged/lost stock): links to the Product/ProductBatch, quantity, reason (EXPIRED / DAMAGED / OTHER), lossValue (= quantity × purchasePrice), who recorded it, when.
Expiry alerts A scheduled trigger calls a secured Next.js API route (POST /api/cron/expiry-check) once daily — no separate service to deploy, just an HTTP call into the app that’s already running. The route checks for batches expiring within the configurable lead time (Shop.expiryAlertDays) and creates an in-app Notification — e.g. “12 packets of Bread (Batch #4) expire in 2 days” — reusing the same notification system built for salary/due alerts. The endpoint is protected by a shared-secret header so it can’t be called by anyone else.
Scheduling mechanism — final decision: two-phase, both free.
•	Now (pre-launch / while GCP billing isn’t set up yet): cron-job.org — genuinely $0, no credit card or billing account required at all, just register the URL + schedule in their dashboard. Includes execution history/logs so failed runs are visible.
•	Later (once on GCP billing anyway, for hosting/GCS): switch the trigger to Cloud Scheduler. Its free tier covers 3 job definitions per billing account per month (billed on job count, not execution frequency) — one daily job comfortably fits. Note: Cloud Scheduler itself requires a billing account to enable the API, even though usage stays within the free tier, which is why it’s not the day-one choice.
•	Either way the API route itself doesn’t change — only who’s calling it. Low-stakes if a run is occasionally delayed (this isn’t a balance/payment operation), so a third-party free scheduler is an acceptable trade-off pre-launch.
This surfaces on the dashboard as a “Loss” section — total loss value, daily and monthly (same aggregation approach as earnings, 1.9) — sitting alongside earnings, dues, and salary payable, so the shopkeeper sees the full financial picture — money made, money owed, money owing, and money lost — in one place.

3.3 AI-Assisted Paper Khata Migration
Problem it solves: a shopkeeper migrating off paper isn’t starting from zero — they have years of handwritten ledger pages. Manually retyping every contact and balance is exactly the kind of friction that stops people from ever making the switch. This feature lets them photograph their old khata pages and have AI extract the data, with a mandatory human review step before anything touches the real database.
Entities
•	PaperImportBatch — one upload session: shopId, uploadedBy, asOfDate (a single date the shopkeeper selects for the whole batch, representing the point in time the paper pages reflect), status (PENDING / PROCESSING / READY_FOR_REVIEW / COMMITTED / CANCELLED), createdAt.
•	PaperImportPage — one row per uploaded photo: batchId, imageUrl (GCS, same attachment pattern already used for receipts), status (PENDING / EXTRACTED / FAILED / REVIEWED), rawExtractedJson (the AI’s structured output — name, balance/entries, per-field confidence), confidenceScore, resultingContactId (nullable until reviewed/committed), reviewedBy, reviewedAt.
•	Contact.openingBalanceAsOf — new field on the existing Contact entity. Seeds the balance as of the batch’s chosen date rather than “now,” so the earnings rollup (1.9) doesn’t miscount old migrated money as today’s activity.
Flow
1.	Shopkeeper selects one asOfDate for the whole batch, then uploads photos of paper khata pages.
2.	Each page is processed asynchronously (one Gemini API vision call per image) — no blocking UI. A progress screen shows status, and a push notification (reusing the existing FCM system, section4) fires when extraction is ready for review.
3.	Extracted data lands in an editable review table — nothing is written to the live database at this stage. Low-confidence fields are visually flagged so the shopkeeper knows what to double-check before trusting it.
4.	Contacts with no phone or email are still allowed through, since paper khatas rarely have either — each such row is explicitly flagged as “will create as new contact,” and the shopkeeper resolves any duplicates visually during review, since name alone can’t be auto-deduped the way phone/email can.
5.	On confirm, reviewed rows are fed into the existing bulk-import pipeline (see “Bulk import CSV format” below) rather than a separate parallel import system — same validation, same dedupe logic.
6.	The original page image stays attached to the resulting Contact (reusing the receipt-attachment pattern) — a durable reference if a migrated balance is ever disputed.
7.	Reviewed data is also exportable as CSV in the same locked schema, independent of whether it’s committed into the app — useful even for a shopkeeper who just wants a digitized backup.
Scope — MVP vs. later
•	MVP: extract just name + final balance per contact, mapping directly onto the existing opening_balance field. Lower extraction difficulty, high value, ships fast.
•	Later: extract individual dated line items instead of one lump balance, creating backdated Transaction rows and preserving full history rather than a single starting number. Meaningfully harder (parsing handwritten dates/amounts per line reliably), so it’s deferred until MVP-tier extraction quality is validated on real samples.
AI provider — final decision: Gemini API. Used via the free tier (Google AI Studio) for the accuracy spike and initial build — no credit card, generous daily limits (~1,500 requests/day on Flash models), strong multimodal support, and solid Hindi/English handling out of the box. Note for production: Google’s free-tier terms currently exclude commercial use and allow prompts/responses to be used for model improvement — both matter once this is processing real shopkeepers’ financial data at scale, so moving to a paid Gemini tier (same API, same code, just billing enabled) is the plan once the feature goes live for real users, not a provider switch.
Language handling Real khata pages mix Hindi, English, and regional shorthand, often in inconsistent handwriting. Before committing to scope beyond the MVP tier, run a quick spike — 2–3 real sample photos through the Gemini API’s vision extraction and check accuracy. That result determines whether the review step stays light (fixing a few flagged fields) or whether extraction quality needs more work before this feature is worth shipping.
4. Final Decisions on Remaining Open Items
Bulk import CSV format — columns: name, phone, email, opening_balance, type (optional). name is a display label only, not a unique key (two contacts can share a name). Validation requires phone or email (at least one), and that value is the dedupe key — a matching phone/email updates the existing contact rather than creating a duplicate. opening_balance must be numeric.
PDF export design — two report types, both server-rendered (e.g. @react-pdf/renderer) so output is consistent and the same renderer backs the shareable read-only link: - Per-contact ledger — shop name/logo header, contact name + current balance, then a table of date / type / amount / running balance — the full transaction log for that one person. - All-dues summary — one report listing every contact with an outstanding due (or payable), sorted by amount, for a shopkeeper who wants the whole picture instead of person-by-person.
Notification delivery channel — Web Push via Firebase Cloud Messaging (FCM), which is free with no per-message cost, delivered through the browser’s Push API — ties directly into the PWA (already planned) so a shopkeeper gets a real push notification on their lock screen even with the app closed. In-app notifications remain as a fallback/log so nothing’s lost if push permission was denied. SMS/WhatsApp stay deferred as a later, paid addition (they need a provider like Twilio/Gupshup); the Notification table includes a channel field from the start so adding them later doesn’t require a schema change.
Offline write-queue conflict resolution — a queued offline write goes through the same version check (1.1/1.7) as any other write once it syncs. If the version has moved on, we don’t silently merge — we surface a conflict prompt showing “this changed while you were offline” vs. “your value,” the same visual pattern used for live-lock conflicts. One conflict-handling UI serves both cases.
Half-day pay fraction — defaults to 50% of daily wage, but stored as a per-shop setting (Shop.halfDayFraction, default 0.5) rather than hardcoded, so a shop can override it.
Expiry alert lead time — defaults to 3 days, also a per-shop setting (Shop.expiryAlertDays), since some shops will want a week’s notice and others just a day.
Stock adjustment approval — a formal approval workflow, since these entries can hide shrinkage or error and deserve a second set of eyes: - StockEntry gains a status: PENDING / APPROVED / REJECTED - PURCHASE and SALE entries auto-approve (routine, transactional) - ADJUSTMENT and LOSS entries start PENDING - Product.currentStock only changes once an entry is APPROVED - The Owner receives a push notification (via FCM) the moment Staff submits one - Owner approves/rejects with an optional reviewNote; the decision is logged through the same audit-trail pattern as everything else (1.5) — no new concept, just the existing pattern reapplied here..

## Project Folder Structure
Digital khatabook/ledger app for shopkeepers · Next.js (full-stack) · PostgreSQL · Prisma · GCP · GitHub Actions
Folder Tree
hisab-kitab/
├── src/
│   ├── app/                        # Next.js App Router — routes ONLY (thin)
│   │   ├── (auth)/                 # login, register — route group, no URL segment
│   │   ├── (dashboard)/            # authenticated area — route group
│   │   │   ├── dashboard/
│   │   │   ├── contacts/
│   │   │   ├── workers/
│   │   │   ├── inventory/
│   │   │   └── settings/
│   │   ├── api/                    # API routes — one folder per resource
│   │   │   ├── auth/
│   │   │   ├── contacts/
│   │   │   ├── transactions/
│   │   │   ├── workers/
│   │   │   ├── inventory/
│   │   │   ├── notifications/
│   │   │   ├── paper-import/
│   │   │   ├── sse/                # SSE stream endpoint
│   │   │   └── cron/               # cron-secured routes (expiry-check, etc.)
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/                 # FRONTEND — presentation only, no business logic
│   │   ├── ui/                     # dumb, reusable primitives (Button, Table, Modal)
│   │   ├── layout/                 # shell: nav, sidebar, shop switcher
│   │   └── features/                # feature-scoped components
│   │       ├── contacts/
│   │       ├── transactions/       # e.g. balance-live.tsx (SSE subscriber)
│   │       ├── dashboard/
│   │       ├── workers/
│   │       └── inventory/
│   │
│   ├── server/                     # BACKEND — all business logic, never imported by client components
│   │   ├── services/                # use-case orchestration (transaction-service.ts, salary-service.ts...)
│   │   ├── repositories/            # data access layer, wraps Prisma (contact-repository.ts...)
│   │   ├── validators/              # zod schemas — one per resource, shared by API routes + services
│   │   ├── middleware/              # require-session.ts, require-role.ts
│   │   ├── realtime/                # pg-listener.ts (LISTEN/NOTIFY -> SSE bridge)
│   │   ├── jobs/                    # cron job handlers (expiry-check, rollup-repair)
│   │   └── lib/                     # prisma.ts (singleton client), with-contact-lock.ts, fcm.ts, gemini.ts
│   │
│   ├── hooks/                       # client-side hooks (useSSE, useContact, useDebounce)
│   ├── lib/                         # shared client-safe utils (formatCurrency, cn, dates)
│   ├── i18n/                        # Hindi/English strings
│   │   └── locales/
│   ├── config/                      # feature flags, constants (roles, tx types)
│   └── types/                       # shared TS types + inferred zod types
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml           # prod-like: app + postgres
│   ├── docker-compose.dev.yml       # local dev override (hot reload, exposed db port)
│   └── .dockerignore
│
├── infra/
│   ├── gcp/                         # Cloud Run service config, IAM notes
│   ├── cron/                        # cron-job.org setup notes (see decision #16)
│   └── docker/                      # (reserved for infra-level compose overrides if needed)
│
├── .github/workflows/
│   ├── ci.yml                       # lint, typecheck, test on every PR
│   └── deploy.yml                   # build image, push, deploy to Cloud Run on main
│
├── scripts/                         # one-off ops scripts (backfill, migration helpers)
├── tests/
│   ├── unit/                        # mirrors src/server structure
│   ├── integration/                 # db-backed tests (real Postgres via docker)
│   └── e2e/                         # Playwright, mirrors app/ routes
│
├── public/
│   └── icons/                       # PWA icons, manifest assets
├── docs/                            # ADRs, feature spec doc lives here
├── .env.example
├── .gitignore
├── next.config.js                   # PWA config lives here
├── tsconfig.json
└── package.json
## Why This Shape (Rules We're Following)
1.	Frontend/backend separation lives inside src/, not as two repos. Splitting Next.js into literal frontend/ and backend/ top-level folders would fight the framework (routing, server components, bundling). Instead the boundary is enforced by import direction: components/ never imports from server/ directly — API routes are the only bridge. server/ code never imports React.
2.	Feature-based, not type-based, past the first level. Inside components/features/, app/api/, app/(dashboard)/, and server/services/, folders are named after domain concepts (contacts, transactions, workers, inventory, paper-import) — matching the entities in the PRD. A dev working on Inventory touches inventory/ folders across the tree and almost never opens a file another dev owns. This is the single biggest lever for fewer merge conflicts.
3.	Thin routes, fat services. app/api/*/route.ts files only do: parse request → call a server/services/* function → return response. All logic (locking, version checks, rollup updates) lives in services/, tested independently of HTTP. Keeps route files small and mergeable.
4.	Repository layer isolates Prisma. server/repositories/ is the only place prisma.* calls happen for core entities. If the schema changes, the blast radius is one file per entity, not scattered across services.
5.	One validator file per resource. server/validators/transaction-schema.ts shared by both the API route (request validation) and the client form (same zod schema) — no drift between what the server accepts and what the form checks.
6.	Docker for parity + onboarding. docker-compose.dev.yml spins up Postgres + the app with hot reload so a new teammate runs one command and is coding in minutes, no local Postgres install. docker-compose.yml (prod-shaped) is what CI builds against to catch environment drift early.
7.	Route groups (auth) / (dashboard). Organize URLs without affecting the URL path — keeps authenticated vs public layouts cleanly separated.
8.	Tests mirror source structure 1:1. tests/unit/server/services/... maps to src/server/services/... so it's always obvious where a test for a given file lives, and two people adding tests for different features don't collide either.
Git Conflict Rules of Thumb for the Team
•	Never add a new export to an existing "barrel" file — we deliberately don't use barrel files in services/ or repositories/ for this reason. Import directly from the specific file.
•	One PR = one feature folder where possible (e.g. all of inventory/*), not scattered cross-cutting edits.
•	Shared files everyone touches (schema.prisma, types/, config/constants.ts) are the few spots where conflicts will happen — keep changes there small, reviewed fast, and merged often (don't let them sit in a long-lived branch).
•	Migrations (prisma/migrations/) are append-only and generated, never hand-edited or rebased — always prisma migrate dev on top of latest main.
## Getting Started
cp .env.example .env
docker compose -f docker/docker-compose.dev.yml up -d   # postgres + app
npm install
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev




# FlipTrack Open Source Master Plan

This document serves as the architectural and product blueprint for transitioning FlipTrack from a hackathon project into a mature, production-grade, long-term open-source platform.

---

## 1. Complete Codebase Audit Summary
FlipTrack is a full-stack SaaS application built on modern, bleeding-edge web technologies:
- **Framework**: React Router v7 (formerly Remix)
- **Database**: PostgreSQL (Supabase) via Prisma ORM
- **Authentication**: Supabase Auth (Server-side & Client-side)
- **Styling/UI**: Vanilla CSS Modules, Radix UI Primitives, Tabler Icons
- **Analytics/Charts**: Recharts

**Current State:** 
The application has a strong foundational structure with modular blocks (e.g., `app/blocks/`), separated route logic, and a clean UI. However, it suffers from "hackathon syndrome"—many pages still rely on `mock-data.ts`, some database queries are unoptimized (e.g., sequential loops instead of `createMany`), and there is a lack of testing, robust error boundaries, and rate-limiting. Application security relies solely on `userId` checks rather than Row Level Security (RLS).

---

## 2. Existing Feature Inventory
- **Authentication**: Email/Password login, Signup, session management via cookies.
- **Inventory Management**: Add items, duplicate items, list view, basic filtering, status toggling.
- **Sales Log**: Logging sales, calculating net proceeds, tracking marketplace platforms.
- **Expenses**: Tracking one-time and recurring business expenses.
- **Dashboard**: High-level aggregations (Proceeds, Cost Basis), Recharts visualizations.
- **Tax Report / Income Statement**: UI layouts exist (partially wired to real data, partially mock data).
- **Settings**: Basic UI for user profile and preferences.
- **Marketing/Public**: Landing page, features page, pricing page, FAQ, Blog structure.

---

## 3. Missing Feature Inventory
- **Core Product**: Image uploads (S3/Supabase Storage), Barcode scanning (mobile/PWA), CSV Import/Export.
- **Multi-tenancy**: Team member invites and role-based access control (RBAC).
- **Automation**: Real-time market price scraping, cron jobs for price alerts.
- **Integrations**: eBay/StockX/GOAT API integrations for auto-sync.
- **Infrastructure**: Unit testing (Vitest), E2E testing (Playwright), CI/CD pipelines, caching (Redis/Edge).
- **Communication**: Email delivery system (Resend/SendGrid) for alerts and invites.

---

## 4. Technical Debt Inventory
1. **Mock Data Reliance**: `income-statement.tsx`, `inventory-item-detail.tsx`, and parts of the dashboard still import from `~/data/mock-data`.
2. **Missing Tests**: Zero unit, integration, or end-to-end tests exist.
3. **Error Boundaries**: React Router `ErrorBoundary` components are largely missing, meaning unhandled errors crash the entire route.
4. **Hardcoded Enums**: UI components sometimes hardcode statuses instead of importing Prisma enums.
5. **No Caching**: Data loaders fetch directly from the DB on every request without caching headers or Redis.

---

## 5. Scalability Risks
- **Serverless Timeouts**: Long-running tasks (like the proposed AI Insights or scraping jobs) will hit Vercel's 10s/50s serverless timeout limit. These must be moved to background queues (e.g., Inngest or Upstash QStash).
- **Connection Pooling**: Heavy usage will exhaust PostgreSQL connections unless Supabase connection pooling (PgBouncer) is explicitly configured and optimized in the Prisma connection string.
- **N+1 Queries**: Some loaders might be fetching related data inefficiently. Must enforce `include` in Prisma.

---

## 6. Security Audit Observations
- **IDOR Vulnerabilities**: Application-level `userId` validation must be strictly enforced on *every* update/delete mutation. (Issue #67 highlighted this in the Sales Log).
- **No RLS**: Supabase Row Level Security is bypassed because we connect directly via Prisma. We must rely entirely on application logic.
- **Rate Limiting**: Authentication and API routes have no rate limiting, making them susceptible to brute force or DDoS.
- **CSRF Protection**: Remix/React Router handles basic form protection, but explicit CSRF tokens for sensitive mutations (like password changes) should be audited.

---

## 7. Performance Observations
- **Bundle Size**: Good, but can be improved by dynamically importing heavy libraries (like `xlsx` or `recharts`).
- **Database Indexing**: Missing compound indexes for common queries (e.g., sorting inventory by `purchaseDate` descending while filtering by `userId`).
- **Lazy Loading**: Images and heavy charts should use `loading="lazy"` and Suspense boundaries.

---

## 8. Developer Experience (DX) Observations
- **Pros**: Clear folder structure, CSS modules prevent style conflicts, TypeScript enforcement.
- **Cons**: No local database seeding script. Contributors must manually populate data. No `.vscode/settings.json` to enforce Prettier. No `CONTRIBUTING.md` guidelines for testing.

---

## 9. Documentation Observations
- **Current**: Basic `README.md` and `CONTRIBUTING.md`.
- **Missing**: Architecture diagrams, local setup troubleshooting, database schema explanation, and PR templates.

---

## 10. Comparison Against Pricely
- **Pricely Strengths**: Advanced profit margin calculators across different platforms (eBay vs Amazon vs local), robust barcode scanning.
- **FlipTrack Weaknesses**: Lacks platform-specific fee calculations (Issue #63), no native mobile app scanning.

---

## 11. Comparison Against ScoutApp
- **ScoutApp Strengths**: Deep integration with StockX/GOAT, automated label printing, bulk inventory management.
- **FlipTrack Weaknesses**: Still relies on manual entry for market prices, UI for bulk actions is limited.

---

## 12. Killer Feature Opportunities (Differentiators)
1. **Universal Reseller Ecosystem**: Unlike ScoutApp (sneakers), FlipTrack is now generalized for cards, electronics, and vintage clothes.
2. **AI-Driven Pricing Insights**: Analyzing sales velocity across platforms to tell the user *where* to sell an item for maximum profit, not just *when*.
3. **Offline-First PWA**: Using local IndexedDB caching so users can log inventory while at a flea market with zero cell service, syncing when back online.
4. **Open-Source Extensibility**: Allowing the community to build custom "Platform Plugins" (e.g., a Depop scraper plugin).

---

## 13. Categorized Roadmap
### Short-Term (1-3 Months) "Foundation & Stability"
- Eradicate all `mock-data.ts`.
- Implement robust testing (Vitest).
- Fix IDORs and enforce security rules.
- Add image uploads and CSV imports.

### Medium-Term (3-6 Months) "Growth & Automation"
- Setup background job queues (Inngest).
- Implement automated market price scraping.
- Team collaboration & Multi-tenancy (RBAC).
- PWA Offline support.

### Long-Term (6-12+ Months) "Enterprise & Ecosystem"
- AI-driven pricing recommendations.
- Public API for third-party integrations.
- Advanced Tax/Accounting integrations (QuickBooks export).
- Mobile barcode scanning via WebRTC/Camera APIs.

---

## 14. Dependency Graph Between Major Initiatives
1. **Background Jobs (Inngest)** MUST PRECEED **Market Price Scraping** (prevents timeouts).
2. **S3/Storage Setup** MUST PRECEED **Image Uploads** & **CSV Export/Import**.
3. **Database Indexing** MUST PRECEED **Advanced Filtering & Sorting**.
4. **Testing Infrastructure** MUST PRECEED **Public API creation**.

---

## 15. Prioritized GitHub Issue Backlog

### Phase 1: Security & Tech Debt
1. `Security: Implement Rate Limiting on Auth and API Routes`
2. `Tech Debt: Replace mock-data.ts in Income Statement with Prisma Queries`
3. `Tech Debt: Replace mock-data.ts in Item Details with Prisma Queries`
4. `Infra: Setup Vitest and write initial test suite for Auth Utils`

### Phase 2: Core Product Completion
5. `Feature: Implement Image Upload for Inventory Items (Supabase Storage)`
6. `Feature: Calculate Platform Fees dynamically in Sales Log`
7. `Feature: Add PDF Export for Tax Reports`

### Phase 3: Automation & Scale
8. `Infra: Integrate Inngest for Background Job Processing`
9. `Feature: Create background cron job for Market Price Syncing`
10. `Perf: Add database compound indexes for Dashboard queries`

---

## 16. GitHub Issues (Scoping Strategy)

Below are the fully-written GitHub issues for our Phase 1 backlog. They are designed to be explicitly scoped so contributors can work independently without overloading them.

---

### Issue 1: `Security: Implement Rate Limiting on Auth and API Routes`

**Problem Statement**
Currently, our Supabase/Prisma architecture relies entirely on application-level logic for authentication and API mutations. We have no rate limiting in place for sensitive routes (e.g., `/auth/login`, `/auth/reset-password`, `/api/insights`), leaving the application vulnerable to brute-force attacks and DDOS.

**Motivation**
To become a production-grade platform, we must protect our backend from malicious scraping and credential stuffing.

**Proposed Solution**
Implement a lightweight Redis-based or memory-based rate limiter middleware for Remix actions and loaders.
1. Add a utility function `rateLimit(request, limit, windowMs)` in `app/utils/rate-limit.server.ts`.
2. Apply this utility to `app/routes/login-page.tsx`, `app/routes/signup-page.tsx`, and `app/routes/reset-password.tsx`.

**Implementation Notes**
- Since we are deploying to Vercel, memory-based limiters won't share state across serverless functions. We should investigate using `@upstash/ratelimit` if a Redis instance is available, OR implement a simple IP-based rate limiter using Vercel KV.
- If Redis is unavailable, fallback to a basic memory cache and clearly document the limitation.

**Dependencies**
- None. Can be worked on independently.

**Out-of-Scope**
- Do not implement rate limiting on frontend UI components. This is strictly backend middleware.

**Acceptance Criteria**
- [ ] `rateLimit` utility function is created.
- [ ] Attempting to login > 5 times in 1 minute throws a `429 Too Many Requests` response.
- [ ] The user sees a clear error message: "Too many attempts. Please try again later."

**Testing Requirements**
- Add unit tests for the `rateLimit` function.

**Documentation Updates**
- Document the new utility in `CONTRIBUTING.md` so future developers know how to rate-limit their new API routes.

**Labels**: `security`, `enhancement`, `backend`
**Estimated Difficulty**: Advanced
**Suggested Tech Areas**: Remix, Redis/Vercel KV, Security

---

### Issue 2: `Tech Debt: Replace mock-data.ts in Income Statement with Prisma Queries`

**Problem Statement**
The `app/routes/income-statement.tsx` page and its associated blocks (`detailed-statement-table.tsx` and `monthly-breakdown-chart.tsx`) are currently hardcoded to use `mockSales` and `mockCashFlow` from `app/data/mock-data.ts`.

**Motivation**
Users cannot see their actual financial data on the income statement page. We need to wire this up to the real PostgreSQL database.

**Proposed Solution**
1. Add a Remix `loader` to `app/routes/income-statement.tsx`.
2. Use `prisma.sale.findMany()` and `prisma.expense.findMany()` to fetch data for the logged-in user.
3. Group the sales and expenses by month to generate the data structure expected by the `monthly-breakdown-chart.tsx`.
4. Pass the fetched data down to the components via `useLoaderData()`.

**Implementation Notes**
- The database queries should filter by a specific year (default to the current year).
- Ensure you wrap the Prisma calls in `try/catch` and return appropriate error states.
- See how `dashboard.tsx` fetches sales data for inspiration.

**Dependencies**
- None.

**Out-of-Scope**
- Do not add new charts or modify the UI layout. Only replace the data source.

**Acceptance Criteria**
- [ ] `mock-data.ts` is no longer imported anywhere in the `income-statement` blocks.
- [ ] The Income Statement table accurately displays real sales from the database.
- [ ] The Monthly Breakdown chart accurately plots real income vs. expenses.

**Labels**: `bug`, `tech-debt`, `database`
**Estimated Difficulty**: Intermediate
**Suggested Tech Areas**: Prisma, React Router loaders, Data Transformation

---

### Issue 3: `Infra: Setup Vitest and write initial test suite for Auth Utils`

**Problem Statement**
FlipTrack currently has zero automated tests. This makes it extremely dangerous to merge community PRs, as we cannot guarantee we aren't breaking existing features.

**Motivation**
A test suite is the foundation of a mature open-source project. We need to establish the testing framework so future contributors can write tests for their features.

**Proposed Solution**
1. Install `vitest`, `@testing-library/react`, and `jsdom`.
2. Configure `vitest.config.ts` in the root directory.
3. Write the first test suite for our authentication utilities (e.g., `app/utils/auth.server.ts` or basic utility functions).
4. Add a `test` and `test:coverage` script to `package.json`.

**Implementation Notes**
- We are using Vite, so Vitest is the natural choice over Jest.
- We do NOT need to mock Prisma or test the database yet. Keep this first PR focused purely on setting up the framework and testing pure, stateless utility functions.

**Out-of-Scope**
- End-to-End (E2E) testing with Playwright (this will be a separate issue).
- Integration testing React components that require database access.

**Acceptance Criteria**
- [ ] `npm run test` executes successfully and runs at least one basic test.
- [ ] Vitest configuration is cleanly separated and documented.
- [ ] The PR does not break the existing Vite build process.

**Documentation Updates**
- Add a "Testing" section to `CONTRIBUTING.md` explaining how to run tests.

**Labels**: `testing`, `infrastructure`, `good-first-issue`
**Estimated Difficulty**: Beginner/Intermediate
**Suggested Tech Areas**: Vitest, Node.js

---

## 17. Final Roadmap to Best-In-Class
To transition FlipTrack to a world-class project, we must shift the culture from "ship features fast" to "ship stable, maintainable systems." 
1. **Establish Governance**: Create PR templates, enforce CI checks, and require test coverage.
2. **Documentation Site**: Deploy a Docusaurus or VitePress site dedicated solely to developer documentation.
3. **Community Mentorship**: Reserve "Good First Issues" and actively mentor contributors through architectural decisions, exactly as you have been doing.
4. **Release Cycles**: Implement Semantic Versioning and automated changelogs via GitHub Actions.

---

### User Review Required
Does this architectural audit and roadmap align with your vision for FlipTrack? Upon your approval, I will generate the complete, fully-written GitHub issue templates for the prioritized backlog and save them to the `scratch/` directory so you can easily copy/paste them into GitHub.
- - -  
 * * P r o b l e m   S t a t e m e n t * *  
 T h e   ` a p p / r o u t e s / i n v e n t o r y - i t e m - d e t a i l . t s x `   p a g e   ( a n d   i t s   s u b c o m p o n e n t s   ` p r i c e - h i s t o r y - c h a r t . t s x `   a n d   ` r e l a t e d - i t e m s . t s x ` )   c u r r e n t l y   r e l y   o n   h a r d c o d e d   a r r a y s   f r o m   ` a p p / d a t a / m o c k - d a t a . t s ` .    
  
 * * M o t i v a t i o n * *  
 W h e n   a   u s e r   c l i c k s   o n   a n   i n v e n t o r y   i t e m   t o   v i e w   i t s   d e t a i l s ,   t h e   p r i c e   h i s t o r y   a n d   r e l a t e d   i t e m s   s e c t i o n s   a r e   c o m p l e t e l y   s t a t i c   a n d   f a k e .   W e   n e e d   t h e s e   c o m p o n e n t s   t o   d i s p l a y   r e a l   d a t a   f r o m   t h e   d a t a b a s e .  
  
 * * P r o p o s e d   S o l u t i o n * *  
 1 .   U p d a t e   t h e   ` l o a d e r `   i n   ` a p p / r o u t e s / i n v e n t o r y - i t e m - d e t a i l . t s x `   t o   f e t c h :  
       -   T h e   a c t u a l   p r i c e   h i s t o r y   f o r   t h e   i t e m   ( ` p r i s m a . m a r k e t P r i c e . f i n d M a n y ( {   w h e r e :   {   i n v e n t o r y I t e m I d :   p a r a m s . i d   } } ) ` ) .  
       -   R e l a t e d   i t e m s   f r o m   t h e   s a m e   u s e r   ( e . g . ,   i t e m s   w i t h   t h e   s a m e   b r a n d   o r   c a t e g o r y ) .  
 2 .   P a s s   t h i s   d a t a   d o w n   t o   t h e   c o m p o n e n t s   v i a   ` u s e L o a d e r D a t a ( ) ` .  
 3 .   U p d a t e   ` p r i c e - h i s t o r y - c h a r t . t s x `   a n d   ` r e l a t e d - i t e m s . t s x `   t o   a c c e p t   t h i s   r e a l   d a t a   v i a   p r o p s   i n s t e a d   o f   i m p o r t i n g   ` m o c k - d a t a . t s ` .  
  
 * * I m p l e m e n t a t i o n   N o t e s * *  
 -   B e   c a r e f u l   w i t h   ` p r i s m a . m a r k e t P r i c e . f i n d M a n y ( ) `   -   y o u   m i g h t   n e e d   t o   e n s u r e   t h e   ` M a r k e t P r i c e `   t a b l e   i s   a c t u a l l y   b e i n g   p o p u l a t e d ,   o r   h a n d l e   t h e   c a s e   w h e r e   t h e   p r i c e   h i s t o r y   a r r a y   i s   e m p t y   ( s h o w   a n   e m p t y   s t a t e   U I ) .  
 -   F o r   r e l a t e d   i t e m s ,   a   s i m p l e   q u e r y   m a t c h i n g   t h e   ` b r a n d `   a n d   ` u s e r I d `   ( e x c l u d i n g   t h e   c u r r e n t   i t e m   I D )   i s   s u f f i c i e n t   f o r   n o w .  
  
 * * D e p e n d e n c i e s * *  
 -   N o n e .  
  
 * * O u t - o f - S c o p e * *  
 -   D o   n o t   b u i l d   a   w e b   s c r a p e r   t o   p o p u l a t e   m a r k e t   p r i c e s   i n   t h i s   P R .   O n l y   w i r e   u p   t h e   f r o n t e n d   t o   r e a d   w h a t e v e r   i s   c u r r e n t l y   i n   t h e   d a t a b a s e .  
  
 * * A c c e p t a n c e   C r i t e r i a * *  
 -   [   ]   ` m o c k - d a t a . t s `   i s   c o m p l e t e l y   r e m o v e d   f r o m   t h e   ` i n v e n t o r y - i t e m - d e t a i l `   c o m p o n e n t s .  
 -   [   ]   T h e   P r i c e   H i s t o r y   c h a r t   d i s p l a y s   d a t a   f e t c h e d   f r o m   t h e   ` M a r k e t P r i c e `   t a b l e   ( o r   a n   e m p t y   s t a t e   i f   n o n e   e x i s t ) .  
 -   [   ]   T h e   R e l a t e d   I t e m s   s e c t i o n   d i s p l a y s   r e a l   i t e m s   f r o m   t h e   u s e r ' s   i n v e n t o r y .  
  
 * * L a b e l s * * :   ` b u g ` ,   ` t e c h - d e b t ` ,   ` d a t a b a s e ` ,   ` E C S o C 2 6 `  
 * * E s t i m a t e d   D i f f i c u l t y * * :   I n t e r m e d i a t e  
 * * S u g g e s t e d   T e c h   A r e a s * * :   P r i s m a ,   R e a c t   R o u t e r   l o a d e r s ,   R e c h a r t s  
 
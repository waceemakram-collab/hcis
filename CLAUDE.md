# HCIS — Expertise Wave

Internal Human Capital Information System. **Single company. Single tenant. Not a product.**

This file is the contract for all work in this repo. Read it before writing code.

---

## What this system is

An internal HR system for Expertise Wave employees. There is exactly one company:
ours. There is no customer, no tenant, no reseller.

- **No `tenant_id` / `company_id` columns.** Ever. If you find yourself adding one, stop.
- **No multi-tenant abstraction.** No "organization" concept.
- **Admin-only access in the current phase.** Anyone who can log in is an HR admin
  with full read/write. There is no role system, no permission matrix, and no
  employee self-service portal. Employees exist as *data*, not as *users*.
- Employee login and self-service are a **later phase**. Do not build hooks for them now.

### Roadmap (context for design decisions, not a licence to build ahead)

| Phase | Scope |
| --- | --- |
| Session 1 | Departments, job titles, employee records (create / list / view) |
| Session 2 | Employee history — viewing the effective-dated timeline |
| Session 3 | Employee editing, preserving history |
| Session 4 | Document expiry tracker (passport, residency permit, labour card, …) |
| Session 5+ | Leave, attendance |
| Later | Payroll engine + Zoho Books journal-entry export |

Zoho Books and Zoho Inventory are the existing finance stack. **No Zoho integration
code in this phase.** When payroll arrives, employees will gain a `zoho_employee_id`
mapping column — design so that adding it is a one-line migration, but do not add it now.

---

## The five rules

These are not style preferences. Violating any of them is a defect.

### 1. Money is never a floating-point number

`float`, `double precision`, and JavaScript `number` arithmetic on currency are
banned. `0.1 + 0.2 !== 0.3`, and a payroll run that is off by 0.0000001 SAR per
line is off by real money at the bottom of the payslip.

- **Postgres:** `numeric(14, 2)` for amounts, or an integer count of the minor unit
  (halalas). Never `float8`.
- **TypeScript:** never do arithmetic on a money value with `+` / `*`. Keep money as
  a string or a bigint minor-unit integer at the boundary; use a decimal library for
  arithmetic when payroll lands.
- **Rounding is a business decision**, not a formatting accident. Round once,
  explicitly, at the point the business rule says to — never implicitly via display.

There are no money columns yet. This rule exists now so that it is already law when
payroll arrives.

### 2. HR records are effective-dated

An HR system's job is to answer *"what was true on 3 March last year?"* — for back-pay,
end-of-service settlement, labour-ministry disputes, and audits. A system that only
stores the current state cannot answer that question and is therefore not an HR system.

- **Never overwrite a fact that has a validity period.** To change someone's
  department, job title, or manager: close the current `assignments` row by setting
  `valid_to`, then insert a new row starting on that date. Do not `UPDATE` the
  department on the existing row.
- Validity ranges on `assignments` are **half-open**: `[valid_from, valid_to)`.
  `valid_to IS NULL` means *current*. When an assignment ends and the next begins on
  day X, the old row's `valid_to = X` and the new row's `valid_from = X` — no gap,
  no overlap.
- The database enforces non-overlap with a `gist` exclusion constraint. If an insert
  is rejected with `assignments_no_overlap`, the code tried to create contradictory
  history. Fix the code; do not drop the constraint.
- `employments.termination_date` is **inclusive** — it is the last working day.
  `NULL` means still employed. (This differs from the half-open `assignments` range;
  it matches how HR and labour contracts actually talk about a last day.)

**Correcting a typo is not the same as recording a change.** If someone's job title
was *entered wrong*, that is a correction — fix the row and let the audit log record
it. If someone *was promoted*, that is a new effective-dated row. Ask which one it is.

### 3. A person is not an employee

A human being and an employment relationship are different things with different
lifecycles. Conflating them is the single most common HCIS design failure.

- `persons` holds the human: name, date of birth, nationality, national ID. These
  facts survive employment. A person may be a candidate, a former employee, a
  contractor, or a rehire.
- `employments` holds a *period of being employed*. One person can have several over
  time (leaver who returns). A person with **zero** employment rows is a perfectly
  valid record, not an error.
- Never add `department_id`, `job_title_id`, `hire_date`, `salary`, or `manager_id`
  to `persons`. Those belong to an employment or an assignment, not to a human being.
- Never add `login`, `role`, or `password` to `persons`. System users are
  `auth.users`; they are a separate concern.
- "Employee" is a *derived* state — a person who has an employment that is active on
  a given date. Compute it; do not store it as a boolean on `persons`.

### 4. Bilingual Arabic / English with RTL

The UI must work fully in both languages, and Arabic means right-to-left, not
left-to-right text that happens to be Arabic.

- **Data:** human-entered names that appear in the UI get paired columns —
  `name_en` / `name_ar`. English is required; Arabic is optional (fill it in later).
- **UI strings:** never hardcode user-visible text in JSX. Every string comes from
  `lib/i18n/dictionaries/{en,ar}.json`. If you add a key to `en.json`, add it to
  `ar.json` in the same commit — the dictionary type makes a missing key a build error.
- **Direction:** `dir` is set on `<html>` from the locale cookie. Use Tailwind's
  **logical** utilities — `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`,
  `start-*`, `end-*` — never `ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right`.
  A layout built with physical directions silently breaks in Arabic.
- **Not translated:** dates use the Gregorian calendar in both locales (labour
  contracts and Zoho use Gregorian); numbers use Western digits in both. Do not
  "helpfully" switch to Hijri or Eastern Arabic numerals without an explicit decision.
- No locale routing. There is no `/en/` or `/ar/` URL segment — a cookie plus a
  toggle. Do not introduce locale-prefixed routes.

**The root layout blocks prerendering, on purpose.** `next.config.ts` sets
`cacheComponents: true`, so Next reports the root layout as a "Blocking Route": it
reads the locale cookie before the static shell exists. It has to — `dir` lives on
`<html>`, which cannot be wrapped in Suspense. `app/layout.tsx` therefore declares
`export const instant = false`.

Do **not** silence this by wrapping `cookies()` in try/catch. Under `cacheComponents`
that call throws Next's internal prerender-abort signal, not an ordinary error;
catching it bakes `DEFAULT_LOCALE` into the shell and the Arabic toggle silently
stops working in production while still looking fine in dev. Locale-prefixed routes
are the only design that would let the shell prerender, and we deliberately rejected
them. Nothing is lost either way: every page is behind auth and `requireUser()` reads
cookies too, so no route here was ever prerenderable.

### 5. Every data change is audited

Every insert, update, and delete of HR data writes an `audit_log` row recording
**who, what, when, before, after, and why**.

- Auditing is **application-level**, in Server Actions — not database triggers. This
  is deliberate: it lets us capture `reason`, which a trigger cannot see, and HR
  changes are meaningless without the why ("moved to Ops" vs "moved to Ops because
  the Riyadh branch closed").
- Every mutating Server Action calls `writeAudit()` from `lib/hr/audit.ts`. No
  exceptions, no "this one's minor".
- `writeAudit()` **throws** if the audit write fails. An unaudited change is worse
  than a failed change. Do not catch and swallow it.
- Never mutate HR tables from a Client Component, from a route handler that bypasses
  `writeAudit()`, or by hand in the Supabase dashboard. If you must fix data manually,
  write the audit row manually too.

---

## Schema

```
persons          one human being
  └── employments      a period of employment (person may have 0..n, over time)
        └── assignments      effective-dated: where they sit + who they report to

departments      bilingual, self-referencing tree (parent_id)
job_titles       bilingual
audit_log        who / what / when / before / after / why
```

Key constraints:

- `assignments` — gist exclusion constraint: no two rows for the same `employment_id`
  may have overlapping `[valid_from, valid_to)` ranges.
- `employments` — partial unique index: at most one row per person with
  `termination_date IS NULL` (you cannot be currently employed twice).
- `departments.parent_id` — self-reference; guard against cycles in the app layer.

### Querying "as of" a date

This is the shape of almost every HR read. Learn it:

```sql
-- someone's assignment as it stood on a given date
select * from assignments
where employment_id = $1
  and valid_from <= $2
  and (valid_to is null or valid_to > $2);
```

`valid_to > $2`, not `>=` — the range is half-open.

---

## Conventions

**Access control.** RLS is enabled on every HR table with a single blanket policy:
any authenticated user may do anything. This is *not* multi-tenant RLS — it exists
because Supabase exposes `public` tables through PostgREST, and the publishable key
ships to the browser. Without RLS, anyone holding that key could read every national
ID in the company. One policy per table, no complexity. Do not remove it; do not
elaborate it into a role system until roles actually exist.

**Data flow.** Server Components read; Server Actions write. No client-side Supabase
queries against HR tables. Queries live in `lib/hr/*.ts`; mutations live in
`app/protected/*/actions.ts` and are marked `"use server"`.

**Multi-table writes.** Supabase JS has no client-side transaction. Employee creation
inserts `persons` → `employments` → `assignments` in that order, auditing each step.
A partial failure leaves a valid domain state (a person with no employment is legal
per Rule 3), so this is acceptable — but the action must report clearly what was
created before it failed.

**Validation.** Validate on the server in the action, always. Client-side validation
is a convenience, never the guard.

**IDs.** `uuid` primary keys, `gen_random_uuid()` default.

**Timestamps.** `timestamptz`, never bare `timestamp`. The company is in Riyadh
(UTC+3) but store UTC and format at the edge.

**Migrations.** Versioned SQL in `supabase/migrations/`, applied via the Supabase CLI
(`supabase db push`) or pasted into the dashboard SQL editor. Never edit a migration
that has already been applied — write a new one.

---

## Checklist before you commit

- [ ] No `tenant_id`, no role system, no employee-login plumbing
- [ ] No money in a float (and no money columns at all yet)
- [ ] Nothing that has a validity period was overwritten in place
- [ ] Nothing employment-shaped was added to `persons`
- [ ] Every new user-visible string is in **both** `en.json` and `ar.json`
- [ ] No physical-direction Tailwind classes (`ml-`, `pr-`, `text-left`, …)
- [ ] Every mutating action calls `writeAudit()`
- [ ] `npx tsc --noEmit` passes

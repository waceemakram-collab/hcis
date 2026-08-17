-- =============================================================================
-- 0001_hr_foundation.sql
-- HCIS — Expertise Wave. Internal, single-company. No tenant_id, no multi-tenant.
--
-- Creates: departments, job_titles, persons, employments, assignments, audit_log
--
-- Design rules enforced here (see CLAUDE.md):
--   Rule 2  HR records are effective-dated  -> assignments validity ranges + exclusion constraint
--   Rule 3  A person is not an employee     -> persons / employments / assignments split
--   Rule 4  Bilingual                       -> name_en / name_ar column pairs
--   Rule 5  Every data change is audited    -> audit_log
-- =============================================================================

-- Required for the exclusion constraint on assignments: lets us mix an equality
-- check (employment_id) with a range overlap check (&&) in one gist index.
create extension if not exists btree_gist;


-- -----------------------------------------------------------------------------
-- departments — bilingual, self-referencing tree
-- -----------------------------------------------------------------------------
create table if not exists departments (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null,
  name_ar     text,
  parent_id   uuid references departments (id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint departments_name_en_not_blank check (length(btrim(name_en)) > 0),
  constraint departments_not_own_parent    check (parent_id is null or parent_id <> id)
);

comment on table departments is
  'Org units. Self-referencing tree via parent_id. Deeper cycles (A->B->A) are guarded in the app layer.';

create index if not exists departments_parent_id_idx on departments (parent_id);


-- -----------------------------------------------------------------------------
-- job_titles — bilingual
-- -----------------------------------------------------------------------------
create table if not exists job_titles (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null,
  name_ar     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint job_titles_name_en_not_blank check (length(btrim(name_en)) > 0)
);


-- -----------------------------------------------------------------------------
-- persons — a human being.
--
-- Rule 3: this table describes a HUMAN, not an employee. Facts here survive
-- employment. Do NOT add department_id, job_title_id, hire_date, salary,
-- manager_id, login, role, or password to this table.
-- A person with zero employments is a valid record, not an error.
-- -----------------------------------------------------------------------------
create table if not exists persons (
  id             uuid primary key default gen_random_uuid(),
  first_name_en  text not null,
  last_name_en   text not null,
  first_name_ar  text,
  last_name_ar   text,
  email          text,
  phone          text,
  nationality    text,          -- ISO 3166-1 alpha-2, e.g. 'SA', 'PK', 'EG'
  national_id    text,          -- national ID / Iqama / residency number
  date_of_birth  date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint persons_first_name_en_not_blank check (length(btrim(first_name_en)) > 0),
  constraint persons_last_name_en_not_blank  check (length(btrim(last_name_en)) > 0),
  constraint persons_dob_sane                check (date_of_birth is null or date_of_birth < current_date)
);

comment on table persons is
  'A human being. NOT an employee. See CLAUDE.md rule 3.';

-- National ID is unique when present. Two people cannot share one.
create unique index if not exists persons_national_id_key
  on persons (national_id) where national_id is not null;

create index if not exists persons_last_name_en_idx on persons (last_name_en);


-- -----------------------------------------------------------------------------
-- employments — a PERIOD of being employed.
--
-- One person may have several of these over time (a leaver who is rehired).
-- termination_date is INCLUSIVE: it is the last working day. NULL = still employed.
-- -----------------------------------------------------------------------------
create table if not exists employments (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid not null references persons (id) on delete restrict,
  hire_date         date not null,
  termination_date  date,
  employment_type   text not null,
  status            text not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint employments_type_valid check (
    employment_type in ('full_time', 'part_time', 'contractor')
  ),
  constraint employments_status_valid check (
    status in ('active', 'on_leave', 'terminated')
  ),
  constraint employments_termination_after_hire check (
    termination_date is null or termination_date >= hire_date
  ),
  -- A terminated employment must have an end date, and vice versa.
  constraint employments_termination_matches_status check (
    (status = 'terminated' and termination_date is not null)
    or (status <> 'terminated' and termination_date is null)
  )
);

comment on column employments.termination_date is
  'Last working day, INCLUSIVE. NULL = still employed.';

-- You cannot be currently employed twice.
create unique index if not exists employments_one_active_per_person
  on employments (person_id) where termination_date is null;

create index if not exists employments_person_id_idx on employments (person_id);


-- -----------------------------------------------------------------------------
-- assignments — effective-dated placement: department, job title, manager.
--
-- Rule 2: to change any of these, CLOSE the current row (set valid_to) and
-- INSERT a new one. Never UPDATE department_id/job_title_id on an existing row —
-- that destroys history.
--
-- Validity is HALF-OPEN: [valid_from, valid_to). valid_to IS NULL = current.
-- -----------------------------------------------------------------------------
create table if not exists assignments (
  id                     uuid primary key default gen_random_uuid(),
  employment_id          uuid not null references employments (id) on delete restrict,
  department_id          uuid not null references departments (id) on delete restrict,
  job_title_id           uuid not null references job_titles (id) on delete restrict,
  manager_employment_id  uuid references employments (id) on delete restrict,
  valid_from             date not null,
  valid_to               date,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint assignments_valid_range check (
    valid_to is null or valid_to > valid_from
  ),
  constraint assignments_not_own_manager check (
    manager_employment_id is null or manager_employment_id <> employment_id
  )
);

comment on table assignments is
  'Effective-dated org placement. Half-open range [valid_from, valid_to). NULL valid_to = current.';

-- The core integrity guarantee: one employment cannot hold two contradictory
-- assignments on the same day. If an insert trips this, the code tried to write
-- impossible history — fix the code, do not drop the constraint.
alter table assignments drop constraint if exists assignments_no_overlap;
alter table assignments add constraint assignments_no_overlap
  exclude using gist (
    employment_id with =,
    daterange(valid_from, valid_to, '[)') with &&
  );

create index if not exists assignments_employment_id_idx  on assignments (employment_id);
create index if not exists assignments_department_id_idx   on assignments (department_id);
create index if not exists assignments_job_title_id_idx    on assignments (job_title_id);
create index if not exists assignments_manager_idx         on assignments (manager_employment_id);
-- Fast "current assignment" lookups.
create index if not exists assignments_current_idx
  on assignments (employment_id) where valid_to is null;


-- -----------------------------------------------------------------------------
-- audit_log — who changed what, when, before, after, and WHY.
--
-- Rule 5. Written by the application layer (Server Actions), never by triggers:
-- a trigger cannot know the business reason for a change, and in HR the reason
-- is half the value of the record.
-- -----------------------------------------------------------------------------
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  table_name  text not null,
  record_id   uuid not null,
  action      text not null,
  changed_by  uuid references auth.users (id) on delete set null,
  changed_at  timestamptz not null default now(),
  before      jsonb,
  after       jsonb,
  reason      text,

  constraint audit_log_action_valid check (action in ('insert', 'update', 'delete'))
);

comment on column audit_log.reason is
  'Business reason supplied by the operator. The "why" a DB trigger could never capture.';

create index if not exists audit_log_record_idx     on audit_log (table_name, record_id, changed_at desc);
create index if not exists audit_log_changed_at_idx on audit_log (changed_at desc);
create index if not exists audit_log_changed_by_idx on audit_log (changed_by);


-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['departments', 'job_titles', 'persons', 'employments', 'assignments']
  loop
    execute format('drop trigger if exists %I on %I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on %I for each row execute function set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;


-- =============================================================================
-- Access control
--
-- This is NOT multi-tenant RLS. It exists because Supabase exposes every table
-- in the `public` schema through PostgREST, and the publishable key ships to the
-- browser. With RLS off, anyone holding that key could read every national ID in
-- the company. One blanket policy per table: you must be logged in. That is all.
--
-- The current phase is admin-only, so "authenticated" == "HR admin". When roles
-- actually exist, elaborate these policies then — not before.
-- =============================================================================
alter table departments enable row level security;
alter table job_titles  enable row level security;
alter table persons     enable row level security;
alter table employments enable row level security;
alter table assignments enable row level security;
alter table audit_log   enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['departments', 'job_titles', 'persons', 'employments', 'assignments']
  loop
    execute format('drop policy if exists %I on %I', t || '_authenticated_all', t);
    execute format(
      'create policy %I on %I for all to authenticated using (true) with check (true)',
      t || '_authenticated_all', t
    );
  end loop;
end;
$$;

-- The audit log is append-only. Authenticated users may read and insert.
-- There is deliberately NO update or delete policy: with RLS on, an operation
-- with no matching policy is denied. History cannot be rewritten through the API.
drop policy if exists audit_log_authenticated_select on audit_log;
create policy audit_log_authenticated_select on audit_log
  for select to authenticated using (true);

drop policy if exists audit_log_authenticated_insert on audit_log;
create policy audit_log_authenticated_insert on audit_log
  for insert to authenticated with check (true);


-- =============================================================================
-- Tell PostgREST to re-read the schema.
--
-- Supabase serves the REST API through PostgREST, which keeps an in-memory
-- cache of tables and foreign keys. Until it reloads, queries that embed a
-- related table fail with "Could not find a relationship between X and Y in the
-- schema cache" even though the constraint exists. Supabase normally reloads on
-- its own, but not always immediately after a migration — so ask explicitly.
-- =============================================================================
notify pgrst, 'reload schema';

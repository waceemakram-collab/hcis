-- =============================================================================
-- 0001_initial_data.sql  —  SEED, not a migration.
--
-- Run ONCE against a fresh production database, after 0001–0003 have applied.
-- Edit the names below to match Expertise Wave before running it.
--
-- WHY THE AUDIT INSERTS ARE HERE
-- CLAUDE.md rule 5 says every data change is audited, and the app enforces that
-- by routing all writes through writeAudit(). Seeding straight from SQL bypasses
-- the application entirely, so these rows would be the only unaudited data in
-- the system — the exact gap an auditor asks about first. Each insert therefore
-- writes its own audit row, with changed_by NULL (no operator was logged in)
-- and a reason that says plainly where the row came from.
--
-- Re-running this file is safe: the ON CONFLICT guards make it a no-op the
-- second time rather than creating duplicates.
-- =============================================================================

begin;

-- Needed so `on conflict (name_en)` has something to conflict on. Harmless if
-- you later want two departments with the same English name — drop the index
-- and this file's guards together.
create unique index if not exists departments_name_en_key on departments (name_en);
create unique index if not exists job_titles_name_en_key  on job_titles  (name_en);

-- -----------------------------------------------------------------------------
-- Departments.  EDIT THIS LIST.
-- -----------------------------------------------------------------------------
with incoming (name_en, name_ar) as (
  values
    ('Human Resources', 'الموارد البشرية'),
    ('Finance',         'المالية'),
    ('Operations',      'العمليات'),
    ('Sales',           'المبيعات'),
    ('Engineering',     'الهندسة')
),
inserted as (
  insert into departments (name_en, name_ar)
  select name_en, name_ar from incoming
  on conflict (name_en) do nothing
  returning *
)
insert into audit_log (table_name, record_id, action, changed_by, after, reason)
select 'departments', id, 'insert', null, to_jsonb(inserted), 'Initial data load (seed script)'
from inserted;

-- -----------------------------------------------------------------------------
-- Job titles.  EDIT THIS LIST.
-- -----------------------------------------------------------------------------
with incoming (name_en, name_ar) as (
  values
    ('HR Manager',           'مدير الموارد البشرية'),
    ('HR Officer',           'أخصائي موارد بشرية'),
    ('Accountant',           'محاسب'),
    ('Operations Manager',   'مدير العمليات'),
    ('Software Engineer',    'مهندس برمجيات'),
    ('Sales Representative', 'مندوب مبيعات')
),
inserted as (
  insert into job_titles (name_en, name_ar)
  select name_en, name_ar from incoming
  on conflict (name_en) do nothing
  returning *
)
insert into audit_log (table_name, record_id, action, changed_by, after, reason)
select 'job_titles', id, 'insert', null, to_jsonb(inserted), 'Initial data load (seed script)'
from inserted;

commit;

-- -----------------------------------------------------------------------------
-- Deliberately NOT seeded here:
--
--   * The admin user. Create it through Supabase Auth (Users -> invite), not
--     SQL. Hand-inserting into auth.users skips password hashing and identity
--     rows and produces an account that cannot sign in.
--
--   * Employees. Create the first few through the app so they pass validation,
--     get their first assignment, and land in the audit log with you as the
--     operator. Bulk import is a separate job worth doing properly.
-- -----------------------------------------------------------------------------

-- Sanity check — run this after the seed:
--   select 'departments' t, count(*) from departments
--   union all select 'job_titles', count(*) from job_titles
--   union all select 'audit_log',  count(*) from audit_log;

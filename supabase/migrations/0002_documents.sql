-- =============================================================================
-- 0002_documents.sql
-- Document expiry tracking: passports, residency permits (Iqama), labour cards.
--
-- Attached to PERSON, not employment (CLAUDE.md rule 3). A passport belongs to
-- a human being; it survives leaving and being rehired. Nothing about a document
-- depends on a period of employment.
--
-- `document_type` is a CHECK-constrained text column rather than an enum, and
-- the human-readable labels (including Arabic) live in the i18n dictionary.
-- Adding a type later is one line here plus two dictionary entries — no enum
-- surgery, no schema redesign.
-- =============================================================================

create table if not exists documents (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid not null references persons (id) on delete restrict,
  document_type    text not null,
  description      text,          -- free label; mainly for document_type = 'other'
  document_number  text,
  issuing_country  text,          -- ISO 3166-1 alpha-2
  issue_date       date,
  expiry_date      date not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint documents_type_valid check (
    document_type in ('passport', 'residency_permit', 'labour_card', 'other')
  ),
  constraint documents_expiry_after_issue check (
    issue_date is null or expiry_date >= issue_date
  )
);

comment on table documents is
  'Identity and work documents. Belongs to the PERSON, not an employment.';
comment on column documents.expiry_date is
  'Required — a document with no expiry is not something this tracker can act on.';

-- Deliberately NO unique constraint on (person_id, document_type): dual
-- nationality means two passports, and keeping superseded documents as history
-- is a change we may want later. Nothing here blocks it.

create index if not exists documents_person_id_idx on documents (person_id);
create index if not exists documents_expiry_date_idx on documents (expiry_date);
create index if not exists documents_type_idx on documents (document_type);

drop trigger if exists documents_set_updated_at on documents;
create trigger documents_set_updated_at
  before update on documents
  for each row execute function set_updated_at();

-- Same blanket policy as every other HR table: you must be logged in. Not
-- multi-tenant RLS — see the note in 0001.
alter table documents enable row level security;

drop policy if exists documents_authenticated_all on documents;
create policy documents_authenticated_all on documents
  for all to authenticated using (true) with check (true);

-- PostgREST caches the schema; without this the new table and its relationship
-- to `persons` stay invisible to the API until it happens to reload.
notify pgrst, 'reload schema';

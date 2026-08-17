-- =============================================================================
-- 0003_termination.sql
-- Offboarding: why someone left, and any notes about it.
--
-- `termination_date` and the status pairing already exist from 0001. This adds
-- the reason and notes, and holds the reason to the same rule as the date: a
-- terminated employment must carry one, a live employment must not. That second
-- half is what makes "undo termination" safe — it cannot leave a stale reason
-- attached to someone who is back at work.
-- =============================================================================

alter table employments add column if not exists termination_reason text;
alter table employments add column if not exists termination_notes  text;

comment on column employments.termination_reason is
  'Why the employment ended. Required when status = terminated, forbidden otherwise.';

alter table employments drop constraint if exists employments_termination_reason_valid;
alter table employments add constraint employments_termination_reason_valid check (
  termination_reason is null
  or termination_reason in ('resignation', 'end_of_contract', 'dismissal', 'death', 'other')
);

alter table employments drop constraint if exists employments_termination_reason_matches_status;
alter table employments add constraint employments_termination_reason_matches_status check (
  (status = 'terminated' and termination_reason is not null)
  or (status <> 'terminated' and termination_reason is null)
);

-- Leavers are filtered constantly once this feature exists: the employee list,
-- the document dashboard, and the rehire check all ask "is anyone still employed".
create index if not exists employments_terminated_idx
  on employments (person_id, termination_date);

notify pgrst, 'reload schema';

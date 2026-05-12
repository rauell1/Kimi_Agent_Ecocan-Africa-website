-- ============================================================================
-- KYPW SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This creates all tables, RLS policies, and seed data for the KYPW platform.
-- ============================================================================

-- ============================================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  avatar_url    text,
  role          text not null default 'viewer'
                check (role in ('admin', 'coordinator', 'field_officer', 'viewer')),
  organization  text,
  phone         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 2. EVENTS
-- ============================================================================
create table public.events (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text unique,
  description    text,
  event_type     text not null default 'workshop',
  status         text not null default 'draft'
                 check (status in ('draft', 'planned', 'published', 'ongoing', 'completed')),
  start_at       timestamptz,
  end_at         timestamptz,
  region         text,
  location_name  text,
  location_type  text default 'physical',
  cover_image_url text,
  is_public      boolean default false,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================================
-- 3. PARTICIPANTS
-- ============================================================================
create table public.participants (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  full_name      text not null,
  email          text,
  phone          text,
  organization   text,
  region         text,
  gender         text,
  age_group      text,
  role_at_event  text,
  attended       boolean default false,
  created_at     timestamptz default now()
);

-- ============================================================================
-- 4. EVENT DOCUMENTATION
-- ============================================================================
create table public.event_documentation (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  type           text default 'photo',
  title          text not null,
  description    text,
  file_url       text,
  external_url   text,
  uploaded_by    uuid references public.profiles(id),
  created_at     timestamptz default now()
);

-- ============================================================================
-- 5. EVENT METRICS
-- ============================================================================
create table public.event_metrics (
  id                    uuid primary key default gen_random_uuid(),
  event_id              uuid not null references public.events(id) on delete cascade unique,
  participants_total    int default 0,
  youth_count           int default 0,
  women_count           int default 0,
  counties_reached      int default 0,
  water_points_assessed int default 0,
  communities_engaged   int default 0,
  partnerships_formed   int default 0,
  budget_spent          numeric(12,2) default 0,
  currency              text default 'KES',
  narrative_summary     text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================================
-- 6. EVENT REPORTS
-- ============================================================================
create table public.event_reports (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  content    text not null,
  model      text default 'manual',
  created_at timestamptz default now()
);

-- ============================================================================
-- 7. DOCUMENTATION REQUIREMENTS (CHECKLIST)
-- ============================================================================
create table public.doc_requirements (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  doc_type   text not null,
  label      text not null,
  hint       text,
  required   boolean default true,
  sort_order int default 0
);

-- ============================================================================
-- 8. CONTACT MESSAGES
-- ============================================================================
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- ============================================================================
-- 9. AUDIT LOGS
-- ============================================================================
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references public.events(id) on delete set null,
  user_id     uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- ============================================================================
-- 10. FEEDBACK
-- ============================================================================
create table public.feedback (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  rating     int check (rating >= 1 and rating <= 5),
  comment    text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================================================
-- 11. PUBLIC CONTENT (news, pages)
-- ============================================================================
create table public.public_content (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text,
  type        text default 'page',
  is_published boolean default false,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================================
-- 12. MEDIA (file storage references)
-- ============================================================================
create table public.media (
  id         uuid primary key default gen_random_uuid(),
  file_url   text not null,
  file_name  text,
  file_size  bigint,
  mime_type  text,
  event_id   uuid references public.events(id) on delete set null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index idx_participants_event_id on public.participants(event_id);
create index idx_participants_email on public.participants(email);
create index idx_docs_event_id on public.event_documentation(event_id);
create index idx_reports_event_id on public.event_reports(event_id);
create index idx_requirements_event_id on public.doc_requirements(event_id);
create index idx_feedback_event_id on public.feedback(event_id);
create index idx_audit_event_id on public.audit_logs(event_id);
create index idx_audit_user_id on public.audit_logs(user_id);
create index idx_audit_created on public.audit_logs(created_at);
create index idx_media_event_id on public.media(event_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.event_documentation enable row level security;
alter table public.event_metrics enable row level security;
alter table public.event_reports enable row level security;
alter table public.doc_requirements enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;
alter table public.feedback enable row level security;
alter table public.public_content enable row level security;
alter table public.media enable row level security;

-- Profiles: users can read/write their own
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Events: public read for published, full CRUD for authenticated
create policy "Public can view published events"
  on public.events for select
  using (is_public = true);

create policy "Authenticated users can view all events"
  on public.events for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.role() = 'authenticated');

create policy "Event creators can update their events"
  on public.events for update
  using (auth.uid() = created_by or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coordinator')
  ));

create policy "Admins can delete events"
  on public.events for delete
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Participants: authenticated CRUD
create policy "Authenticated users can manage participants"
  on public.participants for all
  using (auth.role() = 'authenticated');

-- Documentation: authenticated CRUD
create policy "Authenticated users can manage documentation"
  on public.event_documentation for all
  using (auth.role() = 'authenticated');

-- Metrics: authenticated read/write
create policy "Authenticated users can manage metrics"
  on public.event_metrics for all
  using (auth.role() = 'authenticated');

-- Reports: authenticated CRUD
create policy "Authenticated users can manage reports"
  on public.event_reports for all
  using (auth.role() = 'authenticated');

-- Doc Requirements: authenticated CRUD
create policy "Authenticated users can manage requirements"
  on public.doc_requirements for all
  using (auth.role() = 'authenticated');

-- Contact Messages: anyone can insert, admins can read
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Admins can view contact messages"
  on public.contact_messages for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can update contact messages"
  on public.contact_messages for update
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Audit Logs: authenticated can read, system writes
create policy "Authenticated users can read audit logs"
  on public.audit_logs for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create audit logs"
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

-- Feedback: anyone can read, authenticated can write
create policy "Anyone can view feedback"
  on public.feedback for select
  using (true);

create policy "Authenticated users can create feedback"
  on public.feedback for insert
  with check (auth.role() = 'authenticated');

-- Public content: published visible to all
create policy "Anyone can view published content"
  on public.public_content for select
  using (is_published = true);

create policy "Admins can manage public content"
  on public.public_content for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coordinator')
  ));

-- Media: authenticated can upload, anyone can view
create policy "Anyone can view media"
  on public.media for select
  using (true);

create policy "Authenticated users can upload media"
  on public.media for insert
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATED_AT TRIGGER (auto-update timestamp)
-- ============================================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute procedure public.update_updated_at();

create trigger event_metrics_updated_at
  before update on public.event_metrics
  for each row execute procedure public.update_updated_at();

create trigger public_content_updated_at
  before update on public.public_content
  for each row execute procedure public.update_updated_at();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Run this in the Supabase dashboard under Storage, or use the API:
-- insert into storage.buckets (id, name, public) values ('event-media', 'event-media', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('reports', 'reports', false);
--
-- Storage policies:
-- create policy "Authenticated can upload event media" on storage.objects
--   for insert with check (bucket_id = 'event-media' and auth.role() = 'authenticated');
-- create policy "Anyone can view event media" on storage.objects
--   for select using (bucket_id = 'event-media');
-- create policy "Users can upload avatars" on storage.objects
--   for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
-- create policy "Anyone can view avatars" on storage.objects
--   for select using (bucket_id = 'avatars');

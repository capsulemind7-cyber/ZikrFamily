-- ============================================================
-- ZikrFamily — 002: XP, Streak, Medallar va Mukofotlar
-- Buni Supabase SQL Editor'da 001_init.sql'dan KEYIN ishga tushiring
-- ============================================================

-- children jadvaliga yangi ustunlar
alter table children add column if not exists total_xp int not null default 0;
alter table children add column if not exists current_streak_days int not null default 0;
alter table children add column if not exists longest_streak_days int not null default 0;
alter table children add column if not exists last_streak_date date;

-- Farzand XP/streak'ini yangilashi uchun (child auth.users orqali kirmagani sababli
-- bu ustunlarni ham public yangilashga ruxsat beramiz, xuddi daily_logs kabi)
create policy "Hamma children XP/streak yangilashi mumkin"
  on children for update
  using (true);

-- ---------- BADGES ----------
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  badge_type text not null check (badge_type in ('bronze_7', 'silver_30', 'gold_100')),
  earned_at timestamptz not null default now(),
  unique (child_id, badge_type)
);

alter table badges enable row level security;

create policy "Hamma badges'ni o'qiy oladi"
  on badges for select
  using (true);

create policy "Hamma badge qo'sha oladi"
  on badges for insert
  with check (true);

-- ---------- REWARDS ----------
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  title text not null,
  threshold_type text not null check (threshold_type in ('total_zikr_count', 'streak_days')),
  threshold_value int not null,
  achieved_at timestamptz,
  claimed boolean not null default false,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table rewards enable row level security;

create policy "Hamma rewards'ni o'qiy oladi"
  on rewards for select
  using (true);

create policy "Ota-ona mukofot qo'shadi"
  on rewards for insert
  with check (family_id in (select id from families where parent_user_id = auth.uid()));

create policy "Rewards yangilanishi mumkin (achieved/claimed)"
  on rewards for update
  using (true);

create policy "Ota-ona mukofotni o'chiradi"
  on rewards for delete
  using (family_id in (select id from families where parent_user_id = auth.uid()));

-- ============================================================
-- ZikrFamily — 003: Oilaviy Chat (faqat matnli)
-- Buni Supabase SQL Editor'da 001 va 002'dan KEYIN ishga tushiring
-- ============================================================

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  sender_type text not null check (sender_type in ('parent', 'child')),
  message_text text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table messages enable row level security;

-- Farzandlar auth.users orqali kirmagani uchun, daily_logs bilan bir xil
-- pragmatik yondashuv: o'qish/yozish public (faqat PIN frontendda himoya qiladi)
create policy "Hamma xabarlarni o'qiy oladi"
  on messages for select
  using (true);

create policy "Hamma xabar yoza oladi"
  on messages for insert
  with check (true);

create policy "Hamma xabarni o'qilgan deb belgilay oladi"
  on messages for update
  using (true);

-- Realtime yoqish (Supabase'da odatda avtomatik yoqilgan, lekin xavfsizlik uchun)
alter publication supabase_realtime add table messages;

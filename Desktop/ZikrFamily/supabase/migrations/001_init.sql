-- ============================================================
-- ZikrFamily — boshlang'ich ma'lumotlar bazasi sxemasi
-- Buni Supabase Dashboard -> SQL Editor ga joylab ishga tushiring
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- FAMILIES ----------
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  family_name text not null default 'Oilam',
  created_at timestamptz not null default now()
);

alter table families enable row level security;

create policy "Ota-ona faqat o'z oilasini ko'radi"
  on families for select
  using (auth.uid() = parent_user_id);

create policy "Ota-ona o'z oilasini yaratadi"
  on families for insert
  with check (auth.uid() = parent_user_id);

create policy "Ota-ona o'z oilasini tahrirlaydi"
  on families for update
  using (auth.uid() = parent_user_id);

-- ---------- CHILDREN ----------
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  avatar_emoji text,
  pin_code text not null,
  birth_year int,
  created_at timestamptz not null default now()
);

alter table children enable row level security;

create policy "Ota-ona faqat o'z farzandlarini ko'radi"
  on children for select
  using (family_id in (select id from families where parent_user_id = auth.uid()));

create policy "Ota-ona farzand qo'shadi"
  on children for insert
  with check (family_id in (select id from families where parent_user_id = auth.uid()));

create policy "Ota-ona farzandni tahrirlaydi"
  on children for update
  using (family_id in (select id from families where parent_user_id = auth.uid()));

create policy "Ota-ona farzandni o'chiradi"
  on children for delete
  using (family_id in (select id from families where parent_user_id = auth.uid()));

-- Farzand PIN orqali kirganda o'zining yozuvini o'qiy olishi uchun
-- (anon key orqali public ravishda o'qish - PIN tekshiruvi frontendda amalga oshadi,
--  chunki farzandlar auth.users orqali kirmaydi)
create policy "Hamma children'ni public o'qiy oladi (PIN tekshirish uchun)"
  on children for select
  using (true);

-- ---------- ZIKRS (umumiy katalog) ----------
create table if not exists zikrs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  arabic_text text,
  transliteration text not null,
  translation text,
  category text not null default 'umumiy' check (category in ('tongi', 'kechki', 'umumiy')),
  default_count int not null default 33,
  is_custom boolean not null default false,
  created_by_family_id uuid references families(id) on delete set null
);

alter table zikrs enable row level security;

create policy "Hamma zikrlarni o'qiy oladi"
  on zikrs for select
  using (true);

create policy "Ota-ona faqat custom zikr qo'sha oladi"
  on zikrs for insert
  with check (
    is_custom = true
    and created_by_family_id in (select id from families where parent_user_id = auth.uid())
  );

create policy "Ota-ona faqat o'zining custom zikrini tahrirlaydi"
  on zikrs for update
  using (
    is_custom = true
    and created_by_family_id in (select id from families where parent_user_id = auth.uid())
  );

create policy "Ota-ona faqat o'zining custom zikrini o'chiradi"
  on zikrs for delete
  using (
    is_custom = true
    and created_by_family_id in (select id from families where parent_user_id = auth.uid())
  );

-- ---------- ASSIGNMENTS ----------
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  zikr_id uuid not null references zikrs(id) on delete cascade,
  daily_target int not null default 33,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table assignments enable row level security;

create policy "Ota-ona faqat o'z farzandi tayinlovlarini ko'radi"
  on assignments for select
  using (
    child_id in (
      select c.id from children c
      join families f on f.id = c.family_id
      where f.parent_user_id = auth.uid()
    )
  );

create policy "Hamma assignments'ni public o'qiy oladi (farzand kirishi uchun)"
  on assignments for select
  using (true);

create policy "Ota-ona tayinlaydi"
  on assignments for insert
  with check (
    child_id in (
      select c.id from children c
      join families f on f.id = c.family_id
      where f.parent_user_id = auth.uid()
    )
  );

create policy "Ota-ona tayinlovni tahrirlaydi"
  on assignments for update
  using (
    child_id in (
      select c.id from children c
      join families f on f.id = c.family_id
      where f.parent_user_id = auth.uid()
    )
  );

create policy "Ota-ona tayinlovni o'chiradi"
  on assignments for delete
  using (
    child_id in (
      select c.id from children c
      join families f on f.id = c.family_id
      where f.parent_user_id = auth.uid()
    )
  );

-- ---------- DAILY LOGS ----------
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  log_date date not null default current_date,
  count_done int not null default 0,
  completed boolean not null default false,
  parent_confirmed boolean not null default false,
  confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (assignment_id, log_date)
);

alter table daily_logs enable row level security;

create policy "Hamma daily_logs bilan ishlay oladi (farzand PIN orqali kiradi)"
  on daily_logs for select
  using (true);

create policy "Hamma daily_logs qo'sha oladi"
  on daily_logs for insert
  with check (true);

create policy "Hamma daily_logs yangilay oladi"
  on daily_logs for update
  using (true);

-- ============================================================
-- Boshlang'ich 15 ta zikr
-- ============================================================
insert into zikrs (title, arabic_text, transliteration, translation, category, default_count, is_custom)
values
  ('La ilaha illalloh', 'لَا إِلَٰهَ إِلَّا اللَّٰهُ', 'Laa ilaaha illalloh', 'Allohdan o''zga iloh yo''q', 'umumiy', 33, false),
  ('Subhanalloh', 'سُبْحَانَ اللَّٰهِ', 'Subhaanalloh', 'Alloh nuqsonlardan pok', 'tongi', 33, false),
  ('Alhamdulillah', 'الْحَمْدُ لِلَّٰهِ', 'Alhamdu lillaah', 'Barcha hamd-u sanolar Allohga xosdir', 'tongi', 33, false),
  ('Allohu akbar', 'اللَّٰهُ أَكْبَرُ', 'Allohu akbar', 'Alloh eng ulug''dir', 'tongi', 33, false),
  ('Astag''firulloh', 'أَسْتَغْفِرُ اللَّٰهَ', 'Astag''firulloh', 'Allohdan mag''firat so''rayman', 'umumiy', 100, false),
  ('Salovat', null, 'Allohumma solli ''alaa Muhammadin va ''alaa aali Muhammad', 'Muhammad va oilasiga salovat', 'umumiy', 33, false),
  ('Sayyidul Istig''for', null, 'Alloohumma, anta Robbii, laa ilaaha illaa anta, xolaqtanii, va ana ''abduka', 'Istig''forning eng afzali', 'kechki', 1, false),
  ('Tungi zikr', null, 'Amsaynaa va amsal mulku lillaah, valhamdu lillaah, laa ilaaha illalloh', 'Kechqurun o''qiladigan zikr', 'kechki', 1, false),
  ('Subhanallohi va bihamdihi', null, 'Subhaanallohi va bihamdihi', 'Alloh pok va hamdga loyiq', 'kechki', 100, false),
  ('Ixlos surasi', 'قُلْ هُوَ اللَّٰهُ أَحَدٌ', 'Qul huvalloohu ahad', 'Aytgin: U — Alloh, yagonadir', 'kechki', 3, false),
  ('Falaq surasi', null, 'Qul a''uuzu birobbil falaq', 'Tong Robbisiga sig''inaman', 'kechki', 1, false),
  ('Nas surasi', null, 'Qul a''uuzu birobbin naas', 'Odamlar Robbisiga sig''inaman', 'kechki', 1, false),
  ('Ayatul Kursiy', null, 'Allohu laa ilaaha illaa huval hayyul qoyyuum', 'Oyat ul-Kursiy', 'kechki', 1, false),
  ('Falastin uchun duo', null, 'Alloohumma aslih ahvaalal muslimiyna fii Filistiin', 'Falastin musulmonlari uchun duo', 'umumiy', 33, false),
  ('La havla vala quvvata illa billah', null, 'Laa havla valaa quvvata illaa billaah', 'Kuch-quvvat faqat Allohdandir', 'umumiy', 33, false)
on conflict do nothing;

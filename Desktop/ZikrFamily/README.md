# ZikrFamily

Oilaviy zikr kuzatuv ilovasi (PWA). Ota-ona farzandlarga kunlik zikr topshiriqlari beradi, farzand bajaradi, ota-ona tasdiqlaydi.

## 1. Supabase sozlash

1. https://supabase.com/dashboard — yangi loyiha yarating (bepul tarif yetarli).
2. Chap menyudan **SQL Editor** ni oching.
3. `supabase/migrations/001_init.sql` faylining butun tarkibini nusxalab, SQL Editor'ga joylab, **Run** tugmasini bosing.
4. Chap menyudan **Project Settings → API** ga o'ting, `Project URL` va `anon public` kalitni nusxalang.

## 2. Loyihani mahalliy ishga tushirish

```bash
npm install
cp .env.example .env
```

`.env` faylini oching va Supabase'dan olgan qiymatlarni joylashtiring:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Keyin ishga tushiring:

```bash
npm run dev
```

Brauzerda `http://localhost:5173` manzilini oching.

## 3. Birinchi marta foydalanish

1. "Men ota-onaman" → "Ro'yxatdan o'ting" → email/parol bilan hisob yarating.
2. Admin panelda **Farzandlar** bo'limidan farzand qo'shing (ism, avatar, 4 xonali PIN avtomatik yaratiladi, xohlasangiz o'zgartiring).
3. Farzand ustiga bosib, unga kerakli zikrlarni tayinlang (kunlik maqsad soni bilan).
4. Bosh sahifaga qaytib "Men farzandman" → farzandni tanlang → PIN kiriting.
5. Farzand endi zikrlarini bajarishi mumkin, ota-ona **Hisobotlar** bo'limidan tasdiqlaydi.

## 4. GitHub + Vercel'ga deploy qilish

```bash
git init
git add .
git commit -m "ZikrFamily boshlang'ich versiya"
git branch -M main
git remote add origin <GITHUB_REPO_URL>
git push -u origin main
```

Vercel'da:
1. "New Project" → GitHub repo'ni tanlang.
2. **Environment Variables** bo'limiga `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY`ni qo'shing (xuddi `.env` dagidek).
3. Deploy qiling.

## 5. Hozircha mavjud bo'lgan imkoniyatlar

- Ota-ona ro'yxatdan o'tishi/kirishi (Supabase Auth)
- Farzand qo'shish, PIN bilan kirish
- Zikr katalogi (15 ta tayyor zikr) + o'zingiz yangi zikr qo'shish
- Farzandga zikr tayinlash, kunlik maqsad belgilash
- Farzand ekrani: hisoblagich tugmasi (+1) yoki qo'lda son kiritish, "Barchasi/Tongi/Kechki" filtri
- Admin Dashboard: har bir farzandning bugungi foizi
- Hisobotlar: bajarilgan zikrlarni "Tasdiqlash"
- PWA (o'rnatiladigan ilova, offline-ready asos)

## 6. Keyingi bosqichda qo'shiladigan imkoniyatlar

Quyidagilar hali kodlashtirilmagan — alohida so'rov bilan qo'shib boriladi:
- Oilaviy chat (ota-ona ↔ farzand)
- XP ball, streak, medallar, haftalik reyting, mukofotlar
- Lokatsiya (check-in uslubida)
- Bildirishnoma eslatmalari
- Kalendar/tarix ko'rinishi (oxirgi 30 kun)

## Muammo yuzaga kelsa

Xatolik matnini (screenshot yoki nusxa) Claude'ga yuboring — birga hal qilamiz.

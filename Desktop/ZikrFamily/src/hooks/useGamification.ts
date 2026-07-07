import { supabase, todayISODate } from '../lib/supabase';
import { Child, BadgeType, Reward } from '../types';

const BADGE_THRESHOLDS: { days: number; type: BadgeType }[] = [
  { days: 7, type: 'bronze_7' },
  { days: 30, type: 'silver_30' },
  { days: 100, type: 'gold_100' },
];

/** Farzandning joriy ma'lumotini qaytadan o'qiydi. */
async function getChild(childId: string): Promise<Child | null> {
  const { data } = await supabase.from('children').select('*').eq('id', childId).single();
  return (data as Child) ?? null;
}

/** Bosilgan/kiritilgan har bir zikr uchun XP qo'shadi (1 dona = 1 XP). Faqat musbat o'sishda. */
export async function addXp(childId: string, delta: number) {
  if (delta <= 0) return;
  const child = await getChild(childId);
  if (!child) return;
  await supabase
    .from('children')
    .update({ total_xp: child.total_xp + delta })
    .eq('id', childId);
}

function isoYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

/**
 * Farzandning bugungi barcha faol tayinlovlari to'liq bajarilganini tekshiradi.
 * Agar bugun uchun birinchi marta to'liq bajarilgan bo'lsa, streak +1 qiladi.
 * Agar kecha streak yangilanmagan bo'lsa (kun o'tkazib yuborilgan), streak 0 ga tushadi.
 */
export async function evaluateStreak(childId: string): Promise<{
  newBadges: BadgeType[];
  streak: number;
}> {
  const child = await getChild(childId);
  if (!child) return { newBadges: [], streak: 0 };

  const today = todayISODate();
  if (child.last_streak_date === today) {
    return { newBadges: [], streak: child.current_streak_days };
  }

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id')
    .eq('child_id', childId)
    .eq('active', true);

  const assignmentIds = (assignments ?? []).map((a: any) => a.id);
  if (assignmentIds.length === 0) return { newBadges: [], streak: child.current_streak_days };

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('assignment_id, completed')
    .eq('log_date', today)
    .in('assignment_id', assignmentIds);

  const allCompleted =
    (logs ?? []).length === assignmentIds.length && (logs ?? []).every((l: any) => l.completed);

  if (!allCompleted) return { newBadges: [], streak: child.current_streak_days };

  // Streak uzilmaganmi tekshirish: kecha yangilangan bo'lishi kerak, aks holda 1 dan boshlanadi
  const continued = child.last_streak_date === isoYesterday();
  const newStreak = continued ? child.current_streak_days + 1 : 1;
  const newLongest = Math.max(child.longest_streak_days, newStreak);

  await supabase
    .from('children')
    .update({
      current_streak_days: newStreak,
      longest_streak_days: newLongest,
      last_streak_date: today,
    })
    .eq('id', childId);

  const newBadges: BadgeType[] = [];
  for (const b of BADGE_THRESHOLDS) {
    if (newStreak === b.days) {
      const { data: existing } = await supabase
        .from('badges')
        .select('id')
        .eq('child_id', childId)
        .eq('badge_type', b.type)
        .maybeSingle();
      if (!existing) {
        await supabase.from('badges').insert({ child_id: childId, badge_type: b.type });
        newBadges.push(b.type);
      }
    }
  }

  await checkRewards(childId, newStreak, child.total_xp);

  return { newBadges, streak: newStreak };
}

/** Agar bugun ochilganda kecha streak yangilanmagan bo'lsa, streakni 0 ga tushiradi. */
export async function resetStreakIfMissed(childId: string) {
  const child = await getChild(childId);
  if (!child) return;
  const today = todayISODate();
  if (child.last_streak_date && child.last_streak_date !== today && child.last_streak_date !== isoYesterday()) {
    if (child.current_streak_days !== 0) {
      await supabase.from('children').update({ current_streak_days: 0 }).eq('id', childId);
    }
  }
}

/** Mukofot shartlari bajarilganda achieved_at'ni belgilaydi. */
export async function checkRewards(childId: string, streakDays: number, totalXp: number) {
  const { data: rewardsData } = await supabase
    .from('rewards')
    .select('*')
    .is('achieved_at', null)
    .or(`child_id.eq.${childId},child_id.is.null`);

  const rewards = (rewardsData as Reward[]) ?? [];
  for (const r of rewards) {
    const reached =
      (r.threshold_type === 'total_zikr_count' && totalXp >= r.threshold_value) ||
      (r.threshold_type === 'streak_days' && streakDays >= r.threshold_value);
    if (reached) {
      await supabase
        .from('rewards')
        .update({ achieved_at: new Date().toISOString() })
        .eq('id', r.id);
    }
  }
}

export async function markRewardClaimed(rewardId: string) {
  await supabase
    .from('rewards')
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq('id', rewardId);
}

export function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Yak, 1=Dush...
  const diff = day === 0 ? 6 : day - 1; // Dushanbadan boshlanadi
  d.setDate(d.getDate() - diff);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

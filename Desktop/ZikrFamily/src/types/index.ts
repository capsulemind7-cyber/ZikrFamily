export type Category = 'tongi' | 'kechki' | 'umumiy';

export interface Family {
  id: string;
  parent_user_id: string;
  family_name: string;
  created_at: string;
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  avatar_emoji: string | null;
  pin_code: string;
  birth_year: number | null;
  created_at: string;
  total_xp: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_streak_date: string | null;
}

export type BadgeType = 'bronze_7' | 'silver_30' | 'gold_100';

export interface Badge {
  id: string;
  child_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export type RewardThresholdType = 'total_zikr_count' | 'streak_days';

export interface Reward {
  id: string;
  family_id: string;
  child_id: string | null;
  title: string;
  threshold_type: RewardThresholdType;
  threshold_value: number;
  achieved_at: string | null;
  claimed: boolean;
  claimed_at: string | null;
  created_at: string;
}

export type SenderType = 'parent' | 'child';

export interface Message {
  id: string;
  family_id: string;
  child_id: string;
  sender_type: SenderType;
  message_text: string;
  created_at: string;
  read_at: string | null;
}

export type DayStatus = 'green' | 'yellow' | 'red' | 'none';

export interface HistoryDay {
  date: string;
  status: DayStatus;
  done: number;
  total: number;
}

export interface Zikr {
  id: string;
  title: string;
  arabic_text: string | null;
  transliteration: string;
  translation: string | null;
  category: Category;
  default_count: number;
  is_custom: boolean;
  created_by_family_id: string | null;
}

export interface Assignment {
  id: string;
  child_id: string;
  zikr_id: string;
  daily_target: number;
  active: boolean;
  created_at: string;
  zikr?: Zikr;
}

export interface DailyLog {
  id: string;
  assignment_id: string;
  child_id: string;
  log_date: string;
  count_done: number;
  completed: boolean;
  parent_confirmed: boolean;
  confirmed_at: string | null;
  updated_at: string;
}

export interface AssignmentWithLog extends Assignment {
  log: DailyLog | null;
}

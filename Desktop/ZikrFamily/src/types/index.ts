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

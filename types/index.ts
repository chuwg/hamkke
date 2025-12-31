// 자녀 프로필 타입
export interface Child {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  diagnosis?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 일정 타입
export interface Schedule {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  reminder_minutes?: number;
  created_at: string;
  updated_at: string;
}

// 치료 기록 타입
export interface TherapyRecord {
  id: string;
  child_id: string;
  therapy_type: string;
  date: string;
  duration_minutes: number;
  notes?: string;
  therapist_name?: string;
  created_at: string;
  updated_at: string;
}

// 감각 프로파일 타입
export interface SensoryProfile {
  id: string;
  child_id: string;
  date: string;
  visual: number;
  auditory: number;
  tactile: number;
  vestibular: number;
  proprioceptive: number;
  oral: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 발달 마일스톤 타입
export interface Milestone {
  id: string;
  child_id: string;
  category: string;
  milestone: string;
  achieved: boolean;
  achieved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

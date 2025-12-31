import { supabase } from './supabase';
import type { Child, Schedule, TherapyRecord, SensoryProfile, Milestone } from '../types';

// Supabase 연결 테스트
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('children')
      .select('count');

    if (error) throw error;

    return { success: true, message: 'Supabase 연결 성공!' };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '연결 실패'
    };
  }
}

// Children (자녀 프로필) API
export const childrenApi = {
  // 모든 자녀 프로필 조회
  getAll: async () => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Child[];
  },

  // 특정 자녀 프로필 조회
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Child;
  },

  // 자녀 프로필 생성
  create: async (child: Omit<Child, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('children')
      .insert(child)
      .select()
      .single();

    if (error) throw error;
    return data as Child;
  },

  // 자녀 프로필 수정
  update: async (id: string, updates: Partial<Child>) => {
    const { data, error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Child;
  },

  // 자녀 프로필 삭제
  delete: async (id: string) => {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Schedules (일정) API
export const schedulesApi = {
  // 특정 자녀의 모든 일정 조회
  getByChildId: async (childId: string) => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('child_id', childId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as Schedule[];
  },

  // 일정 생성
  create: async (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data as Schedule;
  },

  // 일정 수정
  update: async (id: string, updates: Partial<Schedule>) => {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Schedule;
  },

  // 일정 삭제
  delete: async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Therapy Records (치료 기록) API
export const therapyRecordsApi = {
  // 특정 자녀의 모든 치료 기록 조회
  getByChildId: async (childId: string) => {
    const { data, error } = await supabase
      .from('therapy_records')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as TherapyRecord[];
  },

  // 치료 기록 생성
  create: async (record: Omit<TherapyRecord, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('therapy_records')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as TherapyRecord;
  },

  // 치료 기록 수정
  update: async (id: string, updates: Partial<TherapyRecord>) => {
    const { data, error } = await supabase
      .from('therapy_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TherapyRecord;
  },

  // 치료 기록 삭제
  delete: async (id: string) => {
    const { error } = await supabase
      .from('therapy_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Sensory Profiles (감각 프로파일) API
export const sensoryProfilesApi = {
  // 특정 자녀의 모든 감각 프로파일 조회
  getByChildId: async (childId: string) => {
    const { data, error } = await supabase
      .from('sensory_profiles')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as SensoryProfile[];
  },

  // 감각 프로파일 생성
  create: async (profile: Omit<SensoryProfile, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('sensory_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data as SensoryProfile;
  },

  // 감각 프로파일 수정
  update: async (id: string, updates: Partial<SensoryProfile>) => {
    const { data, error } = await supabase
      .from('sensory_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SensoryProfile;
  },

  // 감각 프로파일 삭제
  delete: async (id: string) => {
    const { error } = await supabase
      .from('sensory_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Milestones (발달 마일스톤) API
export const milestonesApi = {
  // 특정 자녀의 모든 마일스톤 조회
  getByChildId: async (childId: string) => {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Milestone[];
  },

  // 마일스톤 생성
  create: async (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();

    if (error) throw error;
    return data as Milestone;
  },

  // 마일스톤 수정
  update: async (id: string, updates: Partial<Milestone>) => {
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Milestone;
  },

  // 마일스톤 삭제
  delete: async (id: string) => {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

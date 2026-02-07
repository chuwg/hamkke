import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Child, Schedule, TherapyRecord, SensoryProfile, Milestone } from '../types';

// Storage Keys
const STORAGE_KEYS = {
  CHILDREN: '@hamkke_children',
  SCHEDULES: '@hamkke_schedules',
  THERAPY_RECORDS: '@hamkke_therapy_records',
  SENSORY_PROFILES: '@hamkke_sensory_profiles',
  MILESTONES: '@hamkke_milestones',
};

// UUID 생성 함수
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 현재 시간 ISO 문자열
const now = (): string => new Date().toISOString();

// Generic storage helpers
async function getItems<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return [];
  }
}

async function setItems<T>(key: string, items: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
}

// Children (자녀 프로필) API
export const childrenApi = {
  getAll: async (): Promise<Child[]> => {
    const children = await getItems<Child>(STORAGE_KEYS.CHILDREN);
    return children.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: async (id: string): Promise<Child | null> => {
    const children = await getItems<Child>(STORAGE_KEYS.CHILDREN);
    return children.find((c) => c.id === id) || null;
  },

  create: async (child: Omit<Child, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Child> => {
    const children = await getItems<Child>(STORAGE_KEYS.CHILDREN);
    const newChild: Child = {
      ...child,
      id: generateId(),
      user_id: 'local',
      created_at: now(),
      updated_at: now(),
    };
    children.push(newChild);
    await setItems(STORAGE_KEYS.CHILDREN, children);
    return newChild;
  },

  update: async (id: string, updates: Partial<Child>): Promise<Child> => {
    const children = await getItems<Child>(STORAGE_KEYS.CHILDREN);
    const index = children.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Child not found');

    children[index] = {
      ...children[index],
      ...updates,
      updated_at: now(),
    };
    await setItems(STORAGE_KEYS.CHILDREN, children);
    return children[index];
  },

  delete: async (id: string): Promise<void> => {
    const children = await getItems<Child>(STORAGE_KEYS.CHILDREN);
    const filtered = children.filter((c) => c.id !== id);
    await setItems(STORAGE_KEYS.CHILDREN, filtered);

    // 연관 데이터도 삭제
    const schedules = await getItems<Schedule>(STORAGE_KEYS.SCHEDULES);
    await setItems(STORAGE_KEYS.SCHEDULES, schedules.filter((s) => s.child_id !== id));

    const therapyRecords = await getItems<TherapyRecord>(STORAGE_KEYS.THERAPY_RECORDS);
    await setItems(STORAGE_KEYS.THERAPY_RECORDS, therapyRecords.filter((t) => t.child_id !== id));

    const sensoryProfiles = await getItems<SensoryProfile>(STORAGE_KEYS.SENSORY_PROFILES);
    await setItems(STORAGE_KEYS.SENSORY_PROFILES, sensoryProfiles.filter((s) => s.child_id !== id));

    const milestones = await getItems<Milestone>(STORAGE_KEYS.MILESTONES);
    await setItems(STORAGE_KEYS.MILESTONES, milestones.filter((m) => m.child_id !== id));
  },
};

// Schedules (일정) API
export const schedulesApi = {
  getByChildId: async (childId: string): Promise<Schedule[]> => {
    const schedules = await getItems<Schedule>(STORAGE_KEYS.SCHEDULES);
    return schedules
      .filter((s) => s.child_id === childId)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  },

  create: async (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<Schedule> => {
    const schedules = await getItems<Schedule>(STORAGE_KEYS.SCHEDULES);
    const newSchedule: Schedule = {
      ...schedule,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    schedules.push(newSchedule);
    await setItems(STORAGE_KEYS.SCHEDULES, schedules);
    return newSchedule;
  },

  update: async (id: string, updates: Partial<Schedule>): Promise<Schedule> => {
    const schedules = await getItems<Schedule>(STORAGE_KEYS.SCHEDULES);
    const index = schedules.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Schedule not found');

    schedules[index] = {
      ...schedules[index],
      ...updates,
      updated_at: now(),
    };
    await setItems(STORAGE_KEYS.SCHEDULES, schedules);
    return schedules[index];
  },

  delete: async (id: string): Promise<void> => {
    const schedules = await getItems<Schedule>(STORAGE_KEYS.SCHEDULES);
    await setItems(STORAGE_KEYS.SCHEDULES, schedules.filter((s) => s.id !== id));
  },
};

// Therapy Records (치료 기록) API
export const therapyRecordsApi = {
  getByChildId: async (childId: string): Promise<TherapyRecord[]> => {
    const records = await getItems<TherapyRecord>(STORAGE_KEYS.THERAPY_RECORDS);
    return records
      .filter((r) => r.child_id === childId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  create: async (record: Omit<TherapyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TherapyRecord> => {
    const records = await getItems<TherapyRecord>(STORAGE_KEYS.THERAPY_RECORDS);
    const newRecord: TherapyRecord = {
      ...record,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    records.push(newRecord);
    await setItems(STORAGE_KEYS.THERAPY_RECORDS, records);
    return newRecord;
  },

  update: async (id: string, updates: Partial<TherapyRecord>): Promise<TherapyRecord> => {
    const records = await getItems<TherapyRecord>(STORAGE_KEYS.THERAPY_RECORDS);
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Therapy record not found');

    records[index] = {
      ...records[index],
      ...updates,
      updated_at: now(),
    };
    await setItems(STORAGE_KEYS.THERAPY_RECORDS, records);
    return records[index];
  },

  delete: async (id: string): Promise<void> => {
    const records = await getItems<TherapyRecord>(STORAGE_KEYS.THERAPY_RECORDS);
    await setItems(STORAGE_KEYS.THERAPY_RECORDS, records.filter((r) => r.id !== id));
  },
};

// Sensory Profiles (감각 프로파일) API
export const sensoryProfilesApi = {
  getByChildId: async (childId: string): Promise<SensoryProfile[]> => {
    const profiles = await getItems<SensoryProfile>(STORAGE_KEYS.SENSORY_PROFILES);
    return profiles
      .filter((p) => p.child_id === childId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  create: async (profile: Omit<SensoryProfile, 'id' | 'created_at' | 'updated_at'>): Promise<SensoryProfile> => {
    const profiles = await getItems<SensoryProfile>(STORAGE_KEYS.SENSORY_PROFILES);
    const newProfile: SensoryProfile = {
      ...profile,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    profiles.push(newProfile);
    await setItems(STORAGE_KEYS.SENSORY_PROFILES, profiles);
    return newProfile;
  },

  update: async (id: string, updates: Partial<SensoryProfile>): Promise<SensoryProfile> => {
    const profiles = await getItems<SensoryProfile>(STORAGE_KEYS.SENSORY_PROFILES);
    const index = profiles.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Sensory profile not found');

    profiles[index] = {
      ...profiles[index],
      ...updates,
      updated_at: now(),
    };
    await setItems(STORAGE_KEYS.SENSORY_PROFILES, profiles);
    return profiles[index];
  },

  delete: async (id: string): Promise<void> => {
    const profiles = await getItems<SensoryProfile>(STORAGE_KEYS.SENSORY_PROFILES);
    await setItems(STORAGE_KEYS.SENSORY_PROFILES, profiles.filter((p) => p.id !== id));
  },
};

// Milestones (발달 마일스톤) API
export const milestonesApi = {
  getByChildId: async (childId: string): Promise<Milestone[]> => {
    const milestones = await getItems<Milestone>(STORAGE_KEYS.MILESTONES);
    return milestones
      .filter((m) => m.child_id === childId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  create: async (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Promise<Milestone> => {
    const milestones = await getItems<Milestone>(STORAGE_KEYS.MILESTONES);
    const newMilestone: Milestone = {
      ...milestone,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    milestones.push(newMilestone);
    await setItems(STORAGE_KEYS.MILESTONES, milestones);
    return newMilestone;
  },

  update: async (id: string, updates: Partial<Milestone>): Promise<Milestone> => {
    const milestones = await getItems<Milestone>(STORAGE_KEYS.MILESTONES);
    const index = milestones.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Milestone not found');

    milestones[index] = {
      ...milestones[index],
      ...updates,
      updated_at: now(),
    };
    await setItems(STORAGE_KEYS.MILESTONES, milestones);
    return milestones[index];
  },

  delete: async (id: string): Promise<void> => {
    const milestones = await getItems<Milestone>(STORAGE_KEYS.MILESTONES);
    await setItems(STORAGE_KEYS.MILESTONES, milestones.filter((m) => m.id !== id));
  },
};

// 데이터 백업/복원 기능
export const backupApi = {
  // 모든 데이터를 JSON으로 내보내기
  exportAllData: async (): Promise<string> => {
    const data = {
      version: 1,
      exportedAt: now(),
      children: await getItems<Child>(STORAGE_KEYS.CHILDREN),
      schedules: await getItems<Schedule>(STORAGE_KEYS.SCHEDULES),
      therapyRecords: await getItems<TherapyRecord>(STORAGE_KEYS.THERAPY_RECORDS),
      sensoryProfiles: await getItems<SensoryProfile>(STORAGE_KEYS.SENSORY_PROFILES),
      milestones: await getItems<Milestone>(STORAGE_KEYS.MILESTONES),
    };
    return JSON.stringify(data, null, 2);
  },

  // JSON 데이터에서 복원
  importAllData: async (jsonString: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || !data.children) {
        return { success: false, message: '올바른 백업 파일이 아닙니다.' };
      }

      await setItems(STORAGE_KEYS.CHILDREN, data.children || []);
      await setItems(STORAGE_KEYS.SCHEDULES, data.schedules || []);
      await setItems(STORAGE_KEYS.THERAPY_RECORDS, data.therapyRecords || []);
      await setItems(STORAGE_KEYS.SENSORY_PROFILES, data.sensoryProfiles || []);
      await setItems(STORAGE_KEYS.MILESTONES, data.milestones || []);

      return { success: true, message: '데이터를 성공적으로 복원했습니다.' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: '데이터 복원 중 오류가 발생했습니다.' };
    }
  },

  // 모든 데이터 삭제
  clearAllData: async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CHILDREN,
      STORAGE_KEYS.SCHEDULES,
      STORAGE_KEYS.THERAPY_RECORDS,
      STORAGE_KEYS.SENSORY_PROFILES,
      STORAGE_KEYS.MILESTONES,
    ]);
  },
};

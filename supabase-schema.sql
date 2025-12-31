-- 함께크는 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 자녀 프로필 테이블
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 일정 테이블
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE format
  reminder_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 치료 기록 테이블
CREATE TABLE therapy_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  therapy_type TEXT NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  therapist_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 감각 프로파일 테이블
CREATE TABLE sensory_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  visual INTEGER CHECK (visual >= 0 AND visual <= 10),
  auditory INTEGER CHECK (auditory >= 0 AND auditory <= 10),
  tactile INTEGER CHECK (tactile >= 0 AND tactile <= 10),
  vestibular INTEGER CHECK (vestibular >= 0 AND vestibular <= 10),
  proprioceptive INTEGER CHECK (proprioceptive >= 0 AND proprioceptive <= 10),
  oral INTEGER CHECK (oral >= 0 AND oral <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 발달 마일스톤 테이블
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'social', 'communication', 'motor', 'cognitive'
  milestone TEXT NOT NULL,
  achieved BOOLEAN DEFAULT FALSE,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_schedules_child_id ON schedules(child_id);
CREATE INDEX idx_schedules_start_time ON schedules(start_time);
CREATE INDEX idx_therapy_records_child_id ON therapy_records(child_id);
CREATE INDEX idx_therapy_records_date ON therapy_records(date);
CREATE INDEX idx_sensory_profiles_child_id ON sensory_profiles(child_id);
CREATE INDEX idx_sensory_profiles_date ON sensory_profiles(date);
CREATE INDEX idx_milestones_child_id ON milestones(child_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_records_updated_at BEFORE UPDATE ON therapy_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sensory_profiles_updated_at BEFORE UPDATE ON sensory_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

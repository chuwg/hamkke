-- Row Level Security (RLS) 정책 설정
-- 사용자는 자신의 데이터만 접근 가능

-- 1. RLS 활성화
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- 2. Children 테이블 정책
-- 사용자는 자신의 자녀 프로필만 조회/생성/수정/삭제 가능
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Schedules 테이블 정책
-- 사용자는 자신의 자녀의 일정만 접근 가능
CREATE POLICY "Users can view schedules of their children"
  ON schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = schedules.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert schedules for their children"
  ON schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = schedules.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update schedules of their children"
  ON schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = schedules.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedules of their children"
  ON schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = schedules.child_id
      AND children.user_id = auth.uid()
    )
  );

-- 4. Therapy Records 테이블 정책
CREATE POLICY "Users can view therapy records of their children"
  ON therapy_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = therapy_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert therapy records for their children"
  ON therapy_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = therapy_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update therapy records of their children"
  ON therapy_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = therapy_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete therapy records of their children"
  ON therapy_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = therapy_records.child_id
      AND children.user_id = auth.uid()
    )
  );

-- 5. Sensory Profiles 테이블 정책
CREATE POLICY "Users can view sensory profiles of their children"
  ON sensory_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = sensory_profiles.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sensory profiles for their children"
  ON sensory_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = sensory_profiles.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sensory profiles of their children"
  ON sensory_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = sensory_profiles.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sensory profiles of their children"
  ON sensory_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = sensory_profiles.child_id
      AND children.user_id = auth.uid()
    )
  );

-- 6. Milestones 테이블 정책
CREATE POLICY "Users can view milestones of their children"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert milestones for their children"
  ON milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones of their children"
  ON milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones of their children"
  ON milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.user_id = auth.uid()
    )
  );

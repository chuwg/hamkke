-- Migration: Add calendar_event_id column to schedules table
-- 실행 날짜: 2026-01-02
-- 설명: 네이티브 캘린더(iOS Calendar/Google Calendar) 연동을 위한 이벤트 ID 컬럼 추가

-- schedules 테이블에 calendar_event_id 컬럼 추가
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN schedules.calendar_event_id IS '네이티브 캘린더 이벤트 ID (iOS/Android 전용)';

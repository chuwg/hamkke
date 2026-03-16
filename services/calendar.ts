import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

const CALENDAR_NAME = '함께크는';

interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  alarmOffset?: number; // 분 단위 (음수값: -30 = 30분 전)
}

class CalendarService {
  private calendarId: string | null = null;

  // 캘린더 권한 요청
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false; // 웹에서는 지원하지 않음
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  // 앱 전용 캘린더 ID 가져오기 (없으면 생성)
  async getOrCreateCalendar(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      // 이미 캘린더 ID가 있으면 반환
      if (this.calendarId) {
        return this.calendarId;
      }

      // 권한 확인
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // 기존 캘린더 찾기
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const existingCalendar = calendars.find(cal => cal.title === CALENDAR_NAME);

      if (existingCalendar) {
        this.calendarId = existingCalendar.id;
        return this.calendarId;
      }

      // 새 캘린더 생성
      const defaultCalendarSource =
        Platform.OS === 'ios'
          ? await this.getDefaultCalendarSource()
          : { isLocalAccount: true, name: CALENDAR_NAME, type: Calendar.SourceType.LOCAL };

      if (!defaultCalendarSource) {
        return null;
      }

      const newCalendarId = await Calendar.createCalendarAsync({
        title: CALENDAR_NAME,
        color: '#007AFF',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: CALENDAR_NAME,
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      this.calendarId = newCalendarId;
      return newCalendarId;
    } catch (error) {
      return null;
    }
  }

  // iOS 기본 캘린더 소스 가져오기
  private async getDefaultCalendarSource() {
    const sources = await Calendar.getSourcesAsync();
    const defaultSource = sources.find(
      source => source.type === Calendar.SourceType.CALDAV && source.name === 'iCloud'
    ) || sources.find(
      source => source.type === Calendar.SourceType.LOCAL
    );
    return defaultSource;
  }

  // 이벤트 생성
  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const calendarId = await this.getOrCreateCalendar();
      if (!calendarId) {
        return null;
      }

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        notes: event.notes,
        alarms: event.alarmOffset ? [{
          relativeOffset: event.alarmOffset,
        }] : undefined,
      });

      return eventId;
    } catch (error) {
      return null;
    }
  }

  // 이벤트 수정
  async updateEvent(eventId: string, event: CalendarEvent): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      await Calendar.updateEventAsync(eventId, {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        notes: event.notes,
        alarms: event.alarmOffset ? [{
          relativeOffset: event.alarmOffset,
        }] : undefined,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // 이벤트 삭제
  async deleteEvent(eventId: string): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 권한 상태 확인
  async hasPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }
}

export const calendarService = new CalendarService();

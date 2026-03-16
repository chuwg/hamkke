import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PERMISSION_KEY = '@hamkke_notification_permission';
const SCHEDULED_NOTIFICATIONS_KEY = '@hamkke_scheduled_notifications';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ScheduleNotificationParams {
  scheduleId: string;
  title: string;
  body: string;
  scheduledTime: Date;
  data?: Record<string, unknown>;
}

class NotificationService {
  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    if (!Device.isDevice) {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Android 채널 설정
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '일정 알림',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });
    }

    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
    return true;
  }

  // 권한 상태 확인
  async checkPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // 일정 알림 스케줄링
  async scheduleNotification(params: ScheduleNotificationParams): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      return null;
    }

    const { scheduleId, title, body, scheduledTime, data } = params;

    // 과거 시간이면 스케줄링하지 않음
    if (scheduledTime.getTime() <= Date.now()) {
      return null;
    }

    try {
      // 기존 알림이 있으면 취소
      await this.cancelNotification(scheduleId);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { scheduleId, ...data },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        },
      });

      // 스케줄된 알림 정보 저장
      await this.saveScheduledNotification(scheduleId, notificationId);

      return notificationId;
    } catch (error) {
      return null;
    }
  }

  // 일정 알림 취소
  async cancelNotification(scheduleId: string): Promise<void> {
    try {
      const notificationId = await this.getScheduledNotificationId(scheduleId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeScheduledNotification(scheduleId);
      }
    } catch (error) {
      // cancel failure - silently ignore
    }
  }

  // 모든 알림 취소
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
    } catch (error) {
      // cancel all failure - silently ignore
    }
  }

  // 스케줄된 알림 정보 저장
  private async saveScheduledNotification(scheduleId: string, notificationId: string): Promise<void> {
    const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    const notifications = stored ? JSON.parse(stored) : {};
    notifications[scheduleId] = notificationId;
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  // 스케줄된 알림 ID 조회
  private async getScheduledNotificationId(scheduleId: string): Promise<string | null> {
    const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    if (!stored) return null;
    const notifications = JSON.parse(stored);
    return notifications[scheduleId] || null;
  }

  // 스케줄된 알림 정보 삭제
  private async removeScheduledNotification(scheduleId: string): Promise<void> {
    const stored = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    if (!stored) return;
    const notifications = JSON.parse(stored);
    delete notifications[scheduleId];
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  // 알림 리스너 등록
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // 알림 응답 리스너 등록 (알림 탭 시)
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // 일정에 대한 알림 시간 계산
  calculateNotificationTime(startTime: Date, reminderMinutes: number): Date {
    return new Date(startTime.getTime() - reminderMinutes * 60 * 1000);
  }

  // 즉시 알림 보내기 (테스트용)
  async sendImmediateNotification(title: string, body: string): Promise<void> {
    if (Platform.OS === 'web') return;

    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null, // 즉시 발송
    });
  }
}

export const notificationService = new NotificationService();

import MockAdapter from 'axios-mock-adapter';
import apiClient from './config';
import {
  getNotifications,
  markAsRead,
  getPreferences,
  updatePreferences,
  NotificationResponse,
  NotificationPreferenceResponse,
} from './notifications';

const mock = new MockAdapter(apiClient);

describe('Notification Service', () => {
  afterEach(() => {
    mock.reset();
  });

  const mockNotification: NotificationResponse = {
    id: 1,
    title: 'Test Notification',
    message: 'This is a test notification.',
    notification_type: 'email',
    read: false,
    created_at: '2025-05-30T12:00:00Z',
    recipient: 123,
  };

  const mockPreference: NotificationPreferenceResponse = {
    id: 1,
    user: 123,
    email_enabled: true,
    push_enabled: false,
    sms_enabled: true,
    in_app_enabled: true,
  };

  describe('getNotifications', () => {
    it('should fetch a list of notifications', async () => {
      mock.onGet('/notifications/messages/').reply(200, [mockNotification]);

      const notifications = await getNotifications();
      expect(notifications).toEqual([mockNotification]);
    });

    it('should handle paginated response', async () => {
      const paginatedResponse = {
        count: 1,
        next: null,
        previous: null,
        results: [mockNotification],
      };

      mock.onGet('/notifications/messages/').reply(200, paginatedResponse);

      const response = await getNotifications();
      expect(response).toEqual(paginatedResponse);
    });

    it('should throw error on failure', async () => {
      mock.onGet('/notifications/messages/').networkError();

      await expect(getNotifications()).rejects.toThrow();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const updatedNotification = { ...mockNotification, read: true };
      mock.onPatch(`/notifications/messages/${mockNotification.id}/`, { read: true }).reply(200, updatedNotification);

      const result = await markAsRead(mockNotification.id);
      expect(result.read).toBe(true);
    });

    it('should throw error on failure', async () => {
      mock.onPatch(`/notifications/messages/${mockNotification.id}/`).networkError();

      await expect(markAsRead(mockNotification.id)).rejects.toThrow();
    });
  });

  describe('getPreferences', () => {
    it('should return first preference from paginated results', async () => {
      const paginatedPrefs = { results: [mockPreference], count: 1, next: null, previous: null };
      mock.onGet('/notifications/preferences/').reply(200, paginatedPrefs);

      const result = await getPreferences();
      expect(result).toEqual(mockPreference);
    });

    it('should return first preference from array', async () => {
      mock.onGet('/notifications/preferences/').reply(200, [mockPreference]);

      const result = await getPreferences();
      expect(result).toEqual(mockPreference);
    });

    it('should throw error if no preferences found', async () => {
      mock.onGet('/notifications/preferences/').reply(200, []);

      await expect(getPreferences()).rejects.toThrow('No se encontraron preferencias de notificación');
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const updatedPrefs = { ...mockPreference, email_enabled: false };

      mock.onGet('/notifications/preferences/').reply(200, [mockPreference]);
      mock.onPatch(`/notifications/preferences/${mockPreference.id}/`).reply(200, updatedPrefs);

      const result = await updatePreferences({ email_enabled: false });
      expect(result.email_enabled).toBe(false);
    });

    it('should throw error on update failure', async () => {
      mock.onGet('/notifications/preferences/').reply(200, [mockPreference]);
      mock.onPatch(`/notifications/preferences/${mockPreference.id}/`).networkError();

      await expect(updatePreferences({ email_enabled: false })).rejects.toThrow();
    });
  });
});

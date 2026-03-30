import { useMemo, useSyncExternalStore } from 'react'
import {
  clearNotifications,
  getStoredNotificationsSnapshot,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeStoredNotifications,
} from '@/lib/local-notifications'

export const useNotifications = () => {
  const notifications = useSyncExternalStore(
    subscribeStoredNotifications,
    getStoredNotificationsSnapshot,
    getStoredNotificationsSnapshot
  )

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  return {
    notifications,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    clearAll: clearNotifications,
  }
}

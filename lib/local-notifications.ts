import type { AppNotification, NotificationActor, NotificationType } from '@/types/notification'

const STORAGE_KEY = 'teamup_notifications_v1'
export const NOTIFICATIONS_UPDATED_EVENT = 'teamup:notifications-updated'

const isBrowser = () => typeof window !== 'undefined'

const emitNotificationsUpdated = () => {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
}

export const getStoredNotifications = (): AppNotification[] => {
  if (!isBrowser()) return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as AppNotification[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export const getStoredNotificationsSnapshot = (): AppNotification[] => getStoredNotifications()

export const subscribeStoredNotifications = (callback: () => void) => {
  if (!isBrowser()) {
    return () => {}
  }

  const handler = () => callback()
  window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handler)
  window.addEventListener('focus', handler)

  return () => {
    window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handler)
    window.removeEventListener('focus', handler)
  }
}

export const setStoredNotifications = (notifications: AppNotification[]) => {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  emitNotificationsUpdated()
}

export const pushNotification = (
  data: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { actor?: NotificationActor }
) => {
  const { actor, ...rest } = data
  const next: AppNotification = {
    id: `noti-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...rest,
    actor: actor ?? 'SYSTEM',
  }

  const current = getStoredNotifications()
  setStoredNotifications([next, ...current].slice(0, 200))
  return next
}

export const markNotificationAsRead = (notificationId: string) => {
  const current = getStoredNotifications()
  const next = current.map((item) =>
    item.id === notificationId
      ? {
          ...item,
          read: true,
        }
      : item
  )
  setStoredNotifications(next)
}

export const markAllNotificationsAsRead = () => {
  const current = getStoredNotifications()
  const next = current.map((item) => ({ ...item, read: true }))
  setStoredNotifications(next)
}

export const clearNotifications = () => {
  setStoredNotifications([])
}

export const getUnreadNotificationsCount = () =>
  getStoredNotifications().filter((item) => !item.read).length

export const getNotificationTypeLabel = (type: NotificationType) => {
  if (type === 'MATCH_APPLIED') return '신청 완료'
  if (type === 'MATCH_CANCELLED') return '매치 취소'
  return '환불 완료'
}


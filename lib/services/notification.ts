// 알림 관련 API
import { get, put } from './client'

export interface Notification {
  id: string
  type: 'match_request' | 'join_request' | 'match_accepted' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedId?: string // 관련된 요청/팀 ID
}

export const notificationService = {
  // ========== 실제 사용 API ==========

  // 알림 목록 조회
  getNotifications: async (): Promise<Notification[]> => {
    return get<Notification[]>('/api/notifications')
  },

  // // 알림 읽음 처리
  // markNotificationAsRead: async (notificationId: string): Promise<void> => {
  //   return put(`/notifications/${notificationId}/read`)
  // },

  // // 모든 알림 읽음 처리
  // markAllNotificationsAsRead: async (): Promise<void> => {
  //   return put('/notifications/read-all')
  // },
}

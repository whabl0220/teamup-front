export type NotificationType = 'MATCH_APPLIED' | 'MATCH_CANCELLED' | 'REFUND_COMPLETED'

export type NotificationActor = 'USER' | 'HOST' | 'SYSTEM'

export interface AppNotification {
  id: string
  type: NotificationType
  actor: NotificationActor
  title: string
  message: string
  createdAt: string
  read: boolean
  meta?: {
    matchId?: string
    matchTitle?: string
    applicationId?: string
    userId?: string
    userName?: string
  }
}


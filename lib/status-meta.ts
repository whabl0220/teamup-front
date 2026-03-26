import type { Match, MatchApplication } from '@/types/match'

type BadgeVariant = 'default' | 'secondary' | 'outline'

export const MATCH_STATUS_META: Record<
  Match['status'],
  { label: string; variant: BadgeVariant; className?: string }
> = {
  RECRUITING: { label: '모집중', variant: 'default', className: 'status-badge-recruiting' },
  FULL: { label: '마감', variant: 'secondary', className: 'status-badge-full' },
  CANCELLED: { label: '취소', variant: 'outline', className: 'status-badge-cancelled' },
  ENDED: { label: '종료', variant: 'outline', className: 'status-badge-ended' },
}

export const APPLICATION_STATUS_META: Record<
  MatchApplication['status'],
  { label: string; shortLabel: string; variant: BadgeVariant; className?: string }
> = {
  PENDING_DEPOSIT: {
    label: '입금 대기',
    shortLabel: '입금대기',
    variant: 'default',
    className: 'status-badge-pending-deposit',
  },
  CONFIRMED: {
    label: '참가 확정',
    shortLabel: '확정',
    variant: 'secondary',
    className: 'status-badge-confirmed',
  },
  CANCELLED: {
    label: '신청 취소',
    shortLabel: '취소',
    variant: 'outline',
    className: 'status-badge-application-cancelled',
  },
  REFUNDED: {
    label: '환불 완료',
    shortLabel: '환불',
    variant: 'outline',
    className: 'status-badge-refunded',
  },
}


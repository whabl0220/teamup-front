import type { Match, MatchApplication } from '@/types/match'

type BadgeVariant = 'default' | 'secondary' | 'outline'

export const MATCH_STATUS_META: Record<
  Match['status'],
  { label: string; variant: BadgeVariant; className?: string }
> = {
  RECRUITING: { label: '모집중', variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-600' },
  FULL: { label: '마감', variant: 'secondary', className: 'bg-slate-700 text-white hover:bg-slate-700' },
  CANCELLED: { label: '취소', variant: 'outline', className: 'border-rose-300 text-rose-600' },
  ENDED: { label: '종료', variant: 'outline', className: 'border-muted-foreground/30 text-muted-foreground' },
}

export const APPLICATION_STATUS_META: Record<
  MatchApplication['status'],
  { label: string; shortLabel: string; variant: BadgeVariant; className?: string }
> = {
  PENDING_DEPOSIT: {
    label: '입금 대기',
    shortLabel: '입금대기',
    variant: 'default',
    className: 'bg-amber-500 hover:bg-amber-500 text-white',
  },
  CONFIRMED: {
    label: '참가 확정',
    shortLabel: '확정',
    variant: 'secondary',
    className: 'bg-blue-600 hover:bg-blue-600 text-white',
  },
  CANCELLED: {
    label: '신청 취소',
    shortLabel: '취소',
    variant: 'outline',
    className: 'border-slate-300 text-slate-600',
  },
  REFUNDED: {
    label: '환불 완료',
    shortLabel: '환불',
    variant: 'outline',
    className: 'border-violet-300 text-violet-600',
  },
}


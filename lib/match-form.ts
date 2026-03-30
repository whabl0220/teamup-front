import type { CreateMatchRequest, MatchLevel, UpdateMatchRequest } from '@/types/match'

export type MatchFormValues = {
  title: string
  courtId: string
  startAt: string
  endAt: string
  fee: string
  capacity: string
  level: MatchLevel
  cancellationPolicy: string
  notes: string
  depositAccount: string
}

export const toIsoFromLocalDatetime = (value: string): string => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid datetime')
  }
  return d.toISOString()
}

export const isMatchFormSubmittable = (values: MatchFormValues): boolean => {
  const parsedFee = Number(values.fee)
  const parsedCapacity = Number(values.capacity)
  return Boolean(
    values.title.trim() &&
      values.courtId &&
      values.startAt &&
      values.fee.trim() &&
      Number.isFinite(parsedFee) &&
      parsedFee > 0 &&
      values.capacity.trim() &&
      Number.isFinite(parsedCapacity) &&
      parsedCapacity > 0 &&
      values.depositAccount.trim()
  )
}

export const validateMatchDateRange = (
  startAt: string,
  endAt: string
): { ok: true } | { ok: false; message: string } => {
  const startDate = new Date(startAt)
  const endDate = endAt ? new Date(endAt) : null
  if (Number.isNaN(startDate.getTime()) || (endDate && Number.isNaN(endDate.getTime()))) {
    return { ok: false, message: '시작/종료 시간을 다시 확인해주세요.' }
  }
  if (endDate && endDate.getTime() <= startDate.getTime()) {
    return { ok: false, message: '종료 시간은 시작 시간보다 늦어야 합니다.' }
  }
  return { ok: true }
}

type MatchPayload = CreateMatchRequest | UpdateMatchRequest

export const toMatchPayload = (values: MatchFormValues): MatchPayload => ({
  title: values.title.trim(),
  courtId: values.courtId,
  startAt: toIsoFromLocalDatetime(values.startAt),
  endAt: values.endAt.trim() ? toIsoFromLocalDatetime(values.endAt) : undefined,
  fee: Math.round(Number(values.fee)),
  capacity: Math.round(Number(values.capacity)),
  level: values.level,
  cancellationPolicy: values.cancellationPolicy.trim() || undefined,
  notes: values.notes.trim() || undefined,
  depositAccount: values.depositAccount.trim(),
})

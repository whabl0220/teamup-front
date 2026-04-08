import type { CreateMatchRequest, MatchLevel, UpdateMatchRequest } from '@/types/match'

const pad2 = (n: number) => String(n).padStart(2, '0')

/** `<input type="datetime-local" />`용 로컬 문자열 */
export const toLocalDatetimeValue = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`

/** 경기 생성 폼 기본값: 오늘 정오 12:00 시작, 종료는 시작 + 2시간 */
export const getDefaultMatchDatetimeRangeLocal = (): { startAt: string; endAt: string } => {
  const start = new Date()
  start.setHours(12, 0, 0, 0)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  return {
    startAt: toLocalDatetimeValue(start),
    endAt: toLocalDatetimeValue(end),
  }
}

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
  const feeOk =
    values.fee.trim() !== '' &&
    Number.isFinite(parsedFee) &&
    parsedFee >= 0 &&
    Number.isInteger(parsedFee)
  const depositOk = parsedFee === 0 || Boolean(values.depositAccount.trim())
  return Boolean(
    values.title.trim() &&
      values.courtId &&
      values.startAt &&
      feeOk &&
      values.capacity.trim() &&
      Number.isFinite(parsedCapacity) &&
      parsedCapacity > 0 &&
      depositOk
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

export const toMatchPayload = (values: MatchFormValues): MatchPayload => {
  const fee = Math.round(Number(values.fee))
  const depositAccount = values.depositAccount.trim() || undefined
  return {
    title: values.title.trim(),
    courtId: values.courtId,
    startAt: toIsoFromLocalDatetime(values.startAt),
    endAt: values.endAt.trim() ? toIsoFromLocalDatetime(values.endAt) : undefined,
    fee,
    capacity: Math.round(Number(values.capacity)),
    level: values.level,
    cancellationPolicy: values.cancellationPolicy.trim() || undefined,
    notes: values.notes.trim() || undefined,
    // 무료 경기(fee === 0)이거나 빈 값이면 필드 자체를 보내지 않음
    depositAccount: fee === 0 ? undefined : depositAccount,
  }
}

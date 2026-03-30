export const formatDateTimeKorean = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const weekday = getPart('weekday').replace('요일', '')
  return `${getPart('year')}.${getPart('month')}.${getPart('day')} (${weekday}) ${getPart('hour')}:${getPart('minute')}`
}

export const formatCurrencyKRW = (value: number): string => {
  if (!Number.isFinite(value)) return '-'
  return `${value.toLocaleString('ko-KR')}원`
}

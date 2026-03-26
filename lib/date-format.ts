const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

const pad = (value: number) => String(value).padStart(2, '0')

export const formatDateTimeKorean = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const weekday = WEEKDAYS_KO[date.getDay()]
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())

  return `${yyyy}.${mm}.${dd} (${weekday}) ${hh}:${min}`
}


/** 로컬 날짜 기준 YYYY-MM-DD (매치 목록 날짜 필터와 공통) */
export const toDateKey = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const WEEKDAY_LABELS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

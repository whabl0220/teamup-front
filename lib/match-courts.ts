import type { CourtPreset } from '@/types/match'

// MVP v2: 외부 지도 검색 대신 프리셋 구장만 사용
export const MATCH_COURT_PRESETS: CourtPreset[] = [
  {
    id: 'sejong-daeyang-ai',
    name: '세종대 대양AI센터 코트',
    address: '서울 광진구 능동로 209',
    district: '광진구',
    indoor: true,
    lat: 37.5507,
    lng: 127.0736,
    notice: '실내화 권장, 주차 공간 협소',
  },
  {
    id: 'ttukseom-hangang',
    name: '뚝섬한강공원 농구장',
    address: '서울 광진구 강변북로 2273',
    district: '광진구',
    indoor: false,
    lat: 37.5305,
    lng: 127.0689,
  },
  {
    id: 'gwangnaru-court',
    name: '광나루 한강공원 농구장',
    address: '서울 광진구 광나루로 369',
    district: '광진구',
    indoor: false,
    lat: 37.5501,
    lng: 127.095,
  },
  {
    id: 'jayang-sports-center',
    name: '자양문화체육센터',
    address: '서울 광진구 뚝섬로52길 66',
    district: '광진구',
    indoor: true,
    lat: 37.5332,
    lng: 127.0699,
  },
  {
    id: 'jungnangcheon-park',
    name: '중랑천 체육공원 농구장',
    address: '서울 광진구 중곡동 485-7',
    district: '광진구',
    indoor: false,
    lat: 37.5583,
    lng: 127.0831,
  },
]

export const getMatchCourtById = (courtId: string): CourtPreset | undefined =>
  MATCH_COURT_PRESETS.find((court) => court.id === courtId)


'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface RegionSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (region: string) => void
}

// 서울시 구별 주요 동 데이터
const SEOUL_REGIONS = {
  '강남구': ['역삼동', '논현동', '삼성동', '청담동', '대치동', '신사동', '압구정동', '도곡동', '개포동'],
  '강동구': ['천호동', '성내동', '길동', '둔촌동', '암사동', '명일동', '고덕동', '상일동'],
  '강북구': ['미아동', '번동', '수유동', '우이동'],
  '강서구': ['염창동', '등촌동', '화곡동', '가양동', '마곡동', '발산동', '공항동'],
  '관악구': ['봉천동', '신림동', '남현동'],
  '광진구': ['중곡동', '능동', '구의동', '광장동', '자양동', '화양동'],
  '구로구': ['신도림동', '구로동', '가리봉동', '고척동', '개봉동', '오류동', '궁동', '온수동'],
  '금천구': ['가산동', '독산동', '시흥동'],
  '노원구': ['월계동', '공릉동', '하계동', '상계동', '중계동'],
  '도봉구': ['쌍문동', '방학동', '창동', '도봉동'],
  '동대문구': ['용두동', '제기동', '전농동', '답십리동', '장안동', '청량리동', '회기동', '휘경동', '이문동'],
  '동작구': ['노량진동', '상도동', '흑석동', '사당동', '대방동', '신대방동'],
  '마포구': ['공덕동', '아현동', '도화동', '용강동', '대흥동', '염리동', '신수동', '서강동', '서교동', '합정동', '망원동', '연남동', '성산동', '상암동'],
  '서대문구': ['충정로', '천연동', '신촌동', '연희동', '홍제동', '홍은동', '남가좌동', '북가좌동'],
  '서초구': ['서초동', '잠원동', '반포동', '방배동', '양재동', '내곡동'],
  '성동구': ['왕십리동', '마장동', '사근동', '행당동', '응봉동', '금호동', '옥수동', '성수동', '송정동', '용답동'],
  '성북구': ['성북동', '삼선동', '동선동', '돈암동', '안암동', '보문동', '정릉동', '길음동', '종암동', '하월곡동', '상월곡동', '장위동', '석관동'],
  '송파구': ['풍납동', '거여동', '마천동', '방이동', '오금동', '송파동', '석촌동', '삼전동', '가락동', '문정동', '장지동', '잠실동'],
  '양천구': ['신정동', '목동', '신월동'],
  '영등포구': ['영등포동', '여의도동', '당산동', '도림동', '문래동', '양평동', '신길동', '대림동'],
  '용산구': ['후암동', '용산동', '남영동', '청파동', '원효로', '효창동', '용문동', '한강로동', '이촌동', '이태원동', '한남동', '서빙고동', '보광동'],
  '은평구': ['수색동', '녹번동', '불광동', '갈현동', '구산동', '대조동', '응암동', '역촌동', '신사동', '증산동', '진관동'],
  '종로구': ['청운동', '사직동', '삼청동', '부암동', '평창동', '무악동', '교남동', '가회동', '종로', '이화동', '혜화동', '창신동', '숭인동'],
  '중구': ['소공동', '회현동', '명동', '필동', '장충동', '광희동', '을지로', '신당동', '다산동', '약수동', '청구동', '신당동', '동화동', '황학동', '중림동'],
  '중랑구': ['면목동', '상봉동', '중화동', '묵동', '망우동', '신내동']
}

export function RegionSelectModal({ open, onOpenChange, onSelect }: RegionSelectModalProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')

  const handleDistrictClick = (district: string) => {
    setSelectedDistrict(district)
  }

  const handleDongClick = (dong: string) => {
    const fullAddress = `서울특별시 ${selectedDistrict} ${dong}`
    onSelect(fullAddress)
    onOpenChange(false)
    // 초기화
    setTimeout(() => {
      setSelectedDistrict('')
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle>활동 지역 선택</DialogTitle>
        </DialogHeader>

        <div className="flex h-[400px]">
          {/* 왼쪽: 구 목록 */}
          <div className="w-1/2 border-r">
            <div className="px-4 py-2 bg-muted/50">
              <p className="text-sm font-medium">구</p>
            </div>
            <div className="overflow-y-auto h-[350px]">
              {Object.keys(SEOUL_REGIONS).map((district) => (
                <button
                  key={district}
                  onClick={() => handleDistrictClick(district)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors",
                    selectedDistrict === district && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 동 목록 */}
          <div className="w-1/2">
            <div className="px-4 py-2 bg-muted/50">
              <p className="text-sm font-medium">동</p>
            </div>
            <div className="overflow-y-auto h-[350px]">
              {selectedDistrict ? (
                SEOUL_REGIONS[selectedDistrict as keyof typeof SEOUL_REGIONS]?.map((dong) => (
                  <button
                    key={dong}
                    onClick={() => handleDongClick(dong)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors"
                  >
                    {dong}
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  구를 선택하세요
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/mypage" aria-label="뒤로가기">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">개인정보 처리방침</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-24">
        <Card className="teamup-card-soft">
          <CardContent className="space-y-4 p-5 text-sm leading-6 text-foreground/90">
            <p className="text-xs text-muted-foreground">시행일: 2026-03-30</p>
            <h2 className="font-semibold">1. 수집 항목</h2>
            <p>이메일, 닉네임, 성별, 활동 지역, 포지션 등 서비스 이용에 필요한 최소 정보를 수집합니다.</p>
            <h2 className="font-semibold">2. 수집 목적</h2>
            <p>회원 식별, 매치 참가/주최 기능 제공, 알림 제공, 서비스 운영 및 개선에 활용합니다.</p>
            <h2 className="font-semibold">3. 보유 및 이용 기간</h2>
            <p>
              개인정보는 수집 및 이용 목적 달성 시까지 보관하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안
              보관 후 파기합니다.
            </p>
            <h2 className="font-semibold">4. 제3자 제공 및 처리 위탁</h2>
            <p>
              원칙적으로 이용자 동의 없이 개인정보를 제3자에게 제공하지 않으며, 위탁이 필요한 경우 관련 내용을 별도
              고지합니다.
            </p>
            <h2 className="font-semibold">5. 이용자 권리</h2>
            <p>
              이용자는 본인 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할 수 있으며, 요청은 고객 문의 채널을
              통해 접수할 수 있습니다.
            </p>
            <h2 className="font-semibold">6. 문의처</h2>
            <p>개인정보 관련 문의: support@teamup.example</p>
            <p className="text-xs text-muted-foreground">
              안내: 본 문서는 서비스 운영을 위한 기본 고지용 초안이며, 정식 배포 전 법률 검토를 권장합니다.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

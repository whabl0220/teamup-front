import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/mypage" aria-label="뒤로가기">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">이용약관</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-24">
        <Card className="teamup-card-soft">
          <CardContent className="space-y-4 p-5 text-sm leading-6 text-foreground/90">
            <p className="text-xs text-muted-foreground">시행일: 2026-03-30</p>
            <p>
              본 약관은 TeamUp(이하 &quot;서비스&quot;)의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및
              책임사항을 규정합니다.
            </p>
            <h2 className="font-semibold">1. 서비스 내용</h2>
            <p>서비스는 농구 매치 탐색, 참가 신청, 주최 운영 관리 및 알림 기능을 제공합니다.</p>
            <h2 className="font-semibold">2. 이용자 의무</h2>
            <p>
              이용자는 허위 정보 등록, 타인 계정 도용, 서비스 운영을 방해하는 행위를 해서는 안 되며, 위반 시
              이용이 제한될 수 있습니다.
            </p>
            <h2 className="font-semibold">3. 매치 운영 정책</h2>
            <p>
              참가 신청, 확정, 취소 및 환불은 서비스 내 고지된 정책에 따르며, 주최자의 운영 판단 또는 운영 정책에
              따라 조정될 수 있습니다.
            </p>
            <h2 className="font-semibold">4. 책임의 제한</h2>
            <p>
              서비스 제공자는 천재지변, 네트워크 장애 등 불가항력 사유로 인한 서비스 중단에 대해 책임을 지지
              않습니다.
            </p>
            <h2 className="font-semibold">5. 약관 변경</h2>
            <p>
              약관이 변경되는 경우 서비스 내 공지하며, 변경 약관 시행일 이후 서비스를 계속 이용하면 변경 내용에
              동의한 것으로 봅니다.
            </p>
            <p className="text-xs text-muted-foreground">
              안내: 본 문서는 서비스 운영을 위한 기본 고지용 초안이며, 정식 배포 전 법률 검토를 권장합니다.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

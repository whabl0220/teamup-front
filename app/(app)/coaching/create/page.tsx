import { Suspense } from 'react'
import CoachingPageContent from './CoachingPageContent'

export default function CreateCoachingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    }>
      <CoachingPageContent />
    </Suspense>
  )
}

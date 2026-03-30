import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MatchDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <Card className="border-border/50">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

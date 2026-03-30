import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function HostMatchDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <Card className="border-border/50">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

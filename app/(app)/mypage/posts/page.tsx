'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import { teamService } from '@/lib/services'
import { toast } from 'sonner'
import type { Post } from '@/types'

export default function MyPostsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // 내 팀 목록 조회
        const teams = await teamService.getMyTeams()
        const team = teams.length > 0 ? teams[0] : null

        if (team) {
          // 내가 올린 모집 글 불러오기 (향후 API 추가 필요)
          const posts = JSON.parse(localStorage.getItem('teamup_posts') || '[]') as Post[]
          const filteredPosts = posts.filter(post => post.teamId === team.id)
          setMyPosts(filteredPosts)
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        toast.error('데이터를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId)
  }

  const confirmDelete = () => {
    if (!postToDelete) return

    // localStorage에서 삭제
    const posts = JSON.parse(localStorage.getItem('teamup_posts') || '[]') as Post[]
    const updatedPosts = posts.filter(post => post.id !== postToDelete)
    localStorage.setItem('teamup_posts', JSON.stringify(updatedPosts))

    // state 업데이트
    setMyPosts(myPosts.filter(post => post.id !== postToDelete))
    setPostToDelete(null)
  }

  const cancelDelete = () => {
    setPostToDelete(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/mypage')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">내가 올린 용병 모집 글</h1>
            <p className="text-sm text-muted-foreground">
              {myPosts.length}개의 모집 글
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : myPosts.length > 0 ? (
          <div className="space-y-4">
            {myPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-border/50 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {post.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.type === 'GUEST' ? '용병 모집' : '팀 대결'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{post.gameTime}</span>
                    </div>
                    {post.description && (
                      <p className="text-sm text-foreground">{post.description}</p>
                    )}
                    {post.additionalDescription && (
                      <p className="text-xs text-muted-foreground">
                        {post.additionalDescription}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-foreground">
              아직 올린 모집 글이 없습니다
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              지도에서 근처 사람들과 함께 농구하세요!
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => router.push('/map/create')}
            >
              모집 글 작성하기
            </Button>
          </div>
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {postToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-sm overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="mt-4 font-bold text-lg text-foreground">
                  모집 글 삭제
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  정말로 이 모집 글을 삭제하시겠습니까?<br />
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={cancelDelete}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmDelete}
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

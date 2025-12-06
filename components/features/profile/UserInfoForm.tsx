'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, MapPin, AlertCircle } from 'lucide-react'
import { RegionSelectModal } from '@/components/shared/RegionSelectModal'

export interface UserInfoFormData {
  nickname: string
  gender: string
  address: string
  height: string
  mainPosition: string
  subPosition: string
  playStyle: string
  statusMsg: string
}

interface UserInfoFormProps {
  formData: UserInfoFormData
  onChange: (data: UserInfoFormData) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
  error?: string
  submitButtonText: string
  // 어떤 필드를 보여줄지 제어
  fields: 'all' | 'basic' | 'card'
}

export function UserInfoForm({
  formData,
  onChange,
  onSubmit,
  isLoading = false,
  error = '',
  submitButtonText,
  fields
}: UserInfoFormProps) {
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false)

  const showBasicFields = fields === 'all' || fields === 'basic'
  const showCardFields = fields === 'all' || fields === 'card'

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* 기본 정보 필드 */}
      {showBasicFields && (
        <>
          {/* 닉네임 */}
          <div className="space-y-2">
            <Label htmlFor="nickname">이름 *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="nickname"
                type="text"
                placeholder="홍길동"
                value={formData.nickname}
                onChange={(e) => onChange({ ...formData, nickname: e.target.value.slice(0, 25) })}
                required
                disabled={isLoading}
                className="h-11 pl-10"
                maxLength={25}
              />
            </div>
          </div>

          {/* 성별 & 키 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="gender">성별 *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => onChange({ ...formData, gender: value })}
                required
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="성별" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">남성</SelectItem>
                  <SelectItem value="FEMALE">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showCardFields && (
              <div className="space-y-2">
                <Label htmlFor="height">키 (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  min="150"
                  max="250"
                  placeholder="180"
                  value={formData.height}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 3)
                    onChange({ ...formData, height: value })
                  }}
                  onKeyDown={(e) => {
                    // e, E, +, -, . 입력 방지
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            )}
          </div>

          {/* 활동 지역 */}
          <div className="space-y-2">
            <Label htmlFor="address">활동 지역 *</Label>
            <div
              className="relative cursor-pointer"
              onClick={() => setIsRegionModalOpen(true)}
            >
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="address"
                type="text"
                placeholder="지역을 선택하세요"
                value={formData.address}
                readOnly
                required
                disabled={isLoading}
                className="h-11 pl-10 cursor-pointer"
              />
            </div>
          </div>
        </>
      )}

      {/* 플레이어 카드 필드 */}
      {showCardFields && (
        <>
          {/* 주 포지션 & 부 포지션 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mainPosition">주 포지션 *</Label>
              <Select
                value={formData.mainPosition}
                onValueChange={(value) => onChange({ ...formData, mainPosition: value })}
                required
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="주 포지션" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUARD">가드</SelectItem>
                  <SelectItem value="FORWARD">포워드</SelectItem>
                  <SelectItem value="CENTER">센터</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subPosition">부 포지션</Label>
              <Select
                value={formData.subPosition}
                onValueChange={(value) => onChange({ ...formData, subPosition: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="선택사항" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUARD">가드</SelectItem>
                  <SelectItem value="FORWARD">포워드</SelectItem>
                  <SelectItem value="CENTER">센터</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 플레이 스타일 */}
          <div className="space-y-2">
            <Label htmlFor="playStyle">플레이 스타일 *</Label>
            <Select
              value={formData.playStyle}
              onValueChange={(value) => onChange({ ...formData, playStyle: value })}
              required
              disabled={isLoading}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="플레이 스타일 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SLASHER">돌파형 (Slasher)</SelectItem>
                <SelectItem value="SHOOTER">슈터형 (Shooter)</SelectItem>
                <SelectItem value="DEFENDER">수비형 (Defender)</SelectItem>
                <SelectItem value="PASSER">패스형 (Passer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 한 줄 소개 */}
          <div className="space-y-2">
            <Label htmlFor="statusMsg">한 줄 소개 *</Label>
            <Input
              id="statusMsg"
              type="text"
              placeholder="예: 코트 위의 전사"
              value={formData.statusMsg}
              onChange={(e) => onChange({ ...formData, statusMsg: e.target.value.slice(0, 20) })}
              required
              disabled={isLoading}
              className="h-11"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {formData.statusMsg.length}/20자
            </p>
          </div>
        </>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            처리 중...
          </div>
        ) : (
          submitButtonText
        )}
      </Button>

      {/* 지역 선택 모달 */}
      <RegionSelectModal
        open={isRegionModalOpen}
        onOpenChange={setIsRegionModalOpen}
        onSelect={(region) => onChange({ ...formData, address: region })}
      />
    </form>
  )
}

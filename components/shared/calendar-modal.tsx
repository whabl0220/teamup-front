'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function CalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
}: CalendarModalProps) {
  const [tempDate, setTempDate] = useState<Date>(selectedDate)

  const handleConfirm = () => {
    onDateSelect(tempDate)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>경기 날짜 선택</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={(date) => date && setTempDate(date)}
            locale={ko}
            initialFocus
          />

          <div className="w-full space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              선택한 날짜: {format(tempDate, 'yyyy년 M월 d일 (E)', { locale: ko })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                취소
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                확인
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

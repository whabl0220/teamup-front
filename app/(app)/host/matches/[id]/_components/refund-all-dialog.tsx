import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  refundNeededCount: number
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function RefundAllDialog({
  open,
  refundNeededCount,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>일괄 환불 처리</DialogTitle>
          <DialogDescription>
            환불 필요 대상 {refundNeededCount}명을 한 번에 환불 처리합니다. 계속 진행할까요?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting || refundNeededCount === 0}
          >
            일괄 환불 진행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

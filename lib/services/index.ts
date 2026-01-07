// 모든 서비스를 한 곳에서 export
// client.ts는 클라이언트 전용이므로 export하지 않음 (직접 import 필요)
export * from './auth'
export * from './user'
export * from './team'
export * from './matching'
export * from './coaching'
export * from './notification'
export * from './enums'

// 편의를 위한 통합 객체
export { authService } from './auth'
export { userService } from './user'
export { teamService } from './team'
export { matchingService } from './matching'
export { coachingService } from './coaching'
export { notificationService } from './notification'

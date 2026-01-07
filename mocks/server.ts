import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// 서버 환경(테스트 등)에서 MSW 설정
export const server = setupServer(...handlers)


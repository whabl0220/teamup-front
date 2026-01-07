'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production'
    const isDevelopment = process.env.NODE_ENV === 'development'
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    const allowProductionMock = process.env.NEXT_PUBLIC_ALLOW_PRODUCTION_MOCK === 'true'

    // 프로덕션에서 MSW 사용 조건 확인
    if (isProduction && useMock) {
      if (allowProductionMock) {
        // 명시적으로 프로덕션에서 MSW 사용을 허용한 경우
        console.warn(
          '⚠️ [MSW] 프로덕션 환경에서 Mock 모드가 활성화되었습니다. 백엔드 API가 준비되면 즉시 비활성화하세요.'
        )
        const initMsw = async () => {
          const { worker } = await import('@/mocks/browser')
          await worker.start({
            onUnhandledRequest: 'bypass',
          })
          console.log('[MSW] Mocking enabled in production mode (temporary).')
          setMswReady(true)
        }
        initMsw()
        return
      } else {
        // 프로덕션에서 MSW 사용 시도했지만 허용되지 않은 경우
        console.warn(
          '⚠️ MSW는 프로덕션 환경에서 기본적으로 비활성화됩니다. ' +
          '임시로 프로덕션에서 MSW를 사용하려면 NEXT_PUBLIC_ALLOW_PRODUCTION_MOCK=true를 추가하세요. ' +
          '(백엔드 API가 준비되면 즉시 제거하세요)'
        )
        setMswReady(true)
        return
      }
    }

    // 개발 환경에서 MSW 활성화
    if (isDevelopment && useMock) {
      const initMsw = async () => {
        const { worker } = await import('@/mocks/browser')
        await worker.start({
          onUnhandledRequest: 'bypass', // MSW가 처리하지 않는 요청은 그대로 통과
        })
        console.log('[MSW] Mocking enabled in development mode.')
        setMswReady(true)
      }
      initMsw()
    } else {
      // MSW를 사용하지 않으면 바로 준비 완료
      setMswReady(true)
    }
  }, [])

  // MSW가 준비될 때까지 로딩
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  const allowProductionMock = process.env.NEXT_PUBLIC_ALLOW_PRODUCTION_MOCK === 'true'
  
  const shouldWaitForMsw = 
    (isDevelopment && useMock) || 
    (isProduction && useMock && allowProductionMock)
  
  if (!mswReady && shouldWaitForMsw) {
    return null
  }

  return <>{children}</>
}


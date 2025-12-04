'use client'

import { Map, MapMarker } from 'react-kakao-maps-sdk'
import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import useKakaoLoader from '@/hooks/useKakaoLoader'

export interface MarkerData {
  id: string
  lat: number
  lng: number
  title?: string
  type?: 'post' | 'court' | 'user'
  postType?: 'MATCH' | 'GUEST' // 팀 매칭 vs 용병 모집
}

interface KakaoMapProps {
  className?: string
  markers?: MarkerData[]
  onMarkerClick?: (marker: MarkerData) => void
  showUserMarker?: boolean
  onLoadingChange?: (isLoading: boolean) => void
}

export default function KakaoMap({
  className = '',
  markers = [],
  onMarkerClick,
  showUserMarker = true,
  onLoadingChange
}: KakaoMapProps) {
  useKakaoLoader()

  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLoading(false)
          onLoadingChange?.(false)
        },
        () => {
          setIsLoading(false)
          onLoadingChange?.(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setIsLoading(false)
      onLoadingChange?.(false)
    }
  }, [onLoadingChange])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/30`}>
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">위치 정보 확인 중...</p>
        </div>
      </div>
    )
  }

  // 로딩 완료 후 지도 표시
  return (
    <div className={className}>
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={4}
      >
        {/* 사용자 위치 마커 */}
        {showUserMarker && (
          <MapMarker
            position={center}
            image={{
              src: '/icons/user-location-marker.svg',
              size: { width: 32, height: 32 }
            }}
          />
        )}

        {/* 데이터 마커들 */}
        {markers.map((marker) => {
          // 핀 이미지 결정
          let markerImage = undefined
          if (marker.type === 'post') {
            // 용병 모집(GUEST)은 파란 별, 팀 매칭(MATCH)은 주황 VS
            markerImage = marker.postType === 'MATCH'
              ? { src: '/icons/vs-marker.svg', size: { width: 40, height: 40 } }
              : { src: '/icons/star-marker.svg', size: { width: 52, height: 65 } }
          } else if (marker.type === 'court') {
            markerImage = { src: '/icons/basketball-marker.svg', size: { width: 48, height: 48 } }
          }

          return (
            <MapMarker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
              onClick={() => onMarkerClick?.(marker)}
              image={markerImage}
            />
          )
        })}
      </Map>
    </div>
  )
}

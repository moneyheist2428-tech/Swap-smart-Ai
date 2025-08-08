'use client'

import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Zap } from 'lucide-react'

interface MapProps {
  userLocation: {
    latitude: number
    longitude: number
    city?: string
    state?: string
  } | null
  listings: Array<{
    id: string
    title: string
    coordinates: {
      latitude: number
      longitude: number
    }
    distance: number
    isFlashSwap: boolean
    estimatedValue: number
  }>
  selectedListing: string | null
  onListingSelect: (id: string | null) => void
  maxDistance: number
}

export function InteractiveMap({ 
  userLocation, 
  listings, 
  selectedListing, 
  onListingSelect,
  maxDistance 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapSize, setMapSize] = useState({ width: 400, height: 300 })

  useEffect(() => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      setMapSize({ width: rect.width, height: rect.height })
    }
  }, [])

  if (!userLocation) {
    return (
      <div className="relative h-96 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Navigation className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Enable location to see map</p>
        </div>
      </div>
    )
  }

  // Calculate map bounds
  const allLatitudes = [userLocation.latitude, ...listings.map(l => l.coordinates.latitude)]
  const allLongitudes = [userLocation.longitude, ...listings.map(l => l.coordinates.longitude)]
  
  const minLat = Math.min(...allLatitudes) - 0.01
  const maxLat = Math.max(...allLatitudes) + 0.01
  const minLng = Math.min(...allLongitudes) - 0.01
  const maxLng = Math.max(...allLongitudes) + 0.01

  // Convert lat/lng to pixel coordinates
  const latToY = (lat: number) => {
    return ((maxLat - lat) / (maxLat - minLat)) * (mapSize.height - 40) + 20
  }

  const lngToX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * (mapSize.width - 40) + 20
  }

  return (
    <div 
      ref={mapRef}
      className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg overflow-hidden border"
    >
      {/* Grid lines for map effect */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Distance circle */}
      <svg className="absolute inset-0 w-full h-full">
        <circle
          cx={lngToX(userLocation.longitude)}
          cy={latToY(userLocation.latitude)}
          r={Math.min(mapSize.width, mapSize.height) * 0.3}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.5"
        />
      </svg>

      {/* User location */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{
          left: lngToX(userLocation.longitude),
          top: latToY(userLocation.latitude)
        }}
      >
        <div className="relative">
          <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap border">
            You are here
          </div>
        </div>
      </div>

      {/* Listing markers */}
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          style={{
            left: lngToX(listing.coordinates.longitude),
            top: latToY(listing.coordinates.latitude)
          }}
          onClick={() => onListingSelect(selectedListing === listing.id ? null : listing.id)}
        >
          <div className="relative">
            <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${
              selectedListing === listing.id 
                ? 'bg-purple-600 scale-125' 
                : listing.isFlashSwap 
                  ? 'bg-orange-600 hover:scale-110' 
                  : 'bg-green-600 hover:scale-110'
            }`}>
              {listing.isFlashSwap ? (
                <Zap className="w-4 h-4 text-white" />
              ) : (
                <MapPin className="w-4 h-4 text-white" />
              )}
            </div>
            
            {selectedListing === listing.id && (
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border min-w-48 z-30">
                <div className="text-sm font-medium mb-1 line-clamp-2">{listing.title}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>${listing.estimatedValue}</span>
                  <Badge variant="outline" className="text-xs">
                    {listing.distance.toFixed(1)}km
                  </Badge>
                </div>
                {listing.isFlashSwap && (
                  <Badge className="mt-1 text-xs bg-orange-100 text-orange-800">
                    <Zap className="w-3 h-3 mr-1" />
                    Flash Swap
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
        <div className="text-xs font-medium mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
            <span>Regular Swap</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
            <span>Flash Swap</span>
          </div>
        </div>
      </div>

      {/* Distance info */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border text-xs">
        <div>Search Radius: {maxDistance}km</div>
        <div>{listings.length} swaps found</div>
      </div>
    </div>
  )
}

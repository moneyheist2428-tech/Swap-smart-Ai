'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

type MarkerData = {
  id?: string
  position: [number, number]
  popup?: string
}

type LeafletMapProps = {
  center?: { lat: number; lng: number }
  zoom?: number
  height?: number
  markers?: MarkerData[]
  className?: string
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }
const DEFAULT_ZOOM = 13
const DEFAULT_HEIGHT = 500

export default function LeafletMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = DEFAULT_HEIGHT,
  markers = [
    { id: 'delhi', position: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], popup: 'Delhi, India - Example Marker' },
  ],
  className,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const [scriptReady, setScriptReady] = useState(false)

  // Initialize map once when script is ready
  useEffect(() => {
    if (!scriptReady) return
    if (!containerRef.current) return
    if (mapRef.current) return

    // Access global Leaflet loaded via CDN
    const L: any = (window as unknown as { L: any }).L
    if (!L) return

    // Create map
    const map = L.map(containerRef.current).setView([center.lat, center.lng], zoom)
    mapRef.current = map

    // OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © OpenStreetMap contributors',
    }).addTo(map)

    // Create a layer group for markers
    layerRef.current = L.layerGroup().addTo(map)

    // Set default marker icon from CDN (fixes missing marker in many bundlers)
    const defaultIcon = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    L.Marker.prototype.options.icon = defaultIcon

    // Initial markers
    try {
      for (const m of markers) {
        const mk = L.marker(m.position)
        if (m.popup) mk.bindPopup(m.popup)
        mk.addTo(layerRef.current)
      }
    } catch {
      // ignore marker init errors gracefully
    }

    // Cleanup on unmount
    return () => {
      try {
        map.remove()
      } catch {
        // ignore
      }
      mapRef.current = null
      layerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady])

  // Update map view when center/zoom change
  useEffect(() => {
    if (!scriptReady || !mapRef.current) return
    try {
      mapRef.current.setView([center.lat, center.lng], zoom)
    } catch {
      // ignore
    }
  }, [center.lat, center.lng, zoom, scriptReady])

  // Update markers on change
  useEffect(() => {
    if (!scriptReady || !mapRef.current || !layerRef.current) return
    const L: any = (window as unknown as { L: any }).L
    if (!L) return

    try {
      // Clear previous markers
      layerRef.current.clearLayers()
      // Add new markers
      for (const m of markers) {
        const mk = L.marker(m.position)
        if (m.popup) mk.bindPopup(m.popup)
        mk.addTo(layerRef.current)
      }
    } catch {
      // ignore
    }
  }, [markers, scriptReady])

  const style: React.CSSProperties = {
    width: '100%',
    height: typeof height === 'number' ? height : DEFAULT_HEIGHT,
  }

  return (
    <div className={className ? className : 'rounded-md border'}>
      {/* Load Leaflet CSS via CDN so no npm module resolution is needed */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        // Basic integrity/crossorigin is optional here
      />
      {/* Load Leaflet JS via CDN only on the client. onReady fires on mount and remounts. */}
      <Script
        id="leaflet-cdn"
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        style={style}
        role="region"
        aria-label="Map"
        className="w-full"
      />
      {!scriptReady && (
        <div className="p-3 text-sm text-muted-foreground" aria-live="polite">
          Loading map...
        </div>
      )}
    </div>
  )
}

'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

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

// Use CDN icon assets to fix Next.js Leaflet marker issue
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function LeafletMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = DEFAULT_HEIGHT,
  markers = [
    { id: 'delhi', position: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], popup: 'Delhi, India - Example Marker' },
  ],
  className,
}: LeafletMapProps) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(L.Marker as any).prototype.options.icon = DefaultIcon
  }, [])

  // Only standard CSS properties are used; no custom properties to avoid runtime errors
  const style: React.CSSProperties = { width: '100%', height: typeof height === 'number' ? height : DEFAULT_HEIGHT }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom
      style={style}
      className={className ? className : 'rounded-md border'}
    >
      <TileLayer
        attribution={'Map data © OpenStreetMap contributors'}
        url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
      />
      {markers.map((m) => (
        <Marker key={m.id ?? `${m.position[0]}-${m.position[1]}`} position={m.position}>
          {m.popup ? <Popup>{m.popup}</Popup> : null}
        </Marker>
      ))}
    </MapContainer>
  )
}

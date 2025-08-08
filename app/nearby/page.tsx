'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Filter, Loader2, RefreshCw, Zap, Navigation } from 'lucide-react'
import LeafletMap from '@/components/leaflet-map'

type Location = { latitude: number; longitude: number; city?: string; state?: string }

const mockNearbyListings = [
  {
    id: '1',
    title: 'MacBook Pro M2 for Gaming Setup',
    category: 'Electronics',
    coordinates: { latitude: 28.6448, longitude: 77.216721 }, // near Delhi
    distance: 2.3,
    isFlashSwap: false,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'URGENT: iPhone 15 Pro for Android',
    category: 'Electronics',
    coordinates: { latitude: 28.6239, longitude: 77.209 },
    distance: 3.1,
    isFlashSwap: true,
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdAt: '2024-01-16',
  },
]

export default function NearbySwapsPage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [listings, setListings] = useState(mockNearbyListings)
  const [filteredListings, setFilteredListings] = useState(mockNearbyListings)
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState('')
  const [maxDistance, setMaxDistance] = useState(10)
  const [flashSwapsOnly, setFlashSwapsOnly] = useState(false)
  const [showMap, setShowMap] = useState(true)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [maxDistance, flashSwapsOnly, listings])

  const getCurrentLocation = async () => {
    setLoading(true)
    setLocationError('')
    try {
      if (!('geolocation' in navigator)) {
        setUserLocation({ latitude: 28.6139, longitude: 77.209, city: 'Delhi', state: 'Delhi' })
      } else {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                city: 'Your location',
                state: '',
              })
              resolve()
            },
            () => {
              setUserLocation({ latitude: 28.6139, longitude: 77.209, city: 'Delhi', state: 'Delhi' })
              resolve()
            },
            { enableHighAccuracy: true, timeout: 8000 }
          )
        })
      }
    } catch (e: any) {
      setLocationError(e?.message || 'Failed to get location')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...listings]
    filtered = filtered.filter((l) => l.distance <= maxDistance)
    if (flashSwapsOnly) filtered = filtered.filter((l) => l.isFlashSwap)
    setFilteredListings(filtered)
  }

  const urgencyBadge = (expiresAt: Date) => {
    const timeLeft = expiresAt.getTime() - Date.now()
    const hoursLeft = timeLeft / (1000 * 60 * 60)
    if (hoursLeft <= 2) return 'text-red-600 bg-red-50 border border-red-200'
    if (hoursLeft <= 6) return 'text-orange-600 bg-orange-50 border border-orange-200'
    return 'text-yellow-600 bg-yellow-50 border border-yellow-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Getting your location...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Nearby Swaps</h1>
              <p className="text-muted-foreground">
                {userLocation ? (
                  <>Showing swaps near {userLocation.city || 'your area'}</>
                ) : (
                  'Enable location to see nearby swaps'
                )}
              </p>
            </div>
            <Button variant="outline" onClick={getCurrentLocation} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Location
            </Button>
          </div>

          {locationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {locationError}
                <Button variant="link" className="p-0 h-auto ml-2" onClick={getCurrentLocation}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-8">
          <div className="w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Max Distance: {maxDistance}km</Label>
                  <Slider value={[maxDistance]} onValueChange={(v) => setMaxDistance(v[0])} max={50} min={1} step={1} />
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredListings.length} swaps within {maxDistance}km
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="flashOnly">Flash Swaps Only</Label>
                    <p className="text-sm text-muted-foreground">Show only time-limited swaps</p>
                  </div>
                  <Switch id="flashOnly" checked={flashSwapsOnly} onCheckedChange={setFlashSwapsOnly} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showMap">Show Map</Label>
                    <p className="text-sm text-muted-foreground">Display location map</p>
                  </div>
                  <Switch id="showMap" checked={showMap} onCheckedChange={setShowMap} />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMaxDistance(10)
                    setFlashSwapsOnly(false)
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Nearby</span>
                  <span className="font-medium">{filteredListings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Flash Swaps</span>
                  <span className="font-medium text-orange-600">
                    {filteredListings.filter((l) => l.isFlashSwap).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Distance</span>
                  <span className="font-medium">
                    {filteredListings.length > 0
                      ? (filteredListings.reduce((sum, l) => sum + l.distance, 0) / filteredListings.length).toFixed(1)
                      : 0}
                    km
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            {showMap && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Map</CardTitle>
                  <CardDescription>Your location and nearby swaps (OpenStreetMap)</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeafletMap
                    center={{
                      lat: userLocation?.latitude ?? 28.6139,
                      lng: userLocation?.longitude ?? 77.209,
                    }}
                    zoom={13}
                    height={500}
                    markers={[
                      userLocation
                        ? {
                            id: 'you',
                            position: [userLocation.latitude, userLocation.longitude],
                            popup: 'You are here',
                          }
                        : {
                            id: 'delhi',
                            position: [28.6139, 77.209],
                            popup: 'Delhi, India - Example Marker',
                          },
                      ...filteredListings.map((l) => ({
                        id: l.id,
                        position: [l.coordinates.latitude, l.coordinates.longitude] as [number, number],
                        popup: `${l.title} • ${l.distance.toFixed(1)}km`,
                      })),
                    ]}
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {filteredListings.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Navigation className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No nearby swaps found</h3>
                    <p className="text-muted-foreground mb-4">Try increasing your search radius or check back later</p>
                    <Button variant="outline" onClick={() => setMaxDistance(50)}>
                      Expand Search to 50km
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredListings.map((l) => (
                  <Card key={l.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">{l.title}</div>
                        <div className="text-sm text-muted-foreground">{l.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {l.isFlashSwap && l['expiresAt'] ? (
                          <span className={`px-2 py-1 rounded ${urgencyBadge(l['expiresAt'] as Date)}`}>
                            <Zap className="inline h-3 w-3 mr-1" />
                            Flash
                          </span>
                        ) : null}
                        <Button asChild variant="secondary" size="sm">
                          <a href={`/swap/${l.id}`}>View</a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

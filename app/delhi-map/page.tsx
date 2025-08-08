'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LeafletMap from '@/components/leaflet-map'

export default function DelhiMapPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Leaflet + OpenStreetMap (Delhi)</CardTitle>
          </CardHeader>
          <CardContent>
            <LeafletMap />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

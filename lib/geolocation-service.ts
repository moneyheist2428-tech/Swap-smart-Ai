export interface Location {
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}

export class GeolocationService {
  static async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Call server route to reverse geocode; do NOT use env vars in client
            const params = new URLSearchParams({
              lat: String(latitude),
              lng: String(longitude),
            })
            const res = await fetch(`/api/geocode/reverse?${params.toString()}`, {
              method: 'GET',
              cache: 'no-store',
            })
            if (!res.ok) {
              resolve({ latitude, longitude })
              return
            }
            const data = await res.json()
            resolve({
              latitude,
              longitude,
              city: data?.city,
              state: data?.state,
              country: data?.country,
            })
          } catch {
            resolve({ latitude, longitude })
          }
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      )
    })
  }

  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in kilometers
    return d
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

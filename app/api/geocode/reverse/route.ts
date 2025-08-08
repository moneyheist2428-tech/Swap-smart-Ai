import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat/lng' },
        { status: 400 }
      )
    }

    const key =
      process.env.OPENCAGE_API_KEY ||
      process.env.NEXT_PUBLIC_OPENCAGE_API_KEY // fallback for current env; not exposed to client here

    if (!key) {
      // Graceful degrade: return minimal info without reverse geocoding
      return NextResponse.json(
        { city: undefined, state: undefined, country: undefined },
        { status: 200 }
      )
    }

    const url = new URL('https://api.opencagedata.com/geocode/v1/json')
    url.searchParams.set('q', `${lat}+${lng}`)
    url.searchParams.set('key', key)
    url.searchParams.set('no_annotations', '1')
    url.searchParams.set('language', 'en')

    const resp = await fetch(url.toString(), { cache: 'no-store' })
    if (!resp.ok) {
      return NextResponse.json(
        { error: 'Reverse geocoding failed' },
        { status: resp.status }
      )
    }
    const data = await resp.json()

    const components = data?.results?.[0]?.components || {}
    const city = components.city || components.town || components.village
    const state = components.state
    const country = components.country

    return NextResponse.json({ city, state, country })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}

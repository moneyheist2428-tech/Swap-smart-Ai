import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'

export async function GET() {
  try {
    // Prefer fetching on the server to avoid bundling DB/client code in the browser.
    const listings = await DatabaseService.getListings()
    return NextResponse.json(listings, { status: 200 })
  } catch (err: any) {
    console.error('API /listings error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

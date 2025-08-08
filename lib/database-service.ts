import { supabase, createServerClient, getBrowserClient } from './supabase'
import type { SwapListing, User } from './types'

export class DatabaseService {
private static getClient() {
  if (typeof window === 'undefined') {
    return createServerClient()
  }
  return getBrowserClient()
}

// Create listing — should be called from a Server Action or Route Handler
static async createListing(listingData: Partial<SwapListing>, userId: string): Promise<SwapListing> {
  const client = this.getClient()

  const { data, error } = await client
    .from('swap_listings')
    .insert({
      user_id: userId,
      title: listingData.title,
      description: listingData.description,
      category: listingData.category,
      subcategory: listingData.subcategory,
      images: listingData.images || [],
      estimated_value: (listingData as any).estimatedValue ?? (listingData as any).estimated_value,
      condition: listingData.condition,
      location: listingData.location,
      latitude: (listingData as any).coordinates?.latitude ?? (listingData as any).latitude,
      longitude: (listingData as any).coordinates?.longitude ?? (listingData as any).longitude,
      wanted_items: (listingData as any).wantedItems || (listingData as any).wanted_items || [],
      status: listingData.status || 'active',
      is_flash_swap: (listingData as any).isFlashSwap ?? (listingData as any).is_flash_swap ?? false,
      expires_at: (listingData as any).expiresAt ?? (listingData as any).expires_at,
      ai_description: (listingData as any).aiDescription ?? (listingData as any).ai_description,
      ai_tags: (listingData as any).aiTags ?? (listingData as any).ai_tags ?? [],
    })
    .select('*')
    .single()

  if (error) {
    console.error('Database error (createListing):', error)
    throw new Error('Failed to create listing')
  }

  return data as any
}

static async getListings(filters?: {
  category?: string
  location?: string
  maxDistance?: number
  userLocation?: { latitude: number; longitude: number }
  flashSwapsOnly?: boolean
}): Promise<SwapListing[]> {
  const client = this.getClient()

  let query = client
    .from('swap_listings')
    .select(`
      *,
      users:users (
        id,
        name,
        avatar_url,
        rating,
        verified
      )
    `)
    .eq('status', 'active')

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.flashSwapsOnly) {
    query = query.eq('is_flash_swap', true)
  }

  // Keep only non-expired flash swaps or non-flash listings
  // Supabase 'or' expects comma-separated filters
  query = query.or(
    `is_flash_swap.eq.false,expires_at.gt.${new Date().toISOString()}`
  )

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Database error (getListings):', error)
    throw new Error('Failed to fetch listings')
  }

  return (data || []) as any
}

static async getListingById(id: string): Promise<SwapListing | null> {
  const supabase = this.getClient()

  // If id looks like a UUID, query by id. Otherwise, treat as 1-based index.
  const looksLikeUUID = /^[0-9a-fA-F-]{36}$/.test(id)

  if (looksLikeUUID) {
    const { data, error } = await supabase
      .from('swap_listings')
      .select(`
        *,
        users (
          id,
          name,
          avatar_url,
          rating,
          verified,
          total_swaps,
          badges
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error (getListingById):', error)
      return null
    }

    return data as any
  }

  // Numeric path: /swap/2 => second listing by created_at ascending
  const numeric = Number(id)
  if (Number.isFinite(numeric) && numeric > 0) {
    const from = numeric - 1
    const to = numeric - 1
    const { data, error } = await supabase
      .from('swap_listings')
      .select(`
        *,
        users (
          id,
          name,
          avatar_url,
          rating,
          verified,
          total_swaps,
          badges
        )
      `)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('Database error (getListingById range):', error)
      return null
    }
    if (data && data.length > 0) return data[0] as any
    return null
  }

  // Fallback: not uuid and not numeric
  return null
}

static async getUserListings(userId: string): Promise<SwapListing[]> {
  const client = this.getClient()

  const { data, error } = await client
    .from('swap_listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Database error (getUserListings):', error)
    throw new Error('Failed to fetch user listings')
  }

  return (data || []) as any
}

// Should be called from a Server Action/Route Handler to use service role if RLS requires it
static async updateUser(userId: string, userData: Partial<User>): Promise<User> {
  const client = this.getClient()

  const { data, error } = await client
    .from('users')
    .update({
      name: userData.name,
      bio: (userData as any).bio,
      phone: (userData as any).phone,
      avatar_url: (userData as any).avatar ?? (userData as any).avatar_url,
      latitude: (userData as any).location?.latitude ?? (userData as any).latitude,
      longitude: (userData as any).location?.longitude ?? (userData as any).longitude,
      city: (userData as any).location?.city ?? (userData as any).city,
      state: (userData as any).location?.state ?? (userData as any).state,
    })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    console.error('Database error (updateUser):', error)
    throw new Error('Failed to update user')
  }

  return data as any
}

static async getUserById(userId: string): Promise<User | null> {
  const client = this.getClient()

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Database error (getUserById):', error)
    return null
  }

  return data as any
}
}

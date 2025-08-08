'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Star, MapPin, Zap, Filter } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Listing = {
  id: string
  title: string
  description: string
  category: string
  images?: string[] | null
  estimated_value?: number | null
  location?: string | null
  is_flash_swap?: boolean | null
  expires_at?: string | null
  created_at: string
  users?: {
    name?: string | null
    avatar_url?: string | null
    rating?: number | null
  } | null
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadListings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, categoryFilter, sortBy, listings])

  const loadListings = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch via server API to avoid importing server-only code into client bundle
      const res = await fetch('/api/listings', { cache: 'no-store' })
      if (!res.ok) {
        const { error: apiError } = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(apiError || 'Failed to load listings')
      }
      const data = await res.json()
      setListings(data as Listing[])
      setFilteredListings(data as Listing[])
    } catch (err: any) {
      console.error('Failed to load listings:', err)
      setError(err?.message || 'Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...listings]

    if (searchQuery.trim()) {
      filtered = filtered.filter((listing) =>
        (listing.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(listing =>
        String(listing.category || '').toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'price-high':
        filtered.sort((a, b) => (Number(b.estimated_value || 0) - Number(a.estimated_value || 0)))
        break
      case 'price-low':
        filtered.sort((a, b) => (Number(a.estimated_value || 0) - Number(b.estimated_value || 0)))
        break
    }

    setFilteredListings(filtered)
  }

  const calculateTimeRemaining = (expiresAt?: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const timeLeft = new Date(expiresAt).getTime() - now.getTime()
    if (timeLeft <= 0) return 'Expired'
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Swap Listings</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search listings"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48" aria-label="Filter by category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="collectibles">Collectibles</SelectItem>
                <SelectItem value="books & media">Books & Media</SelectItem>
                <SelectItem value="art & design">Art & Design</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48" aria-label="Sort listings">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4" role="alert">Error: {error}</p>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground mb-4" aria-live="polite">Loading listings...</p>
          )}
          {!loading && !error && (
            <p className="text-muted-foreground">
              Showing {filteredListings.length} of {listings.length} listings
            </p>
          )}
        </div>

        <div className="grid gap-6">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow ${
                listing.is_flash_swap ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''
              }`}
            >
              <div className="flex">
                <div className="relative w-48 h-32">
                  <Image
                    src={(listing.images?.[0] as string) || "/placeholder.svg?height=200&width=300&query=listing-image"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 left-2 capitalize">{listing.category}</Badge>
                  {listing.is_flash_swap && listing.expires_at && (
                    <Badge className="absolute top-2 right-2 bg-orange-600">
                      <Zap className="h-3 w-3 mr-1" />
                      {calculateTimeRemaining(listing.expires_at)}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold line-clamp-1">{listing.title}</h3>
                    <span className="text-lg font-bold text-green-600">
                      ${Number(listing.estimated_value || 0)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={listing.users?.avatar_url || "/placeholder.svg?height=40&width=40&query=user-avatar"}
                          alt={listing.users?.name || 'User avatar'}
                        />
                        <AvatarFallback aria-hidden="true">
                          {(listing.users?.name || 'U')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{listing.users?.name || 'User'}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-xs text-muted-foreground">
                            {listing.users?.rating ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {listing.location || '—'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                    <Button asChild>
                      <Link href={`/swap/${listing.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

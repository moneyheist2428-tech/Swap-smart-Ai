'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Search, Filter, MapPin, Star, Sparkles, SlidersHorizontal, Clock, Zap, Navigation } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { GeminiService } from '@/lib/gemini-service'
import { GeolocationService } from '@/lib/geolocation-service'

const mockListings = [
  {
    id: '1',
    title: 'MacBook Pro M2 for Gaming Setup',
    description: 'Trading my 2022 MacBook Pro for a complete gaming setup with RTX 4070',
    category: 'Electronics',
    images: ['/placeholder.svg?height=200&width=300&text=MacBook+Pro'],
    user: { name: 'Alex Chen', avatar: '/placeholder.svg?height=40&width=40&text=AC', rating: 4.9 },
    estimatedValue: 2500,
    location: 'San Francisco, CA',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    wantedItems: ['Gaming PC', 'RTX 4070', 'Gaming Setup'],
    createdAt: '2024-01-15',
    isFlashSwap: false,
    expiresAt: null
  },
  {
    id: '2',
    title: 'URGENT: iPhone 15 Pro for Android Phone',
    description: 'Need to swap ASAP! Brand new iPhone 15 Pro for latest Android flagship',
    category: 'Electronics',
    images: ['/placeholder.svg?height=200&width=300&text=iPhone+15+Pro'],
    user: { name: 'Emma Davis', avatar: '/placeholder.svg?height=40&width=40&text=ED', rating: 4.9 },
    estimatedValue: 1200,
    location: 'San Francisco, CA',
    coordinates: { latitude: 37.7849, longitude: -122.4094 },
    wantedItems: ['Samsung Galaxy S24', 'Google Pixel 8', 'Android Phone'],
    createdAt: '2024-01-15',
    isFlashSwap: true,
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000) // 18 hours from now
  },
  {
    id: '3',
    title: 'Web Development Services for Logo Design',
    description: 'Full-stack web development (React/Node.js) in exchange for professional branding package',
    category: 'Services',
    images: ['/placeholder.svg?height=200&width=300&text=Web+Development'],
    user: { name: 'Sarah Kim', avatar: '/placeholder.svg?height=40&width=40&text=SK', rating: 4.8 },
    estimatedValue: 1200,
    location: 'Remote',
    coordinates: null,
    wantedItems: ['Logo Design', 'Branding', 'Graphic Design'],
    createdAt: '2024-01-14',
    isFlashSwap: false,
    expiresAt: null
  },
  {
    id: '4',
    title: 'Flash Sale: Gaming Laptop for MacBook',
    description: 'High-end gaming laptop with RTX 4080. Need MacBook for work. Expires in 6 hours!',
    category: 'Electronics',
    images: ['/placeholder.svg?height=200&width=300&text=Gaming+Laptop'],
    user: { name: 'Mike Johnson', avatar: '/placeholder.svg?height=40&width=40&text=MJ', rating: 4.7 },
    estimatedValue: 2800,
    location: 'San Francisco, CA',
    coordinates: { latitude: 37.7649, longitude: -122.4294 },
    wantedItems: ['MacBook Pro', 'MacBook Air', 'Apple Laptop'],
    createdAt: '2024-01-15',
    isFlashSwap: true,
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours from now
  }
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filteredListings, setFilteredListings] = useState(mockListings)
  const [loading, setLoading] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<any>(null)
  
  // Filter states
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('newest')
  const [nearbyOnly, setNearbyOnly] = useState(false)
  const [maxDistance, setMaxDistance] = useState(20) // km
  const [flashSwapsOnly, setFlashSwapsOnly] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    getCurrentLocation()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [category, location, priceRange, sortBy, nearbyOnly, maxDistance, flashSwapsOnly, userLocation])

  const getCurrentLocation = async () => {
    try {
      const location = await GeolocationService.getCurrentLocation()
      setUserLocation(location)
    } catch (error) {
      console.error('Location error:', error)
    }
  }

  const calculateTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const timeLeft = expiresAt.getTime() - now.getTime()
    
    if (timeLeft <= 0) return 'Expired'
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`
    }
    return `${minutes}m left`
  }

  const getUrgencyColor = (expiresAt: Date) => {
    const now = new Date()
    const timeLeft = expiresAt.getTime() - now.getTime()
    const hoursLeft = timeLeft / (1000 * 60 * 60)
    
    if (hoursLeft <= 2) return 'text-red-600 bg-red-50 border-red-200'
    if (hoursLeft <= 6) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setFilteredListings(mockListings)
      return
    }

    setLoading(true)
    setAiProcessing(true)

    try {
      // Use Gemini to parse the search query
      const aiResults = await GeminiService.searchListings(query)
      
      // Filter listings based on AI-parsed keywords and categories
      const filtered = mockListings.filter(listing => {
        const titleMatch = aiResults.keywords.some(keyword => 
          listing.title.toLowerCase().includes(keyword.toLowerCase())
        )
        const descriptionMatch = aiResults.keywords.some(keyword => 
          listing.description.toLowerCase().includes(keyword.toLowerCase())
        )
        const categoryMatch = aiResults.categories.some(cat => 
          listing.category.toLowerCase().includes(cat.toLowerCase())
        )
        const wantedItemsMatch = aiResults.keywords.some(keyword => 
          listing.wantedItems.some(item => 
            item.toLowerCase().includes(keyword.toLowerCase())
          )
        )

        return titleMatch || descriptionMatch || categoryMatch || wantedItemsMatch
      })

      setFilteredListings(filtered)
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to simple text search
      const filtered = mockListings.filter(listing =>
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredListings(filtered)
    } finally {
      setLoading(false)
      setAiProcessing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...mockListings]

    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (category && category !== 'all') {
      filtered = filtered.filter(listing => 
        listing.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Apply location filter
    if (location) {
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Apply nearby filter
    if (nearbyOnly && userLocation) {
      filtered = filtered.filter(listing => {
        if (!listing.coordinates) return false
        const distance = GeolocationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          listing.coordinates.latitude,
          listing.coordinates.longitude
        )
        return distance <= maxDistance
      })
    }

    // Apply flash swaps filter
    if (flashSwapsOnly) {
      filtered = filtered.filter(listing => listing.isFlashSwap)
    }

    // Filter out expired flash swaps
    filtered = filtered.filter(listing => {
      if (listing.isFlashSwap && listing.expiresAt) {
        return new Date() < listing.expiresAt
      }
      return true
    })

    // Apply price range filter
    filtered = filtered.filter(listing => 
      listing.estimatedValue >= priceRange[0] && listing.estimatedValue <= priceRange[1]
    )

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'price-high':
        filtered.sort((a, b) => b.estimatedValue - a.estimatedValue)
        break
      case 'price-low':
        filtered.sort((a, b) => a.estimatedValue - b.estimatedValue)
        break
      case 'rating':
        filtered.sort((a, b) => b.user.rating - a.user.rating)
        break
      case 'distance':
        if (userLocation) {
          filtered.sort((a, b) => {
            if (!a.coordinates || !b.coordinates) return 0
            const distanceA = GeolocationService.calculateDistance(
              userLocation.latitude, userLocation.longitude,
              a.coordinates.latitude, a.coordinates.longitude
            )
            const distanceB = GeolocationService.calculateDistance(
              userLocation.latitude, userLocation.longitude,
              b.coordinates.latitude, b.coordinates.longitude
            )
            return distanceA - distanceB
          })
        }
        break
      case 'expiring':
        filtered.sort((a, b) => {
          if (!a.isFlashSwap && !b.isFlashSwap) return 0
          if (!a.isFlashSwap) return 1
          if (!b.isFlashSwap) return -1
          if (!a.expiresAt || !b.expiresAt) return 0
          return a.expiresAt.getTime() - b.expiresAt.getTime()
        })
        break
    }

    setFilteredListings(filtered)
  }

  const getDistanceText = (listing: any) => {
    if (!userLocation || !listing.coordinates) return null
    
    const distance = GeolocationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      listing.coordinates.latitude,
      listing.coordinates.longitude
    )
    
    return distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Swaps</h1>
          
          <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Try: 'iPhone for Android' or 'web design for logo'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
              {aiProcessing && (
                <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-blue-600" />
              )}
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="nearbyOnly"
                checked={nearbyOnly}
                onCheckedChange={setNearbyOnly}
                disabled={!userLocation}
              />
              <Label htmlFor="nearbyOnly" className="text-sm">
                <Navigation className="inline h-4 w-4 mr-1" />
                Nearby Only ({maxDistance}km)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="flashSwapsOnly"
                checked={flashSwapsOnly}
                onCheckedChange={setFlashSwapsOnly}
              />
              <Label htmlFor="flashSwapsOnly" className="text-sm">
                <Zap className="inline h-4 w-4 mr-1" />
                Flash Swaps Only
              </Label>
            </div>
          </div>

          {searchQuery && (
            <p className="text-muted-foreground">
              {aiProcessing ? (
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  AI is analyzing your search...
                </span>
              ) : (
                `Found ${filteredListings.length} results for "${searchQuery}"`
              )}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
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
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="collectibles">Collectibles</SelectItem>
                        <SelectItem value="books">Books & Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="City, State or Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  {nearbyOnly && (
                    <div className="space-y-2">
                      <Label>Max Distance: {maxDistance}km</Label>
                      <Slider
                        value={[maxDistance]}
                        onValueChange={(value) => setMaxDistance(value[0])}
                        max={100}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000}
                      step={50}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        {userLocation && <SelectItem value="distance">Nearest First</SelectItem>}
                        <SelectItem value="expiring">Expiring Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setCategory('')
                      setLocation('')
                      setPriceRange([0, 5000])
                      setSortBy('newest')
                      setNearbyOnly(false)
                      setFlashSwapsOnly(false)
                      setMaxDistance(20)
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {filteredListings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('')
                    setFilteredListings(mockListings)
                  }}>
                    Show All Listings
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    listing.isFlashSwap ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''
                  }`}>
                    <div className="flex">
                      <div className="relative w-48 h-32">
                        <Image
                          src={listing.images[0] || "/placeholder.svg"}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                        <Badge className="absolute top-2 left-2">{listing.category}</Badge>
                        {listing.isFlashSwap && listing.expiresAt && (
                          <Badge className={`absolute top-2 right-2 ${getUrgencyColor(listing.expiresAt)}`}>
                            <Zap className="h-3 w-3 mr-1" />
                            {calculateTimeRemaining(listing.expiresAt)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold line-clamp-1 flex items-center">
                            {listing.isFlashSwap && <Zap className="h-4 w-4 mr-2 text-orange-600" />}
                            {listing.title}
                          </h3>
                          <span className="text-lg font-bold text-green-600">${listing.estimatedValue}</span>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={listing.user.avatar || "/placeholder.svg"} alt={listing.user.name} />
                              <AvatarFallback>{listing.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{listing.user.name}</p>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-xs text-muted-foreground">{listing.user.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            <div className="text-right">
                              <div>{listing.location}</div>
                              {getDistanceText(listing) && (
                                <div className="text-xs text-blue-600">{getDistanceText(listing)}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-sm text-muted-foreground mr-2">Wants:</span>
                            {listing.wantedItems.slice(0, 2).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {listing.wantedItems.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{listing.wantedItems.length - 2} more
                              </Badge>
                            )}
                          </div>
                          <Button asChild>
                            <Link href={`/swap/${listing.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useMemo } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Star, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Reuse the same mock data shape from search/listings
const mockListings = [
  {
    id: '1',
    title: 'MacBook Pro M2 for Gaming Setup',
    description: 'Trading my 2022 MacBook Pro for a complete gaming setup with RTX 4070',
    category: 'Electronics',
    images: ['/macbook-pro-product-photo.png'],
    user: { name: 'Alex Chen', avatar: '/generic-animal-crossing-inspired-avatar.png', rating: 4.9 },
    estimatedValue: 2500,
    location: 'San Francisco, CA',
    isFlashSwap: false,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'URGENT: iPhone 15 Pro for Android Phone',
    description: 'Need to swap ASAP! Brand new iPhone 15 Pro for latest Android flagship',
    category: 'Electronics',
    images: ['/iphone-15-pro.png'],
    user: { name: 'Emma Davis', avatar: '/ed-avatar.png', rating: 4.9 },
    estimatedValue: 1200,
    location: 'San Francisco, CA',
    isFlashSwap: true,
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    title: 'Web Development Services for Logo Design',
    description: 'Full-stack web development (React/Node.js) in exchange for professional branding package',
    category: 'Services',
    images: ['/web-development-illustration.png'],
    user: { name: 'Sarah Kim', avatar: '/generic-avatar.png', rating: 4.8 },
    estimatedValue: 1200,
    location: 'Remote',
    isFlashSwap: false,
    createdAt: '2024-01-14'
  },
  {
    id: '4',
    title: 'Vintage Art Prints',
    description: 'Classic art prints in excellent condition',
    category: 'Art & Design',
    images: ['/placeholder-f197i.png'],
    user: { name: 'Mike Johnson', avatar: '/mj-inspired-avatar.png', rating: 4.7 },
    estimatedValue: 400,
    location: 'New York, NY',
    isFlashSwap: false,
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Gaming Laptop for Trade',
    description: 'RTX 4080 gaming laptop in like-new condition',
    category: 'Gaming',
    images: ['/gaming-laptop.png'],
    user: { name: 'Chris Ray', avatar: '/critical-role-inspired-avatar.png', rating: 4.6 },
    estimatedValue: 2200,
    location: 'Remote',
    isFlashSwap: false,
    createdAt: '2024-01-10'
  },
  {
    id: '6',
    title: 'Books & Media Bundle',
    description: 'Collection of programming books and design magazines',
    category: 'Books & Media',
    images: ['/placeholder.svg?height=200&width=300'],
    user: { name: 'Jane Doe', avatar: '/placeholder.svg?height=40&width=40', rating: 4.5 },
    estimatedValue: 180,
    location: 'Remote',
    isFlashSwap: false,
    createdAt: '2024-01-09'
  }
]

function normalize(slug: string) {
  return decodeURIComponent(slug).replace(/\+/g, ' ').replace(/-/g, ' ').toLowerCase()
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const normalized = normalize(params.slug)
  const title = normalized.replace(/\b\w/g, (c) => c.toUpperCase())
  const filtered = useMemo(() => {
    return mockListings.filter(l => l.category.toLowerCase() === title.toLowerCase())
  }, [title])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>

        {filtered.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No items found in {title}. Check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filtered.map((listing) => (
              <Card key={listing.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${listing.isFlashSwap ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''}`}>
                <div className="flex">
                  <div className="relative w-48 h-32">
                    <Image
                      src={listing.images[0] || "/placeholder.svg"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2">{listing.category}</Badge>
                    {listing.isFlashSwap && (
                      <Badge className="absolute top-2 right-2 bg-orange-600">
                        <Zap className="h-3 w-3 mr-1" />
                        Flash
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold line-clamp-1">{listing.title}</h3>
                      <span className="text-lg font-bold text-green-600">${listing.estimatedValue}</span>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>
                    
                    <div className="flex items-center justify-between">
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
                        {listing.location}
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
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
  )
}

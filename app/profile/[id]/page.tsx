'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Star, MapPin, Calendar, Shield, TrendingUp, Package, MessageCircle, Flag } from 'lucide-react'
import Image from 'next/image'

const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatar: '/placeholder.svg?height=120&width=120&text=AC',
  bio: 'Tech enthusiast and gadget collector. Love swapping electronics and finding unique items! Always looking for fair trades and building lasting connections in the swap community.',
  location: 'San Francisco, CA',
  verified: true,
  rating: 4.9,
  totalSwaps: 15,
  trustScore: 92,
  badges: ['Verified Swapper', 'Tech Expert', 'Top Trader'],
  joinDate: '2023-06-15',
  lastActive: '2024-01-15'
}

const mockListings = [
  {
    id: '1',
    title: 'MacBook Pro M2 for Gaming Setup',
    description: 'Trading my 2022 MacBook Pro for a complete gaming setup',
    category: 'Electronics',
    images: ['/placeholder.svg?height=200&width=300&text=MacBook+Pro'],
    estimatedValue: 2500,
    status: 'active',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'iPhone 14 Pro for Android Phone',
    description: 'Looking to switch to Android ecosystem',
    category: 'Electronics',
    images: ['/placeholder.svg?height=200&width=300&text=iPhone+14'],
    estimatedValue: 1000,
    status: 'completed',
    createdAt: '2024-01-05'
  }
]

const mockReviews = [
  {
    id: '1',
    reviewer: {
      name: 'Sarah Kim',
      avatar: '/placeholder.svg?height=40&width=40&text=SK'
    },
    rating: 5,
    comment: 'Excellent communication and very professional. The MacBook was exactly as described and the swap went smoothly!',
    swapItem: 'MacBook Pro M2',
    date: '2024-01-12'
  },
  {
    id: '2',
    reviewer: {
      name: 'Mike Johnson',
      avatar: '/placeholder.svg?height=40&width=40&text=MJ'
    },
    rating: 5,
    comment: 'Great swapper! Very responsive and honest about item condition. Would definitely swap again!',
    swapItem: 'iPhone 14 Pro',
    date: '2024-01-08'
  }
]

export default function ProfilePage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(mockUser)
  const [listings, setListings] = useState(mockListings)
  const [reviews, setReviews] = useState(mockReviews)

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => setLoading(false), 1000)
  }, [params.id])

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return 'High Trust'
    if (score >= 60) return 'Medium Trust'
    return 'Low Trust'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {user.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                  {user.verified && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{user.bio}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{user.totalSwaps}</div>
                    <div className="text-sm text-muted-foreground">Total Swaps</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-2xl font-bold">{user.rating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className={`text-2xl font-bold ${getTrustScoreColor(user.trustScore)}`}>
                      {user.trustScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Trust Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{listings.filter(l => l.status === 'active').length}</div>
                    <div className="text-sm text-muted-foreground">Active Listings</div>
                  </div>
                </div>

                {/* Trust Score Details */}
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Trust Score</span>
                    <span className={`font-bold ${getTrustScoreColor(user.trustScore)}`}>
                      {getTrustScoreLabel(user.trustScore)}
                    </span>
                  </div>
                  <Progress value={user.trustScore} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Based on completed swaps, ratings, and community feedback
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="grid gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="relative w-48 h-32">
                      <Image
                        src={listing.images[0] || "/placeholder.svg"}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                      <Badge 
                        className={`absolute top-2 left-2 ${
                          listing.status === 'active' ? 'bg-green-600' : 
                          listing.status === 'completed' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{listing.title}</h3>
                        <span className="text-lg font-bold text-green-600">${listing.estimatedValue}</span>
                      </div>
                      <p className="text-muted-foreground mb-4">{listing.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{listing.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer.avatar || "/placeholder.svg"} alt={review.reviewer.name} />
                        <AvatarFallback>{review.reviewer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{review.reviewer.name}</h4>
                            <p className="text-sm text-muted-foreground">Swapped: {review.swapItem}</p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-2">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Completed swap with Sarah Kim</p>
                      <p className="text-sm text-muted-foreground">MacBook Pro M2 → Web Development Services</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Created new listing</p>
                      <p className="text-sm text-muted-foreground">iPad Pro for Gaming Laptop</p>
                    </div>
                    <span className="text-sm text-muted-foreground">5 days ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Received 5-star rating</p>
                      <p className="text-sm text-muted-foreground">From Mike Johnson</p>
                    </div>
                    <span className="text-sm text-muted-foreground">1 week ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

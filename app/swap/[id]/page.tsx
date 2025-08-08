'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, MapPin, Calendar, Shield, MessageCircle, Heart, Share2, Flag, Clock, Zap, Eye, Users, ArrowLeft, CheckCircle, AlertTriangle, Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { DatabaseService } from '@/lib/database-service'
import { useRouter } from 'next/navigation'

export default function SwapDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [listing, setListing] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isInterested, setIsInterested] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    loadListing()
  }, [params.id])

  const loadListing = async () => {
    setLoading(true)
    try {
      const data = await DatabaseService.getListingById(String(params.id))
      if (data) {
        setListing({
          ...data,
          isFlashSwap: data.is_flash_swap,
          expiresAt: data.expires_at,
          estimatedValue: Number(data.estimated_value || 0),
          wantedItems: data.wanted_items || [],
          aiTags: data.ai_tags || [],
          user: {
            id: data.users?.id,
            name: data.users?.name || 'User',
            avatar: data.users?.avatar_url,
            rating: data.users?.rating || '—',
            totalSwaps: data.users?.total_swaps || 0,
            verified: data.users?.verified || false,
            badges: data.users?.badges || [],
            joinDate: data.users?.created_at || new Date().toISOString(),
            responseRate: 98,
            avgResponseTime: '1 hour'
          },
          views: 0,
          interested: 0
        })
      } else {
        setError('Listing not found')
      }
    } catch (err) {
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const calculateTimeRemaining = () => {
    if (!listing?.isFlashSwap || !listing?.expiresAt) return null
    const now = new Date()
    const timeLeft = new Date(listing.expiresAt).getTime() - now.getTime()
    if (timeLeft <= 0) return 'Expired'
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`
  }

  const getUrgencyColor = () => {
    if (!listing?.isFlashSwap || !listing?.expiresAt) return ''
    const now = new Date()
    const timeLeft = new Date(listing.expiresAt).getTime() - now.getTime()
    const hoursLeft = timeLeft / (1000 * 60 * 60)
    if (hoursLeft <= 2) return 'text-red-600 bg-red-50 border-red-200'
    if (hoursLeft <= 6) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  const handleInterest = () => {
    setIsInterested(!isInterested)
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = () => {
    if (!listing) return
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    }
  }

  const openChat = () => {
    if (!listing?.user?.id) return
    router.push(`/messages?to=${listing.user.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading swap details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'Listing not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/search">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <Image
                      src={listing.images?.[0] || "/placeholder.svg"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                    {listing.isFlashSwap && (
                      <Badge className={`absolute top-4 right-4 ${getUrgencyColor()}`}>
                        <Zap className="h-3 w-3 mr-1" />
                        {calculateTimeRemaining()}
                      </Badge>
                    )}
                    {listing.subcategory && (
                      <Badge className="absolute top-4 left-4 capitalize">
                        {listing.subcategory}
                      </Badge>
                    )}
                  </div>
                  {listing.images?.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {listing.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${listing.title} ${index + 1}`}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2 flex items-center">
                      {listing.isFlashSwap && <Zap className="h-5 w-5 mr-2 text-orange-600" />}
                      {listing.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location || '—'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(listing.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views ?? 0} views
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {listing.interested ?? 0} interested
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${listing.estimatedValue}
                    </div>
                    {listing.condition && (
                      <Badge variant="outline" className="capitalize">
                        {listing.condition}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  <Separator />

                  {listing.wantedItems?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">What they want in return</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.wantedItems.map((item: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.aiTags?.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3">AI Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {listing.aiTags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Swapper Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={listing.user.avatar || "/placeholder.svg"} alt={listing.user.name} />
                    <AvatarFallback>{String(listing.user.name || 'U').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-semibold">{listing.user.name}</h4>
                      {listing.user.verified && (
                        <Shield className="h-4 w-4 ml-2 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{listing.user.rating}</span>
                      <span className="text-muted-foreground ml-1">
                        ({listing.user.totalSwaps} swaps)
                      </span>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full mb-2">
                  <Link href={`/profile/${listing.user.id}`}>
                    View Full Profile
                  </Link>
                </Button>
                <Button onClick={openChat} className="w-full" disabled={!user || user.id === listing.user.id}>
                  <Send className="h-4 w-4 mr-2" />
                  Message Seller
                </Button>
              </CardContent>
            </Card>

            {listing.isFlashSwap && listing.expiresAt && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                    <Clock className="h-5 w-5 mr-2" />
                    Flash Swap Timer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {calculateTimeRemaining()}
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      This listing will expire soon. Act fast!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

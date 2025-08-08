'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, MapPin, Calendar, Shield, TrendingUp, Package, MessageCircle, Edit, Save, Camera, Phone, Mail, User, Settings, Award } from 'lucide-react'
import Image from 'next/image'
import { GeolocationService } from '@/lib/geolocation-service'

const mockUserData = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatar: '/placeholder.svg?height=120&width=120&text=AC',
  bio: 'Tech enthusiast and gadget collector. Love swapping electronics and finding unique items!',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  coordinates: { latitude: 37.7749, longitude: -122.4194 },
  verified: true,
  rating: 4.9,
  totalSwaps: 15,
  trustScore: 92,
  badges: ['Verified Swapper', 'Tech Expert', 'Top Trader'],
  joinDate: '2023-06-15',
  lastActive: '2024-01-15',
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    locationSharing: true,
    profileVisibility: 'public'
  }
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
    views: 45,
    interested: 8,
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
    views: 32,
    interested: 12,
    createdAt: '2024-01-05'
  }
]

const mockStats = {
  totalViews: 1250,
  totalInterested: 89,
  responseRate: 95,
  avgResponseTime: '2 hours'
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [userData, setUserData] = useState(mockUserData)
  const [formData, setFormData] = useState({
    name: mockUserData.name,
    bio: mockUserData.bio,
    phone: mockUserData.phone,
    location: mockUserData.location
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Please log in</h3>
              <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/profile/update', { method: 'POST' })
      // no-op; we'll call the server action directly instead:
    } catch {}

    try {
      const coordinates = userData.coordinates ?? null
      // Call server action
      const { updateUserProfile } = await import('./actions')
      await updateUserProfile({
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        coordinates
      })

      setUserData(prev => ({
        ...prev,
        ...formData
      }))
      
      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await GeolocationService.getCurrentLocation()
      const locationString = location.city && location.state 
        ? `${location.city}, ${location.state}` 
        : 'Current Location'
      
      setFormData(prev => ({ ...prev, location: locationString }))
      setUserData(prev => ({
        ...prev,
        coordinates: { latitude: location.latitude, longitude: location.longitude }
      }))
    } catch (error) {
      setError('Could not get your location')
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                    <AvatarFallback className="text-2xl">{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {userData.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                  {userData.verified && (
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
                  <div className="flex-1">
                    {editing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <div className="flex gap-2">
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={getCurrentLocation}
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <Mail className="h-4 w-4 mr-2" />
                          {userData.email}
                        </div>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <Phone className="h-4 w-4 mr-2" />
                          {userData.phone}
                        </div>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          {userData.location}
                        </div>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <Calendar className="h-4 w-4 mr-2" />
                          Joined {new Date(userData.joinDate).toLocaleDateString()}
                        </div>
                        <p className="text-muted-foreground mb-6">{userData.bio}</p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    {editing ? (
                      <>
                        <Button onClick={handleSave} disabled={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {!editing && (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{userData.totalSwaps}</div>
                        <div className="text-sm text-muted-foreground">Total Swaps</div>
                      </div>
                      
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-2xl font-bold">{userData.rating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                      
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className={`text-2xl font-bold ${getTrustScoreColor(userData.trustScore)}`}>
                          {userData.trustScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Trust Score</div>
                      </div>
                      
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {mockListings.filter(l => l.status === 'active').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Listings</div>
                      </div>
                    </div>

                    {/* Trust Score Details */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Trust Score</span>
                        <span className={`font-bold ${getTrustScoreColor(userData.trustScore)}`}>
                          {getTrustScoreLabel(userData.trustScore)}
                        </span>
                      </div>
                      <Progress value={userData.trustScore} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Based on completed swaps, ratings, and community feedback
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="grid gap-6">
              {mockListings.map((listing) => (
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
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{listing.views} views</span>
                          <span>{listing.interested} interested</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Messages
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{mockStats.totalViews}</div>
                  <p className="text-sm text-muted-foreground">Across all listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interested Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{mockStats.totalInterested}</div>
                  <p className="text-sm text-muted-foreground">Total inquiries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{mockStats.responseRate}%</div>
                  <p className="text-sm text-muted-foreground">Message responses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{mockStats.avgResponseTime}</div>
                  <p className="text-sm text-muted-foreground">To messages</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={userData.preferences.emailNotifications}
                    onCheckedChange={(checked) => 
                      setUserData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, emailNotifications: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={userData.preferences.smsNotifications}
                    onCheckedChange={(checked) => 
                      setUserData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, smsNotifications: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location-sharing">Location Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your approximate location</p>
                  </div>
                  <Switch
                    id="location-sharing"
                    checked={userData.preferences.locationSharing}
                    onCheckedChange={(checked) => 
                      setUserData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, locationSharing: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={userData.preferences.profileVisibility}
                    onChange={(e) => 
                      setUserData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, profileVisibility: e.target.value }
                      }))
                    }
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="verified">Verified Users Only</option>
                    <option value="private">Private - Hidden from search</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
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

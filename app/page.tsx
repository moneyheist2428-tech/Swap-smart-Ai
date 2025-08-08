'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Shield, Zap, Users, Star, ArrowRight, Smartphone, Book, Gamepad2, Palette } from 'lucide-react'

const featuredSwaps = [
  {
    id: '1',
    title: 'MacBook Pro M2 for Gaming Setup',
    description: 'Trading my 2022 MacBook Pro for a complete gaming setup with RTX 4070',
    category: 'Electronics',
    images: ['/placeholder.svg?height=200&width=300&text=MacBook+Pro'],
    user: { name: 'Alex Chen', avatar: '/placeholder.svg?height=40&width=40&text=AC', rating: 4.9 },
    estimatedValue: 2500,
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    title: 'Web Development Services for Logo Design',
    description: 'Full-stack web development (React/Node.js) in exchange for professional branding package',
    category: 'Services',
    images: ['/placeholder.svg?height=200&width=300&text=Web+Development'],
    user: { name: 'Sarah Kim', avatar: '/placeholder.svg?height=40&width=40&text=SK', rating: 4.8 },
    estimatedValue: 1200,
    location: 'Remote'
  },
  {
    id: '3',
    title: 'Rare Pokemon Cards for Vintage Comics',
    description: 'Complete collection of 1st edition Pokemon cards for Marvel/DC vintage comics',
    category: 'Collectibles',
    images: ['/placeholder.svg?height=200&width=300&text=Pokemon+Cards'],
    user: { name: 'Mike Johnson', avatar: '/placeholder.svg?height=40&width=40&text=MJ', rating: 4.7 },
    estimatedValue: 800,
    location: 'New York, NY'
  }
]

const categories = [
  { name: 'Electronics', icon: Smartphone, count: 1234 },
  { name: 'Books & Media', icon: Book, count: 856 },
  { name: 'Gaming', icon: Gamepad2, count: 642 },
  { name: 'Art & Design', icon: Palette, count: 423 }
]

export default function HomePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      // Simulate AI recommendations
      setAiRecommendations([
        'Gaming Laptops',
        'Design Software',
        'Photography Equipment',
        'Programming Books'
      ])
    }
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Swap Smart with AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The intelligent platform for swapping goods, services, and digital assets. 
            Powered by AI for smarter matches and secure transactions.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="What would you like to swap? (e.g., 'iPhone for Android tablet')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2"
              />
              <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full">
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/create-listing">
                Start Swapping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Swap Smart AI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <CardTitle>AI-Powered Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our advanced AI finds the perfect swap matches based on your preferences, location, and item compatibility.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <CardTitle>Secure & Trusted</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built-in fraud detection, escrow system, and verified user profiles ensure safe and secure swaps.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <CardTitle>Global Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join thousands of swappers worldwide. From digital goods to physical items, find what you need.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={`/category/${category.name.toLowerCase()}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <category.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} items</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Swaps */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Swaps</h2>
            <Button variant="outline" asChild>
              <Link href="/browse">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredSwaps.map((swap) => (
              <Card key={swap.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={swap.images[0] || "/placeholder.svg"}
                    alt={swap.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 left-2">{swap.category}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{swap.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{swap.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={swap.user.avatar || "/placeholder.svg"} alt={swap.user.name} />
                        <AvatarFallback>{swap.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{swap.user.name}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-xs text-muted-foreground">{swap.user.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${swap.estimatedValue}</p>
                      <p className="text-xs text-muted-foreground">{swap.location}</p>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/swap/${swap.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations for logged-in users */}
      {user && aiRecommendations.length > 0 && (
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8">
              <TrendingUp className="inline-block mr-2 h-8 w-8" />
              AI Recommendations for You
            </h2>
            <div className="flex flex-wrap gap-3">
              {aiRecommendations.map((recommendation, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  {recommendation}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Swapping?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already discovered the power of AI-assisted swapping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/demo">
                Watch Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

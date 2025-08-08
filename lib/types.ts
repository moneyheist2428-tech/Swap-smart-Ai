export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  phone?: string
  verified: boolean
  rating: number
  totalSwaps: number
  badges: string[]
  trustScore: number
  location?: {
    latitude: number
    longitude: number
    city?: string
    state?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface SwapListing {
  id: string
  userId: string
  title: string
  description: string
  category: 'digital' | 'physical' | 'services' | 'crypto'
  subcategory: string
  images: string[]
  estimatedValue: number
  condition?: string
  location?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  wantedItems: string[]
  status: 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'
  aiDescription?: string
  aiTags: string[]
  isFlashSwap: boolean
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SwapRequest {
  id: string
  fromUserId: string
  toUserId: string
  fromListingId: string
  toListingId: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  negotiationHistory: NegotiationMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface NegotiationMessage {
  id: string
  userId: string
  message: string
  isAiGenerated: boolean
  timestamp: Date
}

export interface ChatMessage {
  id: string
  swapRequestId: string
  senderId: string
  message: string
  timestamp: Date
  encrypted: boolean
}

export interface UserRating {
  id: string
  raterId: string
  ratedId: string
  swapRequestId: string
  rating: number
  comment: string
  createdAt: Date
}

export interface TrustScore {
  userId: string
  score: number
  completedSwaps: number
  positiveRatings: number
  disputes: number
  lastUpdated: Date
}

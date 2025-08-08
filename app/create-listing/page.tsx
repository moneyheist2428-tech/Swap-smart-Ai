'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Upload, X, Wand2, MapPin, DollarSign, Tag, Camera, Sparkles, Mic, MicOff, Clock, Zap } from 'lucide-react'
import { GeminiService } from '@/lib/gemini-service'
import { StorageService } from '@/lib/storage-service'
import { SpeechService } from '@/lib/speech-service'
import { GeolocationService } from '@/lib/geolocation-service'
import Image from 'next/image'
import { createListing } from './actions'

const categories = [
  { value: 'digital', label: 'Digital Goods' },
  { value: 'physical', label: 'Physical Items' },
  { value: 'services', label: 'Skills & Services' },
  { value: 'crypto', label: 'Crypto & Tokens' }
]

const subcategories = {
  digital: ['Software', 'E-books', 'NFTs', 'Digital Art', 'Online Courses'],
  physical: ['Electronics', 'Books', 'Clothing', 'Collectibles', 'Home & Garden'],
  services: ['Web Development', 'Design', 'Writing', 'Tutoring', 'Marketing'],
  crypto: ['Bitcoin', 'Ethereum', 'Tokens', 'DeFi', 'Gaming Tokens']
}

export default function CreateListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const speechService = useRef<SpeechService | null>(null)
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [imageAnalyzing, setImageAnalyzing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    estimatedValue: '',
    condition: '',
    location: '',
    wantedItems: [] as string[],
    images: [] as string[],
    isFlashSwap: false,
    flashSwapDuration: '24', // hours
    useCurrentLocation: false
  })

  const [wantedItemInput, setWantedItemInput] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [userLocation, setUserLocation] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechService.current = new SpeechService()
    }
  }, [])

  useEffect(() => {
    if (formData.useCurrentLocation) {
      getCurrentLocation()
    }
  }, [formData.useCurrentLocation])

  if (!user) {
    router.push('/login')
    return null
  }

  const getCurrentLocation = async () => {
    try {
      const location = await GeolocationService.getCurrentLocation()
      setUserLocation(location)
      const locationString = location.city && location.state 
        ? `${location.city}, ${location.state}` 
        : 'Current Location'
      setFormData(prev => ({ ...prev, location: locationString }))
    } catch (error) {
      console.error('Location error:', error)
      setError('Could not get your location. Please enter manually.')
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const analyzeImageWithAI = async (file: File) => {
    setImageAnalyzing(true)
    setError('')

    try {
      const analysis = await GeminiService.analyzeImage(file)
      
      setFormData(prev => ({
        ...prev,
        title: analysis.title,
        description: analysis.description,
        category: analysis.category,
        subcategory: analysis.subcategory,
        estimatedValue: analysis.estimatedValue.toString()
      }))

      // Add AI tags as wanted items if none exist
      if (formData.wantedItems.length === 0) {
        setFormData(prev => ({
          ...prev,
          wantedItems: analysis.tags.slice(0, 3)
        }))
      }
    } catch (err: any) {
      if (err.message.includes('Gemini API key')) {
        setError('AI not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to enable AI description.')
      } else {
        setError('Failed to analyze image: ' + err.message)
      }
    } finally {
      setImageAnalyzing(false)
    }
  }

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return []

    setUploadingImages(true)
    try {
      const imageUrls = await StorageService.uploadMultipleImages(selectedFiles, user.id)
      return imageUrls
    } catch (error) {
      throw new Error('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const addWantedItem = () => {
    if (wantedItemInput.trim() && !formData.wantedItems.includes(wantedItemInput.trim())) {
      setFormData(prev => ({
        ...prev,
        wantedItems: [...prev.wantedItems, wantedItemInput.trim()]
      }))
      setWantedItemInput('')
    }
  }

  const removeWantedItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      wantedItems: prev.wantedItems.filter(i => i !== item)
    }))
  }

  const generateAIDescription = async () => {
    if (!formData.title || !formData.category) {
      setError('Please enter a title and select a category first')
      return
    }

    setAiGenerating(true)
    try {
      const description = await GeminiService.generateDescription(formData.title, formData.category)
      setFormData(prev => ({ ...prev, description }))
    } catch (err: any) {
      if (err.message.includes('Gemini API key')) {
        setError('AI not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to enable AI description.')
      } else {
        setError('Failed to generate AI description')
      }
    } finally {
      setAiGenerating(false)
    }
  }

  const startSpeechToText = async (field: 'title' | 'description') => {
    if (!speechService.current?.isSupported()) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    setIsListening(true)
    setError('')

    try {
      const transcript = await speechService.current.startListening()
      if (transcript.trim()) {
        setFormData(prev => ({ ...prev, [field]: transcript }))
      } else {
        setError('No speech detected. Please try speaking again.')
      }
    } catch (err: any) {
      console.error('Speech recognition error:', err)
      if (err.message.includes('not-allowed') || err.message.includes('permission')) {
        setError('Microphone access denied. Please allow microphone permission in your browser settings and try again.')
      } else {
        setError(err.message)
      }
    } finally {
      setIsListening(false)
    }
  }

  const stopSpeechToText = () => {
    speechService.current?.stopListening()
    setIsListening(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Upload images first
      const imageUrls = await uploadImages()
      
      // Calculate expiration date for flash swaps
      const expiresAt = formData.isFlashSwap 
        ? new Date(Date.now() + parseInt(formData.flashSwapDuration) * 60 * 60 * 1000)
        : null

      // Create FormData for server action
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('subcategory', formData.subcategory)
      submitData.append('estimatedValue', formData.estimatedValue)
      submitData.append('condition', formData.condition)
      submitData.append('location', formData.location)
      submitData.append('wantedItems', JSON.stringify(formData.wantedItems))
      submitData.append('images', JSON.stringify(imageUrls))
      submitData.append('isFlashSwap', formData.isFlashSwap.toString())
      if (expiresAt) {
        submitData.append('expiresAt', expiresAt.toISOString())
      }
      if (userLocation) {
        submitData.append('coordinates', JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }))
      }

      await createListing(submitData)
      window.location.href = '/browse'
    } catch (err: any) {
      setError(err.message || 'Failed to create listing')
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Swap Listing</h1>
          <p className="text-muted-foreground">List your item or service and find the perfect swap match</p>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of 3</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about what you want to swap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload with AI Analysis */}
                <div className="space-y-2">
                  <Label>Images (AI Auto-Fill Available)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFiles.length === 0 ? (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Upload images for AI auto-fill
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Choose Images
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG up to 10MB each. Max 5 images.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                width={150}
                                height={150}
                                className="rounded-lg object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Add More
                          </Button>
                          <Button
                            type="button"
                            onClick={() => analyzeImageWithAI(selectedFiles[0])}
                            disabled={imageAnalyzing}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            {imageAnalyzing ? (
                              <>
                                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                AI Auto-Fill
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title with Speech-to-Text */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="title"
                      placeholder="e.g., MacBook Pro M2 for Gaming Setup"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => isListening ? stopSpeechToText() : startSpeechToText('title')}
                      disabled={!speechService.current?.isSupported()}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.category && (
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories[formData.category as keyof typeof subcategories]?.map((subcat) => (
                            <SelectItem key={subcat} value={subcat}>
                              {subcat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Description with Speech-to-Text and AI Generate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => isListening ? stopSpeechToText() : startSpeechToText('description')}
                        disabled={!speechService.current?.isSupported()}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="mr-2 h-4 w-4 text-red-500" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2 h-4 w-4" />
                            Speak
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIDescription}
                        disabled={aiGenerating || !formData.title || !formData.category}
                      >
                        {aiGenerating ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            AI Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Describe your item, its condition, and what makes it special..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="estimatedValue"
                        type="number"
                        placeholder="0"
                        value={formData.estimatedValue}
                        onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {formData.category === 'physical' && (
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Location with Geolocation */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City, State or 'Remote' for digital items"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="pl-10"
                        disabled={formData.useCurrentLocation}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useCurrentLocation"
                        checked={formData.useCurrentLocation}
                        onCheckedChange={(checked) => handleInputChange('useCurrentLocation', checked)}
                      />
                      <Label htmlFor="useCurrentLocation" className="text-sm">
                        Use current location
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Flash Swap Option */}
                <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <Label htmlFor="isFlashSwap" className="font-medium">
                        Flash Swap (Time-Limited)
                      </Label>
                    </div>
                    <Switch
                      id="isFlashSwap"
                      checked={formData.isFlashSwap}
                      onCheckedChange={(checked) => handleInputChange('isFlashSwap', checked)}
                    />
                  </div>
                  
                  {formData.isFlashSwap && (
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select value={formData.flashSwapDuration} onValueChange={(value) => handleInputChange('flashSwapDuration', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 Hours</SelectItem>
                          <SelectItem value="48">48 Hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Your listing will automatically expire and be hidden after the selected duration.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: What You Want */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  What You Want in Return
                </CardTitle>
                <CardDescription>
                  Specify what you're looking for in exchange
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="wantedItems">Wanted Items/Services</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="wantedItems"
                      placeholder="e.g., Gaming laptop, Design services, Bitcoin"
                      value={wantedItemInput}
                      onChange={(e) => setWantedItemInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWantedItem())}
                    />
                    <Button type="button" onClick={addWantedItem}>
                      Add
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add multiple items to increase your chances of finding a match
                  </p>
                </div>

                {formData.wantedItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your Wanted Items:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.wantedItems.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeWantedItem(item)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review and Submit */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Review and Submit
                </CardTitle>
                <CardDescription>
                  Review your listing before publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Review Section */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold">Review Your Listing</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Category:</strong> {formData.category} {formData.subcategory && `> ${formData.subcategory}`}</p>
                    <p><strong>Description:</strong> {formData.description}</p>
                    {formData.estimatedValue && <p><strong>Estimated Value:</strong> ${formData.estimatedValue}</p>}
                    {formData.condition && <p><strong>Condition:</strong> {formData.condition}</p>}
                    {formData.location && <p><strong>Location:</strong> {formData.location}</p>}
                    {formData.isFlashSwap && (
                      <p className="text-orange-600">
                        <strong>Flash Swap:</strong> Expires in {formData.flashSwapDuration} hours
                      </p>
                    )}
                    {formData.wantedItems.length > 0 && (
                      <p><strong>Wanted Items:</strong> {formData.wantedItems.join(', ')}</p>
                    )}
                    {selectedFiles.length > 0 && (
                      <p><strong>Images:</strong> {selectedFiles.length} image(s) selected</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={loading || uploadingImages}>
                    {loading ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Creating Listing...
                      </>
                    ) : uploadingImages ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Uploading Images...
                      </>
                    ) : (
                      'Create Listing'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  )
}

'use server'

import { createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createListing(formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate required fields
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const category = String(formData.get('category') || '').trim()
  if (!title || !description || !category) throw new Error('Missing required fields')

  const subcategory = String(formData.get('subcategory') || '')
  const estimatedValue = Number(formData.get('estimatedValue') || 0)
  const condition = String(formData.get('condition') || '')
  const location = String(formData.get('location') || '')
  const wantedItems = JSON.parse(String(formData.get('wantedItems') || '[]')) as string[]
  const images = JSON.parse(String(formData.get('images') || '[]')) as string[]
  const isFlashSwap = String(formData.get('isFlashSwap') || 'false') === 'true'
  const expiresAt = formData.get('expiresAt') ? new Date(String(formData.get('expiresAt'))) : null
  const coordinates = formData.get('coordinates')
    ? (JSON.parse(String(formData.get('coordinates'))) as { latitude: number; longitude: number })
    : null

  const { data, error } = await supabase
    .from('swap_listings')
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      subcategory: subcategory || null,
      images,
      estimated_value: estimatedValue || null,
      condition: condition || null,
      location: location || null,
      latitude: coordinates?.latitude || null,
      longitude: coordinates?.longitude || null,
      wanted_items: wantedItems,
      status: 'active',
      is_flash_swap: isFlashSwap,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createListing error:', error)
    throw new Error('Failed to create listing')
  }

  revalidatePath('/browse')
  revalidatePath('/listings')
  redirect(`/swap/${data.id}`)
}

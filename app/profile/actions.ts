'use server'

import { createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile(payload: {
  name: string
  bio: string
  phone: string
  location: string
  coordinates?: { latitude: number; longitude: number } | null
}) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      name: payload.name,
      bio: payload.bio,
      phone: payload.phone,
      city: payload.location?.split(',')?.[0]?.trim(),
      state: payload.location?.split(',')?.[1]?.trim(),
      latitude: payload.coordinates?.latitude ?? null,
      longitude: payload.coordinates?.longitude ?? null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    console.error(error)
    throw new Error('Failed to update profile')
  }

  revalidatePath('/profile') // update cached data if any [^2]
  return { success: true }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { rated_id, rating, comment, swap_request_id } = await req.json()
    if (!rated_id || !rating) return NextResponse.json({ error: 'rated_id and rating are required' }, { status: 400 })

    const { error } = await supabase.from('user_ratings').upsert({
      rater_id: user.id,
      rated_id,
      swap_request_id: swap_request_id || null,
      rating: Number(rating),
      comment: comment || null
    }, { onConflict: 'rater_id,rated_id,swap_request_id' })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Failed to add rating' }, { status: 500 })
    }

    try {
      await supabase.rpc('calculate_trust_score', { user_id_param: rated_id })
    } catch (e) {
      console.warn('Trust score calc failed (optional):', e)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

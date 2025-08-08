import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { receiver_id, listing_id, content, skipEmail } = await req.json()
    if (!receiver_id || !content) {
      return NextResponse.json({ error: 'receiver_id and content are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Best-effort: if client attached access token in Authorization header we could validate.
    // For now, require a logged-in session on client; fallback to anonymous insert is prevented by RLS if configured.
    // Insert message
    const { data: auth } = await admin.auth.getUser()
    const senderId = auth.user?.id || null
    const { data, error } = await admin
      .from('messages')
      .insert({ sender_id: senderId, receiver_id, listing_id: listing_id || null, content })
      .select('*')
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Email notify receiver (optional)
    if (!skipEmail) {
      try {
        const { data: receiver } = await admin.auth.admin.getUserById(receiver_id)
        if (receiver?.user?.email) {
          await sendEmail({
            to: receiver.user.email,
            subject: 'New Message on Swap Smart AI',
            text: `You received a new message: ${content}`
          })
        }
      } catch (e) {
        console.warn('Email notify failed:', e)
      }
    }

    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

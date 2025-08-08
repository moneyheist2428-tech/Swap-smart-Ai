import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST() {
  try {
    const admin = createAdminClient()
    // Check if bucket exists
    const { data: existing, error: getErr } = await admin.storage.getBucket('swap-images')
    if (getErr && !/invalid input|not found/i.test(getErr.message)) {
      // ignore not found; otherwise report
      // Continue to create
    }
    if (!existing) {
      const { error: createErr } = await admin.storage.createBucket('swap-images', {
        public: true,
        fileSizeLimit: '20MB',
      })
      if (createErr && !/already exists/i.test(createErr.message)) {
        return NextResponse.json({ ok: false, message: createErr.message }, { status: 500 })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Failed to ensure bucket' }, { status: 500 })
  }
}

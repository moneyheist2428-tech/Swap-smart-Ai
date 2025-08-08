import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const path = String(form.get('path') || '')

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (!path) return NextResponse.json({ error: 'No path' }, { status: 400 })

    const admin = createAdminClient()

    // Ensure bucket exists
    let { data: existing } = await admin.storage.getBucket('swap-images')
    if (!existing) {
      await admin.storage.createBucket('swap-images', { public: true, fileSizeLimit: '20MB' })
    }

    const { error: upErr } = await admin.storage.from('swap-images').upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    })
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    const { data: pub } = admin.storage.from('swap-images').getPublicUrl(path)
    return NextResponse.json({ ok: true, path, url: pub.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}

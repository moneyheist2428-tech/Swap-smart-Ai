import { getBrowserClient } from './supabase'

export class StorageService {
  static BUCKET = 'swap-images'

  static async ensureBucket(): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch('/api/storage/ensure-bucket', { method: 'POST' })
      const data = await res.json()
      return { ok: res.ok, message: data?.message }
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Failed to ensure bucket' }
    }
  }

  static async uploadImage(file: File): Promise<{ url: string; path: string }> {
    const supabase = getBrowserClient()
    const userRes = await supabase.auth.getUser()
    const userId = userRes.data.user?.id || 'anonymous'
    const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
    const path = `${userId}/${Date.now()}-${safeName}`

    // Try client-side upload first
    let upload = await supabase.storage.from(StorageService.BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    })

    if (upload.error && /not found|bucket/i.test(upload.error.message)) {
      // Ensure bucket then retry
      await StorageService.ensureBucket()
      upload = await supabase.storage.from(StorageService.BUCKET).upload(path, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
      })
    }

    if (upload.error) {
      // Fallback to server-side upload
      const form = new FormData()
      form.append('file', file)
      form.append('path', path)
      const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`Server upload failed: ${msg}`)
      }
      const data = await res.json()
      return { url: data.url, path: data.path }
    }

    const { data: publicData } = supabase.storage.from(StorageService.BUCKET).getPublicUrl(path)
    return { url: publicData.publicUrl, path }
  }
}

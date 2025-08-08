type ImageAnalysis = {
  title: string
  category: string
  subcategory?: string
  tags: string[]
  confidence: number
}

type DescriptionResult = {
  description: string
  keywords: string[]
}

type SearchParse = {
  query: string
  categories: string[]
  priceHint?: { min?: number; max?: number }
}

function isQuotaError(err: unknown) {
  return typeof err === 'object' && err !== null && String((err as any).message || err).includes('429')
}

function filenameHeuristic(fileName: string): ImageAnalysis {
  const lower = fileName.toLowerCase()
  const tags: string[] = []
  let title = 'Item'
  let category = 'General'
  let subcategory: string | undefined

  if (lower.includes('iphone') || lower.includes('apple')) {
    title = 'Apple iPhone'
    category = 'Electronics'
    subcategory = 'Phones'
    tags.push('iphone', 'apple', 'smartphone')
  } else if (lower.includes('macbook') || lower.includes('laptop')) {
    title = 'Laptop'
    category = 'Electronics'
    subcategory = 'Computers'
    tags.push('laptop', 'notebook')
  } else if (lower.includes('camera') || lower.includes('canon') || lower.includes('sony')) {
    title = 'Digital Camera'
    category = 'Electronics'
    subcategory = 'Cameras'
    tags.push('camera', 'photography')
  } else if (lower.includes('book')) {
    title = 'Book'
    category = 'Books & Media'
    subcategory = 'Books'
    tags.push('book', 'reading')
  } else if (lower.includes('guitar')) {
    title = 'Guitar'
    category = 'Art & Design'
    subcategory = 'Musical Instruments'
    tags.push('guitar', 'instrument')
  }

  return {
    title,
    category,
    subcategory,
    tags,
    confidence: 0.4,
  }
}

export class GeminiService {
  static async analyzeImage(file: File | Blob): Promise<ImageAnalysis> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        // Fallback: heuristic
        const name = (file as File).name || 'image'
        return filenameHeuristic(name)
      }

      // NOTE: We intentionally avoid calling the API by default to prevent quota crashes.
      // If you want to enable it, replace the heuristic with a real API call and handle 429s.
      const name = (file as File).name || 'image'
      return filenameHeuristic(name)
    } catch (err) {
      if (isQuotaError(err)) {
        const name = (file as File).name || 'image'
        return filenameHeuristic(name)
      }
      // Generic fallback
      const name = (file as File).name || 'image'
      return filenameHeuristic(name)
    }
  }

  static async generateDescription(input: { title?: string; details?: string; category?: string }): Promise<DescriptionResult> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const base = (input.details || '').trim()
      const title = input.title || 'Item'
      const category = input.category || 'General'

      if (!apiKey) {
        const description = base
          ? base
          : `Well-maintained ${title} in the ${category} category. Looking to swap for similar value items.`
        return { description, keywords: [title, category, 'swap', 'trade'] }
      }

      // Avoid quota issues: generate locally
      const description = base
        ? base
        : `Well-maintained ${title} in the ${category} category. Looking to swap for similar value items. Open to reasonable offers.`
      return { description, keywords: [title, category, 'swap', 'trade'] }
    } catch (err) {
      if (isQuotaError(err)) {
        const title = input.title || 'Item'
        const category = input.category || 'General'
        return {
          description: `Well-maintained ${title} in the ${category} category. Looking to swap for similar value items.`,
          keywords: [title, category, 'swap', 'trade'],
        }
      }
      const title = input.title || 'Item'
      const category = input.category || 'General'
      return {
        description: `Well-maintained ${title} in the ${category} category.`,
        keywords: [title, category, 'swap'],
      }
    }
  }

  static async searchListings(query: string): Promise<SearchParse> {
    const q = query.trim()
    if (!q) return { query: '', categories: [] }
    const lower = q.toLowerCase()
    const categories: string[] = []
    if (lower.includes('phone') || lower.includes('iphone') || lower.includes('android')) categories.push('Electronics')
    if (lower.includes('book') || lower.includes('novel')) categories.push('Books & Media')
    if (lower.includes('game') || lower.includes('ps5') || lower.includes('xbox')) categories.push('Gaming')
    if (lower.includes('art') || lower.includes('design')) categories.push('Art & Design')
    const priceHint = /(\d+)\s*-\s*(\d+)/.exec(lower)
      ? { min: Number(RegExp.$1), max: Number(RegExp.$2) }
      : undefined
    return { query: q, categories, priceHint }
  }
}

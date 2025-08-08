import { generateText, generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export class AIService {
  static async generateItemDescription(title: string, category: string): Promise<string> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Generate a detailed, appealing description for a swap listing with title "${title}" in category "${category}". Make it concise but informative, highlighting key features and condition.`,
    })
    return text
  }

  static async detectFraud(listing: any): Promise<{ isSuspicious: boolean; reasons: string[] }> {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        isSuspicious: z.boolean(),
        reasons: z.array(z.string()),
        riskScore: z.number().min(0).max(100)
      }),
      prompt: `Analyze this swap listing for potential fraud indicators:
      Title: ${listing.title}
      Description: ${listing.description}
      Category: ${listing.category}
      Estimated Value: $${listing.estimatedValue}
      
      Look for red flags like unrealistic prices, vague descriptions, urgency tactics, or suspicious language.`,
    })
    
    return {
      isSuspicious: object.isSuspicious,
      reasons: object.reasons
    }
  }

  static async getSwapRecommendations(userId: string, userPreferences: any): Promise<string[]> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Based on user preferences: ${JSON.stringify(userPreferences)}, suggest 5 relevant swap categories or items they might be interested in. Return as comma-separated list.`,
    })
    return text.split(',').map(item => item.trim())
  }

  static async generateNegotiationSuggestion(context: string): Promise<string> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Given this swap negotiation context: "${context}", suggest a fair and diplomatic response that could help move the negotiation forward. Keep it friendly and professional.`,
    })
    return text
  }

  static async translateText(text: string, targetLanguage: string): Promise<string> {
    const { text: translatedText } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Translate the following text to ${targetLanguage}: "${text}"`,
    })
    return translatedText
  }

  static async searchListings(query: string): Promise<{ keywords: string[]; categories: string[] }> {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        keywords: z.array(z.string()),
        categories: z.array(z.string()),
        intent: z.string()
      }),
      prompt: `Parse this natural language search query: "${query}". Extract relevant keywords and suggest appropriate categories for a swap platform.`,
    })
    
    return {
      keywords: object.keywords,
      categories: object.categories
    }
  }
}

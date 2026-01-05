import type { GeminiRequest, GeminiResponse } from '@/types/ai'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'

export async function callGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  const request: GeminiRequest = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${error}`)
  }

  const data: GeminiResponse = await response.json()

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini')
  }

  const text = data.candidates[0].content.parts
    .map(part => part.text)
    .join('')

  return text
}

// Check if API key is configured
export function getGeminiApiKey(): string | null {
  return import.meta.env.VITE_GEMINI_API_KEY || null
}

export function isGeminiAvailable(): boolean {
  return !!getGeminiApiKey()
}

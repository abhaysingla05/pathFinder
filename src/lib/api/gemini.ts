// lib/api/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerationConfig } from '../types/gemini';

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff: number;
}

async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error;
  let delay = options.delayMs;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === options.maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= options.backoff;
    }
  }

  throw lastError!;
}

export class GeminiAPI {
  private model: any;
  private retryOptions: RetryOptions = {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: 2
  };

  constructor(apiKey: string, modelName: string = 'gemini-1.5-pro-latest') {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
    config: GenerationConfig = {}
  ): Promise<string> {
    const defaultConfig = {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 1024,
      candidateCount: 1,
    };

    const generationConfig = { ...defaultConfig, ...config };

    return retry(async () => {
      try {
        // Combine prompts
        const prompt = `${systemPrompt}\n\n${userPrompt}`;
        
        // Use the correct format for Gemini API
        const result = await this.model.generateContent({
          contents: [{ parts: [{ text: prompt }] }], // ✅ CORRECT FORMAT
          generationConfig
        });
        

        if (!result.response) {
          throw new Error('No response from Gemini API');
        }

        const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";


        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response from Gemini API');
        }

        return responseText;
      } catch (error: any) {
        console.error('Gemini API error:', error);
        throw new Error(`Failed to generate content: ${error.message}`);
      }
    }, this.retryOptions);
  }
}
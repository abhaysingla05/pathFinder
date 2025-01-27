// lib/gemini.ts
import { AssessmentData, QuizData, RoadmapData } from '../types/assessment';
import { QuizGenerationInput, GenerationConfig } from './types/gemini';
import { GeminiAPI } from './api/gemini';
import { getQuizPrompt, getRoadmapPrompt, SYSTEM_PROMPTS } from './prompts';
import { validateQuizStructure, validateRoadmapStructure } from './validators';
import { Cache } from './utils/cache';

const api = new GeminiAPI(import.meta.env.VITE_GEMINI_KEY);

function cleanJsonResponse(response: string): string {
  return response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/^\s*{\s*/, '{')
    .replace(/\s*}\s*$/, '}')
    .trim();
}

export async function generateQuiz(userInput: QuizGenerationInput): Promise<QuizData> {
  const cacheKey = `quiz-${userInput.goal}-${userInput.skillLevel}-${userInput.timeCommitment}`;
  
  // Try to get from cache first
  const cached = Cache.get<QuizData>(cacheKey);
  if (cached) {
    console.log('Retrieved quiz from cache');
    return cached;
  }

  try {
    const { system, user } = getQuizPrompt(userInput);
    const responseText = await api.generate(system, user, {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 2048,
    });

    const cleanedResponse = cleanJsonResponse(responseText);
    const quiz = JSON.parse(cleanedResponse) as QuizData;

    if (!validateQuizStructure(quiz)) {
      throw new Error('Generated quiz does not meet requirements');
    }

    // Store in cache with expiration
    Cache.set(cacheKey, quiz);
    console.log('Stored quiz in cache');
    
    return quiz;
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

export async function generateRoadmap(data: AssessmentData): Promise<RoadmapData> {
  const cacheKey = `roadmap-${data.goal}-${data.skillLevel}-${data.focusAreas.join('-')}-${data.quizAnalysis?.adjustedSkillLevel.overall || data.skillLevel}`;
  
  // Try to get from cache first
  const cached = Cache.get<RoadmapData>(cacheKey);
  if (cached) {
    console.log('Retrieved roadmap from cache');
    return cached;
  }

  try {
    const { system, user } = getRoadmapPrompt(data);
    
    const responseText = await api.generate(system, user, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const cleanedResponse = cleanJsonResponse(responseText);
    const roadmap = JSON.parse(cleanedResponse) as RoadmapData;

    if (!validateRoadmapStructure(roadmap)) {
      throw new Error('Invalid roadmap structure');
    }

    // Store in cache with expiration
    Cache.set(cacheKey, roadmap);
    console.log('Stored roadmap in cache');

    return roadmap;
  } catch (error) {
    console.error('Roadmap generation failed:', error);
    throw new Error('Failed to generate roadmap. Please try again.');
  }
}

// Helper function to clear cache (useful for development or user-triggered refresh)
export function clearGenerationCache(): void {
  try {
    // Clear all cached items that match our prefixes
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('quiz-') || key.startsWith('roadmap-')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Generation cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

// Helper function to check if cached data exists
export function hasCachedData(userInput: QuizGenerationInput): boolean {
  const quizKey = `quiz-${userInput.goal}-${userInput.skillLevel}-${userInput.timeCommitment}`;
  return Cache.get(quizKey) !== null;
}
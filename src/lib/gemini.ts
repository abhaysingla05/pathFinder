// lib/gemini.ts

import { AssessmentData, QuizData, RoadmapData } from '../types/assessment';
import { QuizGenerationInput, GenerationConfig } from './types/gemini';
import { GeminiAPI } from './api/gemini';
import { getQuizPrompt, getRoadmapPrompt, SYSTEM_PROMPTS } from './prompts';
import { validateQuizStructure, validateRoadmapStructure } from './validators';

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
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

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

    localStorage.setItem(cacheKey, JSON.stringify(quiz));
    return quiz;
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

export async function generateRoadmap(data: AssessmentData): Promise<RoadmapData> {
  const cacheKey = `roadmap-${data.goal}-${data.skillLevel}-${data.focusAreas.join('-')}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    // Use the getRoadmapPrompt function instead of inline prompt
    const { system, user } = getRoadmapPrompt(data);
    
    // Generate content using both system and user prompts
    const responseText = await api.generate(system, user, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const cleanedResponse = cleanJsonResponse(responseText);
    const roadmap = JSON.parse(cleanedResponse) as RoadmapData;

    if (!validateRoadmapStructure(roadmap)) {
      throw new Error('Invalid roadmap structure');
    }

    localStorage.setItem(cacheKey, JSON.stringify(roadmap));
    return roadmap;
  } catch (error) {
    console.error('Roadmap generation failed:', error);
    throw new Error('Failed to generate roadmap. Please try again.');
  }
}
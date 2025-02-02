// lib/gemini.ts
import { AssessmentData, ProgressCallback, QuizData, RoadmapData, RoadmapWeek } from '../types/assessment';
import { QuizGenerationInput, GenerationConfig, CacheMetadata, CachedItem } from './types/gemini';
import { GeminiAPI } from './api/gemini';
import { getQuizPrompt, getRoadmapPrompt, SYSTEM_PROMPTS } from './prompts';
import { validateQuizStructure, validateRoadmapStructure } from './validators';
import { AdvancedCache } from './utils/cache';
import {  CacheStats } from './utils/cache';
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
  
  try {
    const cached = AdvancedCache.get<CachedItem<QuizData>>(cacheKey);
    if (cached) {
      console.log('Retrieved quiz from cache');
      return cached.data;
    }

    console.log('Generating new quiz...', userInput);
    const { system, user } = getQuizPrompt(userInput);
    
    const responseText = await api.generate(system, user, {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 2048,
    });

    if (!responseText) {
      throw new Error('Empty response from API');
    }

    const cleanedResponse = cleanJsonResponse(responseText);
    let quiz: QuizData;

    try {
      quiz = JSON.parse(cleanedResponse) as QuizData;
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', cleanedResponse);
      throw new Error('Invalid JSON response from API');
    }

    if (!validateQuizStructure(quiz)) {
      console.error('Invalid quiz structure:', quiz);
      throw new Error('Generated quiz does not meet requirements');
    }

    // Store in cache with metadata and tags
    await AdvancedCache.set(
      cacheKey,
      { data: quiz, metadata: { generatedAt: new Date().toISOString() } },
      {
        tags: ['quiz', userInput.goal, `level-${userInput.skillLevel}`],
        version: '1.0.0'
      }
    );
    
    console.log('Successfully generated and cached quiz');
    return quiz;
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate quiz: ${error.message}` 
        : 'Failed to generate quiz. Please try again.'
    );
  }
}

// lib/gemini.ts


export async function generateRoadmap(
  data: AssessmentData,
  onProgress?: ProgressCallback
): Promise<RoadmapData> {
  const cacheKey = `roadmap-${data.goal}-${data.skillLevel}-${data.focusAreas.join('-')}-${data.quizAnalysis?.adjustedSkillLevel.overall || data.skillLevel}`;
  
  try {
    const cached = AdvancedCache.get<RoadmapData>(cacheKey);
    if (cached) {
      console.log('Retrieved roadmap from cache');
      return cached;
    }

    console.log('Starting roadmap generation...');
    
    const totalWeeks = 12;
    const weeksPerChunk = 4;
    const totalChunks = totalWeeks / weeksPerChunk;

    const completeRoadmap: RoadmapData = {
      weeks: [],
      metadata: {
        totalWeeks,
        weeklyCommitment: data.timeCommitment,
        difficulty: data.skillLevel <= 2 ? 'beginner' : 
                   data.skillLevel <= 4 ? 'intermediate' : 'advanced',
        focusAreas: data.focusAreas
      }
    };

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startWeek = chunkIndex * weeksPerChunk + 1;
      const endWeek = Math.min(startWeek + weeksPerChunk - 1, totalWeeks);

      // Notify progress if callback provided
      onProgress?.(chunkIndex, totalChunks, `Generating weeks ${startWeek}-${endWeek}`);

      const chunkPrompt = `
Create a detailed curriculum for weeks ${startWeek}-${endWeek} of a ${totalWeeks}-week ${data.goal} learning path.

Student Profile:
- Skill Level: ${data.skillLevel}/5
- Focus Areas: ${data.focusAreas.join(', ')}
- Weekly Time: ${data.timeCommitment} hours
${data.quizAnalysis ? `
Performance Insights:
- Strengths: ${data.quizAnalysis.strengthAreas.join(', ')}
- Areas to Improve: ${data.quizAnalysis.improvementAreas.join(', ')}
` : ''}

Return ONLY a JSON array of weeks with this EXACT structure:
[
  {
    "week": number,
    "theme": "Weekly theme",
    "topics": ["3-4 specific topics"],
    "resources": [
      {
        "type": "video/article/course",
        "title": "Resource title",
        "url": "Valid URL",
        "duration": "Expected time",
        "difficulty": "beginner/intermediate/advanced",
        "category": "Topic category"
      }
    ],
    "project": {
      "title": "Project title",
      "description": "Project details",
      "estimatedHours": number
    },
    "weeklyHours": ${data.timeCommitment}
  }
]

Requirements:
1. Each week should have 3-4 focused topics
2. Include 2-3 high-quality resources per topic
3. One practical project per week
4. Resources should be from reputable sources
5. Content difficulty should match skill level
6. Weekly hours should match time commitment`;

      try {
        const responseText = await api.generate('', chunkPrompt, {
          temperature: 0.7,
          maxOutputTokens: 2048,
        });

        if (!responseText) {
          throw new Error(`Empty response for weeks ${startWeek}-${endWeek}`);
        }

        const cleanedResponse = cleanJsonResponse(responseText);
        const weekChunk = JSON.parse(cleanedResponse) as RoadmapWeek[];

        // Validate chunk structure
        if (!Array.isArray(weekChunk) || weekChunk.length !== weeksPerChunk) {
          throw new Error(`Invalid chunk structure for weeks ${startWeek}-${endWeek}`);
        }

        // Add weeks to complete roadmap
        completeRoadmap.weeks.push(...weekChunk);

      } catch (chunkError) {
        console.error(`Error generating weeks ${startWeek}-${endWeek}:`, chunkError);
        throw new Error(`Failed to generate weeks ${startWeek}-${endWeek}`);
      }
    }

    // Validate complete roadmap
    if (!validateRoadmapStructure(completeRoadmap)) {
      throw new Error('Generated roadmap does not meet requirements');
    }

    // Cache the result
    await AdvancedCache.set(cacheKey, completeRoadmap, {
      tags: ['roadmap', data.goal, ...data.focusAreas],
      version: '1.0.0'
    });

    return completeRoadmap;

  } catch (error) {
    console.error('Roadmap generation failed:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate roadmap: ${error.message}`
        : 'Failed to generate roadmap'
    );
  }
}

// Enhanced cache management utilities
export const CacheManager = {
  clearCache: async (type?: 'quiz' | 'roadmap') => {
    try {
      if (type) {
        await AdvancedCache.clearByTags([type]);
      } else {
        await AdvancedCache.clear();
      }
      console.log(`Cleared ${type || 'all'} cache items`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },

  clearByGoal: async (goal: string) => {
    try {
      await AdvancedCache.clearByTags([goal]);
      console.log(`Cleared cache for goal: ${goal}`);
    } catch (error) {
      console.error('Failed to clear cache by goal:', error);
    }
  },

  clearBySkillLevel: async (level: number) => {
    try {
      await AdvancedCache.clearByTags([`level-${level}`]);
      console.log(`Cleared cache for skill level: ${level}`);
    } catch (error) {
      console.error('Failed to clear cache by skill level:', error);
    }
  },

  getCacheStats: () => {
    return AdvancedCache.getStats();
  },

  invalidateCache: async (reason: string) => {
    console.log(`Invalidating cache due to: ${reason}`);
    await AdvancedCache.clear();
  }
};

// Export types for external use
export type { CacheStats } from './utils/cache';
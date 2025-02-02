// lib/gemini.ts
import { AssessmentData, LearningResource, ProgressCallback, QuizData, RoadmapData, RoadmapWeek, WeeklyQuizData } from '../types/assessment';
import { QuizGenerationInput, CachedItem } from './types/gemini';
import { GeminiAPI } from './api/gemini';
import { getQuizPrompt, getWeeklyQuizPrompt } from './prompts';
import { validateQuizStructure, validateRoadmapStructure } from './validators';
import { AdvancedCache } from './utils/cache';

const api = new GeminiAPI(import.meta.env.VITE_GEMINI_KEY);

// Utility to clean JSON response from the API
function cleanJsonResponse(response: string): string {
  return response.replace(/```json/g, '').replace(/```/g, '').trim();
}

// Utility: Check if a URL is valid before adding it
async function isValidUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Fetch a YouTube video related to a given topic (Fallback if URL is invalid)
async function fetchYouTubeVideo(topic: string): Promise<{ title: string; videoUrl: string; embedUrl: string } | null> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY; // Use your YouTube API Key
  const baseURL = 'https://www.googleapis.com/youtube/v3/search';
  const url = `${baseURL}?part=snippet&q=${encodeURIComponent(topic)}&key=${apiKey}&maxResults=1&type=video`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        title: video.snippet.title,
        videoUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
      };
    }
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
  }
  return null;
}

// Fetch a relevant article or course link using Google Custom Search API
async function fetchRelevantLink(topic: string, type: 'article' | 'course'): Promise<string | null> {
  const apiKey = import.meta.env.VITE_CUSTOM_SEARCH_API_KEY; // Your Custom Search API Key
  const searchEngineId = import.meta.env.VITE_CUSTOM_SEARCH_ENGINE_ID; // Your Search Engine ID
  const baseURL = 'https://www.googleapis.com/customsearch/v1';
  const query = `${topic} ${type === 'article' ? 'article' : 'free course'}`;
  const url = `${baseURL}?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].link; // Return the first result's URL
    }
  } catch (error) {
    console.error(`Error fetching ${type} link for topic "${topic}":`, error);
  }
  return null;
}
interface CachedQuiz {
  data: QuizData;
  metadata: {
    generatedAt: string;
  };
}
// ✅ Generate Quiz
export async function generateQuiz(userInput: QuizGenerationInput): Promise<QuizData> {
  const cacheKey = `quiz-${userInput.goal}-${userInput.skillLevel}-${userInput.timeCommitment}`;
  try {
    const cached = AdvancedCache.get<CachedQuiz>(cacheKey);
    if (cached) return cached.data;
    console.log('Generating new quiz...', userInput);
    const { system, user } = getQuizPrompt(userInput);
    const responseText = await api.generate(system, user, {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 2048,
    });
    if (!responseText) throw new Error('Empty response from API');
    const cleanedResponse = cleanJsonResponse(responseText);
    let quiz: QuizData = JSON.parse(cleanedResponse);
    if (!validateQuizStructure(quiz)) throw new Error('Invalid quiz format');
    await AdvancedCache.set(cacheKey, { data: quiz, metadata: { generatedAt: new Date().toISOString() } }, {
      tags: ['quiz', userInput.goal, `level-${userInput.skillLevel}`],
      version: '1.0.0',
    });
    return quiz;
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw new Error(`Failed to generate new Quiz: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Generate Quiz for a Week
export async function generateQuizForWeek(topics: string[], weekNumber: number, skillLevel: number): Promise<WeeklyQuizData> {
  const userInput = {
    goal: 'Weekly Assessment',
    skillLevel: skillLevel || 3, // Use dynamic skill level
    timeCommitment: 2, // Time commitment in hours
    focusAreas: topics,
  };
  const quiz = await generateQuiz(userInput);
  return {
    data: {
      questions: quiz.questions || [],
    },
    metadata: {
      generatedAt: new Date().toISOString(),
    },
    purpose: 'adaptive_learning', // Indicates this is a weekly quiz
    weekNumber, // Week number in the roadmap
  };
}

// Generate personalized feedback and recommendations
export function generateFeedbackAndRecommendations(score: number, topics: string[]): { feedback: string; recommendations: string[] } {
  let feedback = '';
  if (score >= 90) {
    feedback = 'Excellent! You’ve mastered this week’s content.';
  } else if (score >= 70) {
    feedback = 'Good job! Review the resources for areas you missed.';
  } else {
    feedback = 'You need to improve. Revisit the resources and retake the quiz.';
  }
  // Generate recommendations based on topics
  const recommendations = topics.map((topic) => `Review resources related to "${topic}" for better understanding.`);
  return { feedback, recommendations };
}

// ✅ Generate Roadmap
export async function generateRoadmap(data: AssessmentData): Promise<RoadmapData> {
  const cacheKey = `roadmap-${data.goal}-${data.skillLevel}-${data.focusAreas.join('-')}`;
  try {
    const cached = AdvancedCache.get<RoadmapData>(cacheKey);
    if (cached) return cached;
    console.log('Starting roadmap generation...');
    const totalWeeks = 12;
    const weeksPerChunk = 4;
    const totalChunks = totalWeeks / weeksPerChunk;
    const completeRoadmap: RoadmapData = {
      weeks: [],
      metadata: {
        totalWeeks,
        weeklyCommitment: data.timeCommitment,
        difficulty: data.skillLevel <= 2 ? 'beginner' : data.skillLevel <= 4 ? 'intermediate' : 'advanced',
        focusAreas: data.focusAreas,
      },
    };

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startWeek = chunkIndex * weeksPerChunk + 1;
      const endWeek = Math.min(startWeek + weeksPerChunk - 1, totalWeeks);
      const adjustedSkillLevel = Math.min(data.skillLevel + chunkIndex, 5); // Cap at 5
      const chunkPrompt = `
        Create a structured learning plan for weeks ${startWeek}-${endWeek} of a ${totalWeeks}-week roadmap focused on "${data.goal}".
        Student Profile:
        Skill Level: ${adjustedSkillLevel}/5
        Focus Areas: ${data.focusAreas.join(', ')}
        Weekly Commitment: ${data.timeCommitment} hours
        Resource Requirements:
        Resources must include videos, articles, and courses.
        Return JSON with this exact structure:
        [
          {
            "week": number,
            "theme": "Weekly theme",
            "topics": ["3-4 key topics"],
            "resources": [
              {
                "type": "video/article/course",
                "title": "Resource title",
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
      `;
      try {
        const responseText = await api.generate('', chunkPrompt, { temperature: 0.7, maxOutputTokens: 2048 });
        if (!responseText) throw new Error(`Empty response for weeks ${startWeek}-${endWeek}`);
        const cleanedResponse = cleanJsonResponse(responseText);
        let weekChunk: RoadmapWeek[] = JSON.parse(cleanedResponse);
        if (!Array.isArray(weekChunk)) throw new Error(`Invalid chunk structure for weeks ${startWeek}-${endWeek}`);

        // Fetch valid links for each resource
        for (const week of weekChunk) {
          week.quiz = await generateQuizForWeek(week.topics, week.week, adjustedSkillLevel);
          week.resources = (
            await Promise.all(
              week.resources.map(async (res) => {
                if (res.type === 'video') {
                  // Fetch YouTube video link
                  const video = await fetchYouTubeVideo(res.title);
                  if (video) {
                    return {
                      ...res,
                      url: video.videoUrl,
                      embedUrl: video.embedUrl,
                      fallbackVideo: true,
                    };
                  }
                } else if (res.type === 'article') {
                  // Fetch article link using Custom Search API
                  const articleLink = await fetchRelevantLink(res.title, 'article');
                  if (articleLink) {
                    return { ...res, url: articleLink };
                  }
                } else if (res.type === 'course') {
                  // Fetch course link using Custom Search API
                  const courseLink = await fetchRelevantLink(res.title, 'course');
                  if (courseLink) {
                    return { ...res, url: courseLink };
                  }
                }
                return null; // Remove resource if no valid link is found
              })
            )
          ).filter((res): res is LearningResource => res !== null);

          // Add fallback message if no resources are found
          if (week.resources.length === 0) {
            week.resources = [
              {
                type: 'video',
                title: 'No valid resource found',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Default fallback video
                duration: 'N/A',
                difficulty: 'beginner',
                category: 'Fallback',
              },
            ];
          }
        }
        completeRoadmap.weeks.push(...weekChunk);
      } catch (chunkError) {
        console.error(`Error generating weeks ${startWeek}-${endWeek}:`, chunkError);
        throw new Error(`Failed to generate weeks ${startWeek}-${endWeek}`);
      }
    }

    if (!validateRoadmapStructure(completeRoadmap)) throw new Error('Generated roadmap does not meet requirements');
    await AdvancedCache.set(cacheKey, completeRoadmap, {
      tags: ['roadmap', data.goal, ...data.focusAreas],
      version: '1.0.0',
    });
    return completeRoadmap;
  } catch (error) {
    console.error('Roadmap generation failed:', error);
    throw new Error(`Failed to generate roadmap: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ✅ Cache Management
export const CacheManager = {
  clearCache: async (type?: 'quiz' | 'roadmap') => {
    try {
      type ? await AdvancedCache.clearByTags([type]) : await AdvancedCache.clear();
      console.log(`Cleared ${type || 'all'} cache items`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },
  getCacheStats: () => AdvancedCache.getStats(),
  invalidateCache: async (reason: string) => {
    console.log(`Invalidating cache due to: ${reason}`);
    await AdvancedCache.clear();
  },
};

export type { CacheStats } from './utils/cache';
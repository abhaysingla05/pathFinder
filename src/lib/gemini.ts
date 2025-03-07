// lib/gemini.ts
import { AssessmentData, LearningResource, ProgressCallback, QuizData, QuizQuestion, RoadmapData, RoadmapWeek, WeeklyQuizData } from '../types/assessment';
import { QuizGenerationInput, CachedItem } from './types/gemini';
import { GeminiAPI } from './api/gemini';
import { getQuizPrompt, getWeeklyQuizPrompt } from './prompts';
import { validateQuizStructure, validateRoadmapStructure } from './validators';
import { AdvancedCache } from './utils/cache';
import { MultipleChoiceQuestion } from '../types/assessment';
import { handleCacheError } from './utils/errorBoundary';
const api = new GeminiAPI(import.meta.env.VITE_GEMINI_KEY);

// Utility to clean JSON response from the API
function cleanJsonResponse(response: string): string {
  try {
    // Find the start and end of the JSON array
    const jsonStart = response.indexOf('[');
    const jsonEnd = response.lastIndexOf(']');

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid JSON structure: Missing '[' or ']'.");
    }

    // Extract the JSON portion
    const jsonString = response.substring(jsonStart, jsonEnd + 1);

    // Validate the JSON structure
    JSON.parse(jsonString); // This will throw an error if the JSON is invalid
    return jsonString;
  } catch (error) {
    console.error('Error cleaning JSON response:', error);
    throw new Error('Invalid JSON structure in response');
  }
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
// lib/gemini.ts
// lib/gemini.ts
export async function generateQuiz(userInput: QuizGenerationInput): Promise<QuizData> {
  const cacheKey = `quiz-${userInput.goal}-${userInput.skillLevel}-${userInput.timeCommitment}`;
  try {
    const cached = AdvancedCache.get<CachedQuiz>(cacheKey);
    if (cached) return cached.data;

    console.log('Generating new quiz...', userInput);
    const { system, user } = getQuizPrompt(userInput);
    
    const responseText = await api.generate(system, user, {
      temperature: 0.7,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 2048,
    });

    if (!responseText) throw new Error('Empty response from API');

    const cleanedResponse = cleanJsonResponse(responseText);
    console.log('Cleaned response:', cleanedResponse);

    let parsedQuestions = JSON.parse(cleanedResponse);
    
    // Ensure we're working with an array of questions
    if (!Array.isArray(parsedQuestions)) {
      parsedQuestions = parsedQuestions.questions || [];
    }

    // Transform and validate each question
    const transformedQuestions = parsedQuestions.map((q: any, index: number) => ({
      id: `q${index + 1}`,
      text: q.text,
      type: 'multiple_choice' as const,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      category: q.category || userInput.goal,
      skillArea: q.skillArea || userInput.focusAreas[0],
      difficulty: q.difficulty || 'beginner',
      points: q.points || 10,
      topic: q.category || userInput.goal
    }));

    const quiz: QuizData = {
      questions: transformedQuestions
    };

    await AdvancedCache.set(cacheKey, { 
      data: quiz, 
      metadata: { generatedAt: new Date().toISOString() } 
    }, {
      tags: ['quiz', userInput.goal, `level-${userInput.skillLevel}`],
      version: '1.0.0',
    });

    return quiz;
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw error;
  }
}

// Generate Quiz for a Week
// In lib/gemini.ts
// In lib/gemini.ts
// In lib/gemini.ts
// In lib/gemini.ts 
export async function generateQuizForWeek(topics: string[], weekNumber: number, skillLevel: number): Promise<WeeklyQuizData> {
  const getDifficulty = (level: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (level <= 2) return 'beginner';
    if (level <= 4) return 'intermediate';
    return 'advanced';
  };

  const difficulty = getDifficulty(skillLevel);
  const cacheKey = `quiz-week${weekNumber}-${topics.join('-')}-${skillLevel}`;
  
  try {
    // Try to get from cache first
    const cached = AdvancedCache.get<WeeklyQuizData>(cacheKey);
    if (cached) return cached;

    // Clear old cache safely
    try {
      await AdvancedCache.clearByTags([`week-${weekNumber}-quiz`]);
    } catch (error) {
      handleCacheError(error);
    }

    // Generate MCQ questions with specific forma
    const mcqPrompt = `
      Create 5 multiple-choice questions about these topics: ${topics.join(', ')}
      
      Format each question exactly like this:
      {
        "text": "Question text here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Exact text of correct option",
        "explanation": "Detailed explanation of the answer"
      }

      Requirements:
      - Questions must be specific to the topics
      - Each question must have exactly 4 options
      - Correct answer must match one option exactly
      - Include practical, real-world scenarios
      - Vary difficulty levels
      
      Return as a JSON array of 5 questions.`;

    const response = await api.generate('', mcqPrompt, { 
      temperature: 0.7,
      maxOutputTokens: 2048
    });

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(cleanJsonResponse(response));
    } catch (error) {
      console.error('Failed to parse quiz response:', error);
      throw new Error('Invalid quiz format');
    }

    const validatedQuestions: MultipleChoiceQuestion[] = parsedQuestions.map((q: any, index: number) => ({
      id: `mcq_${weekNumber}_${index + 1}`,
      text: q.text,
      type: 'multiple_choice',
      options: Array.isArray(q.options) && q.options.length === 4 
        ? q.options 
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || `Explanation for ${q.text}`,
      difficulty: difficulty,
      category: topics[index % topics.length],
      skillArea: topics[index % topics.length],
      topic: topics[index % topics.length], // Add this line
      points: 20
    }));

    const weeklyQuiz: WeeklyQuizData = {
      data: {
        questions: validatedQuestions
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        difficulty: difficulty,
        adaptiveLevel: skillLevel
      },
      purpose: 'adaptive_learning',
      weekNumber
    };

    // Cache the result
    try {
      await AdvancedCache.set(cacheKey, weeklyQuiz, {
        tags: [`week-${weekNumber}-quiz`, ...topics],
        version: '1.0.0'
      });
    } catch (error) {
      handleCacheError(error);
    }

    return weeklyQuiz;
  } catch (error) {
    console.error('Error generating weekly quiz:', error);
    
    // Return fallback quiz
    return {
      data: {
        questions: topics.map((topic, index) => ({
          id: `fallback_${weekNumber}_${index}`,
          text: `What is a key concept in ${topic}?`,
          type: 'multiple_choice',
          options: [
            `Key concept of ${topic}`,
            `Secondary aspect of ${topic}`,
            `Related concept to ${topic}`,
            'All of the above'
          ],
          correctAnswer: 'All of the above',
          explanation: `This tests understanding of core concepts in ${topic}`,
          difficulty: difficulty,
          category: topic,
          skillArea: topic,
          topic: topic, // Add this line
          points: 20
        }))
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        difficulty: difficulty,
        adaptiveLevel: skillLevel
      },
      purpose: 'adaptive_learning',
      weekNumber
    };
  }
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
  const cacheKey = `roadmap-outline-${data.goal}-${data.skillLevel}`;
  try {
    // Try to get cached outline
    const cached = AdvancedCache.get<RoadmapData>(cacheKey);
    if (cached) return cached;

    // Generate outline for all weeks
    const outline = await generateRoadmapOutline(data);
    
    // Load only first week's content
    const firstWeek = await loadWeekContent(outline.weeks[0], data);
    outline.weeks[0] = { ...firstWeek, isLoaded: true };

    // Cache the outline
    await AdvancedCache.set(cacheKey, outline, {
      tags: ['roadmap', data.goal],
      version: '1.0.0'
    });

    return outline;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw error;
  }
}

async function generateRoadmapOutline(data: AssessmentData): Promise<RoadmapData> {
  const validatedData = {
    ...data,
    skillLevel: isNaN(data.skillLevel) ? 1 : Math.min(Math.max(data.skillLevel, 1), 5),
    focusAreas: data.focusAreas?.length ? data.focusAreas : ['fundamentals'],
    timeCommitment: data.timeCommitment || 10
  };

  const prompt = `
    Create a detailed 12-week learning roadmap for ${validatedData.goal}.
    
    Consider:
    - Skill Level: ${validatedData.skillLevel}/5
    - Focus Areas: ${validatedData.focusAreas.join(', ')}
    - Time Commitment: ${validatedData.timeCommitment} hours/week
    
    For each week, provide:
    - A specific theme that builds progressively
    - 3-4 focused topics that align with the theme
    - A practical project that applies the week's learning
    
    Return as a JSON array with this exact structure:
    [
      {
        "week": number,
        "theme": "Specific theme for the week",
        "topics": ["Topic 1", "Topic 2", "Topic 3"],
        "isLoaded": false,
        "adaptiveLevel": ${validatedData.skillLevel},
        "project": {
          "title": "Practical project title",
          "description": "Detailed project description",
          "estimatedHours": number
        }
      }
    ]

    Requirements:
    - Ensure progressive difficulty
    - Include prerequisites between topics
    - Make topics specific and actionable
    - Project should integrate week's topics
    - Estimated hours should be within ${validatedData.timeCommitment} weekly hours
    `;

  try {
    const responseText = await api.generate('', prompt, { 
      temperature: 0.7,
      maxOutputTokens: 2048
    });

    let weeks = JSON.parse(cleanJsonResponse(responseText));

    // Validate and clean up the generated content
    weeks = weeks.map((week: any, index: number) => ({
      week: index + 1,
      theme: week.theme || `${validatedData.goal} - Week ${index + 1}`,
      topics: Array.isArray(week.topics) ? week.topics.slice(0, 4) : validatedData.focusAreas.slice(0, 3),
      isLoaded: false,
      adaptiveLevel: validatedData.skillLevel,
      project: {
        title: week.project?.title || `${validatedData.goal} Week ${index + 1} Project`,
        description: week.project?.description || `Practice project covering ${week.topics?.join(', ')}`,
        estimatedHours: week.project?.estimatedHours || Math.floor(validatedData.timeCommitment / 2)
      }
    }));

    return {
      weeks,
      metadata: {
        totalWeeks: 12,
        weeklyCommitment: validatedData.timeCommitment,
        difficulty: validatedData.skillLevel <= 2 ? 'beginner' : 
                   validatedData.skillLevel <= 4 ? 'intermediate' : 'advanced',
        focusAreas: validatedData.focusAreas,
      }
    };

  } catch (error) {
    console.error('Error in generateRoadmapOutline:', error);
    
    // Provide structured fallback content
    return {
      weeks: Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        theme: `${validatedData.goal} - Week ${i + 1}`,
        topics: validatedData.focusAreas.slice(0, 3),
        isLoaded: false,
        adaptiveLevel: validatedData.skillLevel,
        project: {
          title: `${validatedData.goal} Week ${i + 1} Project`,
          description: `Practice project covering ${validatedData.focusAreas.join(', ')}`,
          estimatedHours: Math.floor(validatedData.timeCommitment / 2)
        }
      })),
      metadata: {
        totalWeeks: 12,
        weeklyCommitment: validatedData.timeCommitment,
        difficulty: 'beginner',
        focusAreas: validatedData.focusAreas,
      }
    };
  }
}


export async function loadWeekContent(week: RoadmapWeek, data: AssessmentData): Promise<RoadmapWeek> {
  if (week.isLoaded) return week;

  try {
    // Generate resource titles for each topic
    const resourcePrompt = `
  For these topics: ${week.topics.join(', ')}, generate:
  - 1 video tutorial
  - 1 comprehensive article
  - 1 practical course
  per topic.
  Return as a STRICTLY VALID JSON array:
  [
    {
      "topic": "Topic name",
      "resources": [
        { "type": "video", "title": "Video title" },
        { "type": "article", "title": "Article title" },
        { "type": "course", "title": "Course title" }
      ]
    }
  ]`;

    const content = await api.generate('', resourcePrompt, { temperature: 0.7 });
    console.log('Raw AI Response:', content);
    const resourceSuggestions = JSON.parse(cleanJsonResponse(content));


    // Fetch actual resources for each topic
    const allResources = await Promise.all(
      resourceSuggestions.flatMap(async (suggestion: any) => {
        const topicResources = await Promise.all(
          suggestion.resources.map(async (resource: any) => {
            try {
              if (resource.type === 'video') {
                const video = await fetchYouTubeVideo(resource.title);
                if (video) {
                  return {
                    type: 'video',
                    title: video.title,
                    url: video.videoUrl,
                    embedUrl: video.embedUrl,
                    duration: '1 hour',
                    difficulty: data.skillLevel <= 2 ? 'beginner' : 'intermediate',
                    category: suggestion.topic
                  };
                }
              } else if (resource.type === 'article') {
                const articleUrl = await fetchRelevantLink(resource.title, 'article');
                if (articleUrl) {
                  return {
                    type: 'article',
                    title: resource.title,
                    url: articleUrl,
                    duration: '30 minutes',
                    difficulty: 'beginner',
                    category: suggestion.topic
                  };
                }
              } else if (resource.type === 'course') {
                const courseUrl = await fetchRelevantLink(resource.title, 'course');
                if (courseUrl) {
                  return {
                    type: 'course',
                    title: resource.title,
                    url: courseUrl,
                    duration: '5-10 hours',
                    difficulty: 'advanced',
                    category: suggestion.topic
                  };
                }
              }
              return null;
            } catch (error) {
              console.error(`Error fetching resource for ${suggestion.topic}:`, error);
              return null;
            }
          })
        );

        return topicResources.filter(Boolean);
      })
    );

    // Generate quiz for the week
    const quiz = await generateQuizForWeek(week.topics, week.week, week.adaptiveLevel || data.skillLevel);

    // Return complete week content
    return {
      ...week,
      resources: allResources.flat(),
      quiz,
      isLoaded: true
    };

  } catch (error) {
    console.error('Error loading week content:', error);
    
    // Provide fallback content with mixed resource types
    return {
      ...week,
      resources: week.topics.flatMap(topic => [
        {
          type: 'video',
          title: `Introduction to ${topic}`,
          url: 'https://www.youtube.com/watch?v=Lv0xcdeXaGU',
          duration: '30 minutes',
          difficulty: 'beginner',
          category: topic
        },
        {
          type: 'article',
          title: `${topic} Fundamentals`,
          url: 'https://www.simplilearn.com/statistics-for-data-science-article#:~:text=and%20analysis%20reliability.-,Fundamentals%20of%20Statistics,are%20descriptive%20and%20inferential%20statistics.',
          duration: '15 minutes',
          difficulty: 'beginner',
          category: topic
        },
        {
          type: 'course',
          title: `Complete ${topic} Course`,
          url: 'https://www.simplilearn.com/statistics-for-data-science-article#:~:text=and%20analysis%20reliability.-,Fundamentals%20of%20Statistics,are%20descriptive%20and%20inferential%20statistics.',
          duration: '5 hours',
          difficulty: 'intermediate',
          category: topic
        }
      ]),
      quiz: await generateQuizForWeek(week.topics, week.week, week.adaptiveLevel || data.skillLevel),
      isLoaded: true
    };
  }
}
export async function generateWeeklyQuiz(topics: string[], weekNumber: number, skillLevel: number): Promise<WeeklyQuizData> {
  const getDifficulty = (level: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (level <= 2) return 'beginner';
    if (level <= 4) return 'intermediate';
    return 'advanced';
  };

  interface RawQuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    topic: string;
    points: number;
    category: string;
    skillArea: string;
  }

  const prompt = `
    Create a multiple-choice quiz for Week ${weekNumber}
    Topics: ${topics.join(', ')}
    
    Generate 5 multiple-choice questions with:
    - Topic-specific questions
    - 4 distinct answer options
    - Clear explanations
    - Varying difficulty
    
    Structure:
    {
      "questions": [
        {
          "id": "mcq_${weekNumber}_1",
          "text": "question text",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "correct option",
          "explanation": "detailed explanation",
          "difficulty": "beginner/intermediate/advanced",
          "topic": "specific topic",
          "points": 20,
          "category": "weekly_assessment",
          "skillArea": "topic area"
        }
      ]
    }`;

  try {
    const response = await api.generate('', prompt, { temperature: 0.7 });
    const quizContent: { questions: RawQuizQuestion[] } = JSON.parse(cleanJsonResponse(response));

    const validatedQuestions: MultipleChoiceQuestion[] = quizContent.questions.map((q: RawQuizQuestion) => ({
      id: q.id || `mcq_${weekNumber}_${Math.random().toString(36).substr(2, 9)}`,
      text: q.text,
      type: 'multiple_choice',
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || `Explanation for ${q.text}`,
      difficulty: getDifficulty(skillLevel),
      topic: q.topic || topics[0],
      points: q.points || 20,
      category: q.category || 'weekly_assessment',
      skillArea: q.skillArea || topics[0]
    }));

    return {
      data: {
        questions: validatedQuestions
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        difficulty: getDifficulty(skillLevel),
        adaptiveLevel: skillLevel
      },
      purpose: 'adaptive_learning',
      weekNumber
    };
  } catch (error) {
    console.error('Error generating weekly quiz:', error);
    
    // Fallback quiz with MCQ questions
    const fallbackQuestions: MultipleChoiceQuestion[] = topics.map((topic, index) => ({
      id: `fallback_${weekNumber}_${index}`,
      text: `What is the most important concept in ${topic}?`,
      type: 'multiple_choice',
      options: [
        `Key concept of ${topic}`,
        `Secondary aspect of ${topic}`,
        `Related concept to ${topic}`,
        `Basic principle of ${topic}`
      ],
      correctAnswer: `Key concept of ${topic}`,
      explanation: `This tests understanding of core concepts in ${topic}`,
      difficulty: getDifficulty(skillLevel),
      topic: topic,
      points: 20,
      category: 'weekly_assessment',
      skillArea: topic
    }));

    return {
      data: {
        questions: fallbackQuestions
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        difficulty: getDifficulty(skillLevel),
        adaptiveLevel: skillLevel
      },
      purpose: 'adaptive_learning',
      weekNumber
    };
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
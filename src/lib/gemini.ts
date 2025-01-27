// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AssessmentData, QuizData, RoadmapData } from '../types/assessment';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

interface QuizGenerationInput {
  goal: string;
  skillLevel: number;
  focusAreas: string[];
  timeCommitment: number;
}
function validateQuizStructure(quiz: any): quiz is QuizData {
  try {
    // Basic structure check
    if (!quiz.questions || !Array.isArray(quiz.questions)) return false;
    if (quiz.questions.length !== 5) return false;

    // Count question types
    const mcqCount = quiz.questions.filter((q: {
      type: 'multiple_choice' | 'open_ended'
    }) => q.type === 'multiple_choice').length;
    
    const openEndedCount = quiz.questions.filter((q: {
      type: 'multiple_choice' | 'open_ended'
    }) => q.type === 'open_ended').length;

    if (mcqCount !== 3 || openEndedCount !== 2) return false;

    // Validate each question
    return quiz.questions.every((q: {
      id: string;
      text: string;
      type: 'multiple_choice' | 'open_ended';
      category: string;
      skillArea: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      points: number;
      options?: string[];
      correctAnswer?: string;
    }) => {
      // Common fields validation
      const hasCommonFields = 
        typeof q.id === 'string' &&
        typeof q.text === 'string' &&
        (q.type === 'multiple_choice' || q.type === 'open_ended') &&
        typeof q.category === 'string' &&
        typeof q.skillArea === 'string' &&
        (q.difficulty === 'beginner' || q.difficulty === 'intermediate' || q.difficulty === 'advanced') &&
        typeof q.points === 'number';

      if (!hasCommonFields) return false;

      // Multiple choice specific validation
      if (q.type === 'multiple_choice') {
        return (
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === 'string' &&
          q.options.includes(q.correctAnswer)
        );
      }

      // Open ended validation
      return true; // No additional validation needed for open-ended questions
    });
  } catch (error) {
    console.error('Quiz validation error:', error);
    return false;
  }
}

export async function generateQuiz(userInput: QuizGenerationInput): Promise<QuizData> {
  const cacheKey = `quiz-${userInput.goal}-${userInput.skillLevel}-${userInput.timeCommitment}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const quizPrompt = `
Generate an assessment quiz with the following specifications:

Context:
Goal: ${userInput.goal}
Skill Level: ${userInput.skillLevel}/5
Focus Areas: ${userInput.focusAreas.join(', ')}
Time: ${userInput.timeCommitment} hrs/week

Requirements:
- 5 questions total (3 multiple-choice, 2 open-ended)
- Difficulty matches skill level (${userInput.skillLevel}/5)
- Focus on practical, real-world scenarios
- Include correct answers and explanations
- Points: MCQ (1-3 points), Open-ended (3-5 points)

Return JSON only:
{
  "questions": [
    {
      "id": "q1",
      "text": "question text",
      "type": "multiple_choice",
      "category": "fundamentals/practical/advanced",
      "skillArea": "focus area",
      "difficulty": "beginner/intermediate/advanced",
      "options": ["a", "b", "c", "d"],
      "correctAnswer": "correct option",
      "explanation": "why correct",
      "points": number
    }
  ],
  "metadata": {
    "totalPoints": number,
    "targetTime": "minutes",
    "difficulty": "level"
  }
}

Ensure:
1. JSON is valid and parseable
2. Questions match skill level
3. All required fields are present
4. No markdown or additional text`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: quizPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const responseText = await result.response.text();

    try {
      const cleanedResponse = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*{\s*/, '{')
        .replace(/\s*}\s*$/, '}')
        .trim();

      const quiz = JSON.parse(cleanedResponse) as QuizData;

      if (!validateQuizStructure(quiz)) {
        throw new Error('Invalid quiz structure');
      }

      localStorage.setItem(cacheKey, JSON.stringify(quiz));
      return quiz;
    } catch (jsonError) {
      console.error('Quiz parsing error:', jsonError);
      throw new Error('Failed to generate valid quiz format');
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz');
  }
}
// NEW: Cache implementation
const getCacheKey = (data: AssessmentData) =>
  `roadmap-${data.goal}-${data.skillLevel}-${data.focusAreas.join('-')}`;

export async function generateRoadmap(data: AssessmentData): Promise<RoadmapData> {
  const cacheKey = getCacheKey(data);
  const cached = localStorage.getItem(cacheKey);

  if (cached) return JSON.parse(cached);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const roadmapPrompt = `
    Create a personalized learning roadmap based on:

    User Profile:
    - Goal: ${data.goal}
    - Initial Skill Level: ${data.skillLevel}
    - Adjusted Skill Level: ${data.quizAnalysis?.adjustedSkillLevel.overall || data.skillLevel}
    - Focus Areas: ${data.focusAreas.join(', ')}
    - Time Commitment: ${data.timeCommitment} hours/week

    Quiz Performance Analysis:
    ${data.quizAnalysis ? `
    - Strength Areas: ${data.quizAnalysis.strengthAreas.join(', ')}
    - Areas Needing Improvement: ${data.quizAnalysis.improvementAreas.join(', ')}
    - Knowledge Gaps: ${data.quizAnalysis.knowledgeGaps.map(gap => 
      `${gap.area} (Level ${gap.currentLevel}/5): ${gap.concepts.join(', ')}`
    ).join('; ')}
    ` : ''}

    Instructions:
    1. Create a ${data.timeCommitment <= 5 ? 'concise' : 'comprehensive'} learning path
    2. ${data.quizAnalysis?.improvementAreas.length ? 
      `Prioritize these areas: ${data.quizAnalysis.improvementAreas.join(', ')}` : 
      'Cover all focus areas progressively'}
    3. Adjust content difficulty based on demonstrated knowledge level
    4. Structure weekly modules (${data.timeCommitment} hours/week commitment)
    5. Include practical exercises and real-world applications

    Return a JSON object with this structure:
    {
      "weeks": [
        {
          "week": number,
          "topics": string[],
          "resources": [
            {
              "type": "video/article/course",
              "title": "string",
              "url": "string",
              "duration": "string",
              "difficulty": "beginner/intermediate/advanced",
              "category": "string"
            }
          ]
        }
      ]
    }

    Guidelines:
    - Ensure progressive difficulty scaling
    - Include mix of resource types (videos, articles, courses)
    - Focus on practical, hands-on learning
    - Provide realistic time estimates
    - Include only high-quality, accessible resources
    - Ensure URLs are valid and from reputable sources

    Important:
    - Return valid JSON only
    - No markdown or additional formatting
    - Resources should match user's time commitment
    - Maintain logical progression of topics`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: roadmapPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const responseText = await result.response.text();

    try {
      const cleanedResponse = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*{\s*/, '{')
        .replace(/\s*}\s*$/, '}')
        .trim();

      const roadmap = JSON.parse(cleanedResponse) as RoadmapData;

      // Validate roadmap structure
      if (!validateRoadmapStructure(roadmap)) {
        throw new Error('Invalid roadmap structure');
      }

      localStorage.setItem(cacheKey, JSON.stringify(roadmap));
      return roadmap;
    } catch (jsonError) {
      console.warn('Failed to parse roadmap response:', responseText, jsonError);
      throw new Error('Invalid JSON in roadmap response.');
    }
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw error;
  }
}

// Helper function to validate roadmap structure
function validateRoadmapStructure(roadmap: any): roadmap is RoadmapData {
  if (!roadmap.weeks || !Array.isArray(roadmap.weeks)) return false;

  return roadmap.weeks.every((week: any) => 
    typeof week.week === 'number' &&
    Array.isArray(week.topics) &&
    Array.isArray(week.resources) &&
    week.resources.every((resource: any) =>
      typeof resource.type === 'string' &&
      typeof resource.title === 'string' &&
      typeof resource.url === 'string' &&
      (!resource.duration || typeof resource.duration === 'string') &&
      (!resource.difficulty || ['beginner', 'intermediate', 'advanced'].includes(resource.difficulty)) &&
      typeof resource.category === 'string'
    )
  );
}

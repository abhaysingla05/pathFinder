import { GoogleGenerativeAI } from '@google/generative-ai';
import { AssessmentData, QuizData, RoadmapData } from '../types/assessment';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

// lib/gemini.ts
export async function generateQuiz(userInput: {
  goal: string;
  skillLevel: number;
  focusAreas: string[];
}): Promise<QuizData> {
  const cacheKey = `quiz-${userInput.goal}-${userInput.skillLevel}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const quizPrompt = `
    Generate a quiz for a user with the following details:
    - Learning Goal: ${userInput.goal}
    - Skill Level: ${userInput.skillLevel} (1 = beginner, 5 = expert)
    - Focus Areas: ${userInput.focusAreas.join(', ')}

    **Instructions:**
    1. For skill levels 1-2, generate basic questions. For skill levels 3-5, generate advanced questions.
    2. Include 5 questions: 3 multiple-choice and 2 open-ended.
    3. For multiple-choice questions, provide 4 options with one correct answer.
    4. For open-ended questions, ensure they are thought-provoking and relevant to the goal.

    **Output Format (JSON Only):**
    {
      "questions": [
        {
          "text": "question",
          "type": "multiple_choice/open_ended",
          "options": ["option1", "option2", "option3", "option4"], // Only for multiple-choice
          "correctAnswer": "option1" // Only for multiple-choice
        }
      ]
    }

    **Important:**
    - Return only valid JSON.
    - Do not include Markdown formatting (e.g., **Question 1**).
    `;

    const result = await model.generateContent(quizPrompt);
    const responseText = await result.response.text(); // Ensure `text()` is called to get the string.

    try {
      // Clean up any potential Markdown formatting
      const cleanedResponse = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const quiz = JSON.parse(cleanedResponse) as QuizData;
      localStorage.setItem(cacheKey, JSON.stringify(quiz));
      return quiz;
    } catch (jsonError) {
      console.error('Failed to parse quiz response:', responseText, jsonError);
      throw new Error('Invalid JSON in quiz response.');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
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
    Create a personalized learning roadmap for a user with the following details:
    - Learning Goal: ${data.goal}
    - Skill Level: ${data.skillLevel} (1 = beginner, 5 = expert)
    - Focus Areas: ${data.focusAreas.join(', ')}
    - Time Commitment: ${data.timeCommitment} hours per week

    **Instructions:**
    1. Divide the roadmap into weekly modules based on the user's time commitment.
    2. For skill levels 1-2, focus on foundational topics. For skill levels 3-5, focus on advanced topics.
    3. Include 3-5 topics per week, depending on the user's time commitment.
    4. For each topic, recommend 2-3 high-quality resources (videos, articles, or courses).
    5. Ensure resources are beginner-friendly for skill levels 1-2 and advanced for skill levels 3-5.

    **Output Format (JSON Only):**
    {
      "weeks": [
        {
          "week": 1,
          "topics": ["Topic 1", "Topic 2"],
          "resources": [
            {
              "type": "video/article/course",
              "title": "Resource Title",
              "url": "https://...",
              "duration": "10 min", // Optional
              "difficulty": "beginner/intermediate/advanced" // Optional
            }
          ]
        }
      ]
    }

    **Important:**
    - Return only valid JSON.
    - Do not include Markdown formatting (e.g., **Week 1**).
    - Ensure all URLs are valid and accessible.
    `;

    const result = await model.generateContent(roadmapPrompt);
    const responseText = await result.response.text(); // Ensure `text()` is called to get the string.

    try {
      const cleanedResponse = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const roadmap = JSON.parse(cleanedResponse) as RoadmapData;
      localStorage.setItem(cacheKey, JSON.stringify(roadmap)); // Cache result
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

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AssessmentData, QuizData, RoadmapData } from '../types/assessment';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

export async function generateQuiz(userInput: {
  goal: string;
  skillLevel: number;
  focusAreas: string[];
}): Promise<QuizData> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate 5 quiz questions for learning goal: ${userInput.goal}, 
      skill level: ${userInput.skillLevel}, focus areas: ${userInput.focusAreas.join(', ')}.
      Format: ${JSON.stringify({
        questions: [
          {
            text: 'question',
            type: 'multiple_choice/open_ended',
            options: ['choices...'],
          },
        ],
      })}`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as QuizData;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

export async function generateRoadmap(data: AssessmentData): Promise<RoadmapData> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create 4-week roadmap for: ${data.goal}, 
      skill: ${data.skillLevel}, quiz responses: ${JSON.stringify(data.quizResponses)}.
      Format: ${JSON.stringify({
        weeks: [
          {
            week: 1,
            topics: ['...'],
            resources: [{ type: 'video/article', title: '...', url: '...' }],
          },
        ],
      })}`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as RoadmapData;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw error;
  }
}
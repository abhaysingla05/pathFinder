// lib/prompts/index.ts
import { AssessmentData } from '../../types/assessment';
import { QuizGenerationInput } from '../types/gemini';

export const SYSTEM_PROMPTS = {
  quiz: `You are an expert educational assessment system designed to create adaptive learning quizzes.
Your goal is to accurately evaluate a learner's knowledge and capabilities.`,
  roadmap: `You are an expert learning path designer with deep knowledge of educational psychology 
and modern learning methodologies. Your goal is to create personalized, effective learning journeys.`
};

export const getQuizPrompt = (input: QuizGenerationInput) => {
  const difficultyMapping = {
    1: { level: 'beginner', focus: 'fundamental concepts' },
    2: { level: 'beginner-intermediate', focus: 'basic applications' },
    3: { level: 'intermediate', focus: 'practical implementations' },
    4: { level: 'intermediate-advanced', focus: 'complex scenarios' },
    5: { level: 'advanced', focus: 'expert-level problems' }
  };

  const difficulty = difficultyMapping[input.skillLevel as keyof typeof difficultyMapping];

  return {
    system: SYSTEM_PROMPTS.quiz,
    user: `Generate a quiz with EXACTLY this structure:
{
  "questions": [
    {
      "id": "mc1",
      "text": "your multiple choice question here",
      "type": "multiple_choice",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "option1"
    },
    {
      "id": "oe1",
      "text": "your open ended question here",
      "type": "open_ended"
    }
  ]
}

Requirements:
- EXACTLY 3 multiple-choice questions
- EXACTLY 2 open-ended questions
- Each multiple-choice question must have EXACTLY 4 options
- Questions should be about: ${input.goal}
- Difficulty level: ${difficulty.level}
- Focus areas: ${input.focusAreas.join(', ')}

Return ONLY the JSON, no additional text or formatting.`
  };
};

export const getRoadmapPrompt = (data: AssessmentData) => {
  return {
    system: SYSTEM_PROMPTS.roadmap,
    user: `Create a personalized learning roadmap based on:

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

Return ONLY a JSON object with this EXACT structure:
{
  "weeks": [
    {
      "week": number,
      "topics": ["topic1", "topic2"],
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
}`
  };
};
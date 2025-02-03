// lib/prompts/index.ts
import { AssessmentData } from '../../types/assessment';
import { QuizGenerationInput } from '../types/gemini';

export const SYSTEM_PROMPTS = {
  quiz: `You are an expert educational assessment system designed to create adaptive learning quizzes.
Your goal is to accurately evaluate a learner's knowledge and capabilities.`,
  roadmap: `You are an expert learning path designer with deep knowledge of educational psychology 
and modern learning methodologies. Your goal is to create personalized, effective learning journeys.`
};

// lib/prompts/index.ts
export const getQuizPrompt = (input: QuizGenerationInput) => {
  const difficulty = input.skillLevel <= 2 ? 'beginner' : 
                    input.skillLevel <= 4 ? 'intermediate' : 'advanced';

  return {
    system: SYSTEM_PROMPTS.quiz,
    user: `
Generate a multiple-choice quiz with EXACTLY this structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "Clear question text here",
      "type": "multiple_choice",
      "category": "${input.goal}",
      "skillArea": "${input.focusAreas[0] || input.goal}",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "option1",
      "difficulty": "${difficulty}",
      "points": 10,
      "explanation": "Explanation of the correct answer"
    }
  ]
}

Requirements:
- Generate EXACTLY 5 questions
- Each question MUST have EXACTLY 4 options
- Questions must be about: ${input.goal}
- Focus on these areas: ${input.focusAreas.join(', ')}
- All questions must be multiple-choice
- Each question must have a clear explanation
- Points should be between 10-20

Return ONLY valid JSON matching the exact structure above.`
  };
};

// lib/prompts/index.ts
export const getRoadmapPrompt = (data: AssessmentData) => {
  // Calculate content density based on time commitment
  const hoursPerWeek = data.timeCommitment;
  const contentDensity = hoursPerWeek <= 5 ? 'focused' : 
                        hoursPerWeek <= 10 ? 'balanced' : 
                        'comprehensive';
  
  // Fixed number of weeks for complete course coverage
  const totalWeeks = 12; // Standard course duration

  return {
    system: SYSTEM_PROMPTS.roadmap,
    user: `
Create a ${totalWeeks}-week learning roadmap for ${data.goal}, optimized for ${hoursPerWeek} hours/week:

User Profile:
- Skill Level: ${data.skillLevel}/5
- Focus Areas: ${data.focusAreas.join(', ')}
- Time Available: ${hoursPerWeek} hours/week

${data.quizAnalysis ? `
Performance Analysis:
- Strengths: ${data.quizAnalysis.strengthAreas.join(', ')}
- Areas for Improvement: ${data.quizAnalysis.improvementAreas.join(', ')}
- Knowledge Gaps: ${data.quizAnalysis.knowledgeGaps.map(gap => 
  `${gap.area} (Level ${gap.currentLevel}/5)`
).join(', ')}
` : ''}

Weekly Structure (${hoursPerWeek} hours/week):
${hoursPerWeek <= 5 ? `
- 1-2 core topics per week
- 2-3 focused resources
- 1 small practical exercise
- Estimated 1 hour per resource` :
hoursPerWeek <= 10 ? `
- 2-3 topics per week
- 3-4 balanced resources
- 1 medium project
- Estimated 2 hours per resource` : `
- 3-4 topics per week
- 4-5 comprehensive resources
- 1 major project
- Estimated 3 hours per resource`}

Return a JSON object with this structure:
{
  "weeks": [
    {
      "week": number,
      "theme": "Weekly theme",
      "topics": ["Topic list based on time commitment"],
      "resources": [
        {
          "type": "video/article/course",
          "title": "Resource title",
          "url": "URL",
          "duration": "${Math.floor(hoursPerWeek / 3)} hours",
          "difficulty": "beginner/intermediate/advanced",
          "category": "Topic category"
        }
      ],
      "project": {
        "title": "Weekly project",
        "description": "Project details",
        "estimatedHours": ${Math.ceil(hoursPerWeek * 0.4)},
        "type": "practice/implementation/comprehensive"
      },
      "weeklyHours": ${hoursPerWeek}
    }
  ],
  "metadata": {
    "totalWeeks": ${totalWeeks},
    "weeklyCommitment": ${hoursPerWeek},
    "difficulty": "${data.skillLevel <= 2 ? 'beginner' : data.skillLevel <= 4 ? 'intermediate' : 'advanced'}",
    "focusAreas": ${JSON.stringify(data.focusAreas)}
  }
}

Important Guidelines:
1. Each week's content should fit within ${hoursPerWeek} hours
2. Maintain progressive difficulty scaling
3. Focus on ${data.quizAnalysis?.improvementAreas.join(', ') || 'core concepts'}
4. Include practical applications
5. Resources should be from reputable sources
6. Projects should reinforce weekly learning

Return ONLY the JSON object, no additional text.`
  };
};
// In lib/prompts/index.ts
// In lib/prompts/index.ts
export const getWeeklyQuizPrompt = (topics: string[], weekNumber: number) => {
  return {
    system: SYSTEM_PROMPTS.quiz,
    user: `
Generate a quiz specifically about these topics for Week ${weekNumber}:
${topics.map(topic => `- ${topic}`).join('\n')}

Requirements:
1. Generate EXACTLY 5 questions with this structure:
{
  "questions": [
    {
      "id": "string",
      "text": "question text",
      "type": "multiple_choice" | "open_ended",
      "category": "topic category",
      "skillArea": "specific topic area",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "points": number,
      "options": ["option1", "option2", "option3", "option4"] (for multiple_choice only),
      "correctAnswer": "string",
      "explanation": "explanation of the correct answer"
    }
  ]
}

2. Include:
   - 3 multiple-choice questions
   - 2 open-ended questions
3. Each question MUST be directly related to the given topics
4. Multiple-choice questions must have EXACTLY 4 options
5. Questions should test understanding and application of concepts

Important:
- Questions must be specifically about: ${topics.join(', ')}
- Include practical applications and real-world scenarios
- Ensure questions test different levels of understanding

Return ONLY the JSON, no additional text or formatting.`
  };
};
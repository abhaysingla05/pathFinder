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
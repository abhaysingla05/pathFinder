// src/types/assessment.ts
export interface AssessmentData {
  goal: string;
  skillLevel: number; // 1 = Beginner, 5 = Expert
  focusAreas: string[];
  learningPreferences: string[];
  timeCommitment: number; // Hours per week
  learningStyle: string; // Visual, Auditory, Kinesthetic, Reading/Writing
  additionalContext?: string; // Optional
  quizResponses: QuizResponse[];
  generatedQuiz?: QuizData;
  roadmap?: RoadmapData;
  isCustomGoal?: boolean; // Add this line
  quizAnalysis?: QuizAnalysis; // Add this line
}

export interface QuizAnalysis {
  totalScore: number;
  maxPossibleScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  adjustedSkillLevel: {
    overall: number;
    byArea: Record<string, number>;
  };
  knowledgeGaps: {
    area: string;
    concepts: string[];
    currentLevel: number;
  }[];
}
  export interface QuizResponse {
    questionId: string;
    answer: string;
    isCorrect?: boolean;
    points?: number;
}
  
  export interface QuizData {
    questions: QuizQuestion[];
  }
  export interface QuizAnalysis {
    totalScore: number;
    maxPossibleScore: number;
    strengthAreas: string[];
    improvementAreas: string[];
    adjustedSkillLevel: {
      overall: number; // Adjusted from self-reported skill level based on quiz performance
      byArea: Record<string, number>; // Detailed breakdown by focus area
    };
    knowledgeGaps: {
      area: string;
      concepts: string[];
      currentLevel: number;
    }[];
  }
  
  
  
  export interface QuizQuestion {
    id: string;
    text: string;
    type: 'multiple_choice' | 'open_ended';
    category: string; // e.g., 'fundamentals', 'advanced', 'practical'
    skillArea: string; // maps to focusAreas
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    options?: string[];
    correctAnswer?: string;
    explanation?: string; // Explains the correct answer
    points: number; // Weight of the question
}


  
  export interface RoadmapData {
    weeks: RoadmapWeek[];
  }
  
  export interface RoadmapWeek {
    week: number;
    topics: string[];
    resources: LearningResource[];
    progress?: number; // e.g., 50 for 50%
  }
  
  export interface LearningResource {
    type: 'video' | 'article' | 'course';
    title: string;
    url: string;
    duration?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    category: string; // e.g., "Web Development"
  }
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
// types/assessment.ts
export type ProgressCallback = (chunk: number, total: number, status: string) => void;
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
  metadata: RoadmapMetadata;
}

export interface RoadmapWeek {
  week: number;
  theme: string;
  topics: string[];
  resources: LearningResource[];
  projects: Project[];  // For multiple projects
  project?: Project;    // For single project
  weeklyHours: number;
  assessmentCriteria?: string[];
  progress?: number;
}

export interface LearningResource {
  type: 'video' | 'article' | 'course';
  title: string;
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  description?: string;
}
export interface Project {
  title: string;
  description: string;
  estimatedHours: number;
  type: 'practice' | 'implementation' | 'comprehensive';
  requirements?: string[];
  skillsGained?: string[];
}

export interface RoadmapMetadata {
  totalWeeks: number;
  weeklyCommitment: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  totalDuration?: string;
  prerequisites?: string[];
  estimatedCompletion?: string;
  learningPath?: string;
}
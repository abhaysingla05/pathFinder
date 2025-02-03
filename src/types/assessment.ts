

// Assessment Data Type
export interface AssessmentData {
  goal: string;
  skillLevel: number; // 1 = Beginner, 5 = Expert
  focusAreas: string[];
  learningPreferences: string[];
  timeCommitment: number; // Hours per week
  learningStyle: string; // Visual, Auditory, Kinesthetic, Reading/Writing
  additionalContext?: string; // Optional
  quizResponses: QuizResponse[]; // Responses to quizzes (both initial and weekly)
  generatedQuiz?: QuizData; // Initial quiz data
  weeklyQuizzes?: WeeklyQuizData[]; // Weekly quizzes for adaptive learning
  roadmap?: RoadmapData; // Generated roadmap
  isCustomGoal?: boolean; // Indicates if the goal is user-defined
  quizAnalysis?: QuizAnalysis; // Analysis of the initial quiz
  weeklyQuizAnalyses?: WeeklyQuizAnalysis[]; // Analyses of weekly quizzes
}

// Progress Callback Type
export type ProgressCallback = (chunk: number, total: number, status: string) => void;

// Initial Quiz Types
export interface InitialQuizData extends QuizData {
  purpose: 'skill_assessment'; // Indicates this is the initial quiz
}

export interface InitialQuizAnalysis extends QuizAnalysis {
  purpose: 'skill_assessment'; // Indicates this is the analysis for the initial quiz
}

// Weekly Quiz Types

export interface WeeklyQuizData {
  data: {
    questions: MultipleChoiceQuestion[];
  };
  metadata: {
    generatedAt: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    adaptiveLevel: number;
  };
  purpose: 'adaptive_learning';
  weekNumber: number;
}
// types/assessment.ts
export interface MultipleChoiceQuestion {
  id: string;
  text: string;  // This is what will be displayed as the question
  type: 'multiple_choice';
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  category: string;
  skillArea: string;

}

export interface WeeklyQuizAnalysis extends QuizAnalysis {
  purpose: 'adaptive_learning'; // Indicates this is the analysis for a weekly quiz
  weekNumber: number; // Week number in the roadmap
}

// Quiz Analysis Type
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

// Quiz Response Type
export interface QuizResponse {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  points?: number;
}

// Quiz Data Type
export interface QuizData {
  questions: QuizQuestion[];
}

// Quiz Question Type
// types/assessment.ts
export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'open_ended';
  category: string;
  skillArea: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

// types/assessment.ts
export interface RoadmapData {
  weeks: RoadmapWeek[];
  metadata: {
    totalWeeks: number;
    weeklyCommitment: number;
    difficulty: string;
    focusAreas: string[];
  };
}

// Roadmap Week Type
export interface RoadmapWeek {
  week: number;
  theme: string;
  topics: string[];
  isLoaded?: boolean;
  resources?: LearningResource[];
  project: {
    title: string;
    description: string;
    estimatedHours: number;
  };
  weeklyHours?: number;
  
  quiz?: WeeklyQuizData;
  completed?: boolean;
  quizPassed?: boolean;
  adaptiveLevel?: number; // 1-5 for difficulty adjustment
}

// Learning Resource Type
export interface LearningResource {
  type: 'video' | 'article' | 'course';
  title: string;
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  description?: string;
}

// Project Type
export interface Project {
  title: string;
  description: string;
  estimatedHours: number;
  type: 'practice' | 'implementation' | 'comprehensive';
  requirements?: string[];
  skillsGained?: string[];
}

// Roadmap Metadata Type
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


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
    questions: QuizQuestion[];
  };
  metadata: {
    generatedAt: string;
  };
  purpose: 'adaptive_learning'; // Indicates this is a weekly quiz
  weekNumber: number; // Week number in the roadmap
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
export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'open_ended';
  category: string; // e.g., 'fundamentals', 'advanced', 'practical'
  skillArea: string; // Maps to focusAreas
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  options?: string[]; // For multiple-choice questions
  correctAnswer?: string; // For multiple-choice or open-ended questions
  explanation?: string; // Explains the correct answer
  points: number; // Weight of the question
}

// Roadmap Data Type
export interface RoadmapData {
  weeks: RoadmapWeek[];
  metadata: RoadmapMetadata;
}

// Roadmap Week Type
export interface RoadmapWeek {
  week: number;
  theme: string;
  topics: string[];
  resources: LearningResource[];
  projects: Project[]; // For multiple projects
  project?: Project; // For single project
  weeklyHours: number;
  assessmentCriteria?: string[];
  progress?: number; // Percentage completion of the week
  quiz?: WeeklyQuizData; // Weekly quiz for adaptive learning
  completed?: boolean; // Whether the week is marked as completed
  quizPassed?: boolean; // Whether the user passed the quiz for this week
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
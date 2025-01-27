export interface AssessmentData {
  goal: string;
  skillLevel: number;
  focusAreas: string[];
  quizResponses: QuizResponse[];
  generatedQuiz?: QuizData;
  roadmap?: RoadmapData;
  timeCommitment: number;
}

export interface QuizResponse {
  questionId: number;
  answer: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  text: string;
  type: 'multiple_choice' | 'open_ended';
  options?: string[];
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
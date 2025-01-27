export interface AssessmentData {
    goal: string;
    skillLevel: number;
    focusAreas: string[];
    quizResponses: QuizResponse[];
    generatedQuiz?: QuizData;
    roadmap?: RoadmapData;
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
  }
  
  export interface LearningResource {
    type: 'video' | 'article';
    title: string;
    url: string;
  }
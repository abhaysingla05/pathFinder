// lib/types/gemini.ts
export interface QuizGenerationInput {
  goal: string;
  skillLevel: number;
  focusAreas: string[];
  timeCommitment: number;
}

export interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}
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

export interface CacheMetadata {
  generatedAt: string;
  goal: string;
  skillLevel: number;
  timeCommitment?: number;
  focusAreas?: string[];
  adjustedSkillLevel?: number;
}

export interface CachedItem<T> {
  data: T;
  metadata: CacheMetadata;
}
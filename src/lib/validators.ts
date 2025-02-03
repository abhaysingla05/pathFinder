//lib.validators
import { QuizData, RoadmapData } from "../types/assessment";

// Quiz Validation
// validators.ts
// lib/validators.ts
export function validateQuizStructure(quiz: any): quiz is QuizData {
  try {
    // Basic structure check
    if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
      console.error('Quiz validation: Missing questions array');
      return false;
    }

    // Log for debugging
    console.log('Validating quiz with questions:', quiz.questions.length);

    return quiz.questions.every((q: any) => {
      const isValid = 
        typeof q.id === 'string' &&
        typeof q.text === 'string' &&
        q.type === 'multiple_choice' &&
        typeof q.category === 'string' &&
        typeof q.skillArea === 'string' &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'string' &&
        typeof q.difficulty === 'string' &&
        ['beginner', 'intermediate', 'advanced'].includes(q.difficulty) &&
        typeof q.points === 'number' &&
        typeof q.explanation === 'string';

      if (!isValid) {
        console.error('Question validation failed:', {
          id: !!q.id,
          text: !!q.text,
          type: q.type === 'multiple_choice',
          category: !!q.category,
          skillArea: !!q.skillArea,
          options: Array.isArray(q.options) && q.options.length === 4,
          correctAnswer: !!q.correctAnswer,
          difficulty: ['beginner', 'intermediate', 'advanced'].includes(q.difficulty),
          points: typeof q.points === 'number',
          explanation: !!q.explanation
        });
      }

      return isValid;
    });
  } catch (error) {
    console.error('Quiz validation error:', error);
    return false;
  }
}

// Roadmap Validation
export function validateRoadmapStructure(roadmap: any): roadmap is RoadmapData {
  try {
    // Basic structure check
    if (!roadmap.weeks || !Array.isArray(roadmap.weeks)) {
      console.error('Roadmap validation: weeks array missing');
      console.log('Received roadmap structure:', JSON.stringify(roadmap, null, 2));
      return false;
    }

    // Log the actual response for debugging
    console.log('Received roadmap:', JSON.stringify(roadmap, null, 2));

    return roadmap.weeks.every((week: any, weekIndex: number) => {
      // Basic week structure
      const hasValidStructure =
        typeof week.week === 'number' &&
        Array.isArray(week.topics) &&
        Array.isArray(week.resources) &&
        week.topics.length > 0; // Ensure at least one topic per week

      if (!hasValidStructure) {
        console.error(`Roadmap validation: invalid structure in week ${weekIndex + 1}`);
        return false;
      }

      // Validate resources
      return week.resources.every((resource: any, resourceIndex: number) => {
        const isValidResource =
          typeof resource.type === 'string' &&
          ['video', 'article', 'course'].includes(resource.type) &&
          typeof resource.title === 'string' &&
          typeof resource.url === 'string' &&
          (!resource.duration || typeof resource.duration === 'string') &&
          (!resource.difficulty || ['beginner', 'intermediate', 'advanced'].includes(resource.difficulty));

        if (!isValidResource) {
          console.error(`Roadmap validation: invalid resource in week ${weekIndex + 1}, resource ${resourceIndex + 1}`);
          console.log('Invalid resource:', JSON.stringify(resource, null, 2));
        }

        return isValidResource;
      });
    });
  } catch (error) {
    console.error('Roadmap validation error:', error);
    return false;
  }
}

// Helper function to validate URLs (optional)
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Helper function to validate time duration format (optional)
function isValidDuration(duration: string): boolean {
  const durationPattern = /^\d+\s*(min|mins|hour|hours|week|weeks)$/i;
  return durationPattern.test(duration);
}

// Export helpers for use elsewhere if needed
export const ValidationHelpers = {
  isValidUrl,
  isValidDuration
};
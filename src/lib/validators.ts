import { QuizData, RoadmapData } from "../types/assessment";

// Quiz Validation
export function validateQuizStructure(quiz: any): quiz is QuizData {
  try {
    // Basic structure check
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      console.error('Quiz validation: questions array missing or not an array');
      console.log('Received quiz structure:', JSON.stringify(quiz, null, 2));
      return false;
    }

    // Log the actual response for debugging
    console.log('Received quiz:', JSON.stringify(quiz, null, 2));

    // Make validation more lenient
    const mcqCount = quiz.questions.filter((q: any) => 
      q.type === 'multiple_choice'
    ).length;
    
    const openEndedCount = quiz.questions.filter((q: any) => 
      q.type === 'open_ended'
    ).length;

    // Just ensure we have at least one question of each type
    if (mcqCount === 0 || openEndedCount === 0) {
      console.error(`Quiz validation: Need at least one question of each type. Got MCQ: ${mcqCount}, Open-ended: ${openEndedCount}`);
      return false;
    }

    // Validate each question's basic structure
    return quiz.questions.every((q: any, index: number) => {
      const hasBasicFields = 
        typeof q.text === 'string' &&
        (q.type === 'multiple_choice' || q.type === 'open_ended');

      if (!hasBasicFields) {
        console.error(`Quiz validation: question ${index + 1} missing basic fields`);
        return false;
      }

      // For multiple choice, ensure we have options
      if (q.type === 'multiple_choice') {
        return Array.isArray(q.options) && q.options.length > 0;
      }

      return true;
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
        week.topics.length > 0;  // Ensure at least one topic per week

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
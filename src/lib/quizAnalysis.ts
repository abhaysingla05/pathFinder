import { QuizAnalysis, QuizResponse } from "../types/assessment";

import { QuizQuestion } from "../types/assessment";

// lib/quizAnalysis.ts
// lib/quizAnalysis.ts
// lib/quizAnalysis.ts
function evaluateAnswer(question: QuizQuestion, response: QuizResponse): number {
    if (question.type === 'multiple_choice') {
      return response.answer === question.correctAnswer ? question.points : 0;
    }
  
    // For open-ended questions, evaluate based on multiple criteria
    const answer = response.answer.toLowerCase().trim();
    
    // Minimum length requirement (at least 50 characters for a meaningful answer)
    if (answer.length < 50) {
      return Math.floor(question.points * 0.3); // 30% of points for very short answers
    }
  
    // Check for keyword presence and proper structure
    const keywordScore = evaluateKeywords(answer, question.category, question.skillArea);
    const structureScore = evaluateStructure(answer);
    const relevanceScore = evaluateRelevance(answer, question.text);
  
    // Calculate final score
    const totalScore = (keywordScore + structureScore + relevanceScore) / 3;
    return Math.round(question.points * totalScore);
  }
  
  // Helper functions for open-ended evaluation
  function evaluateKeywords(answer: string, category: string, skillArea: string): number {
    // Define keywords based on category and skill area
    const keywords = getKeywordsForTopic(category, skillArea);
    const matchedKeywords = keywords.filter(keyword => 
      answer.includes(keyword.toLowerCase())
    );
  
    return matchedKeywords.length / Math.min(keywords.length, 5);
  }
  
  function evaluateStructure(answer: string): number {
    // Check for proper structure (sentences, paragraphs)
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hasProperStructure = sentences.length >= 2;
    const hasGoodLength = answer.length >= 100;
    const hasParagraphs = answer.includes('\n');
  
    let score = 0;
    if (hasProperStructure) score += 0.4;
    if (hasGoodLength) score += 0.3;
    if (hasParagraphs) score += 0.3;
  
    return score;
  }
  
  function evaluateRelevance(answer: string, question: string): number {
    // Extract key terms from question
    const questionTerms = question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(term => term.length > 3);
  
    // Check how many question terms are addressed in the answer
    const addressedTerms = questionTerms.filter(term => 
      answer.toLowerCase().includes(term)
    );
  
    return addressedTerms.length / questionTerms.length;
  }
  
  function getKeywordsForTopic(category: string, skillArea: string): string[] {
    // Define keywords based on category and skill area
    const keywordMap: Record<string, string[]> = {
      'fundamentals': ['concept', 'basic', 'principle', 'foundation', 'essential'],
      'practical': ['implementation', 'example', 'use case', 'application', 'practice'],
      'advanced': ['optimization', 'architecture', 'strategy', 'complex', 'advanced'],
      // Add more categories as needed
    };
  
    return keywordMap[category.toLowerCase()] || [];
  }
  
export function analyzeQuizResponses(
    questions: QuizQuestion[],
    responses: QuizResponse[],
    initialSkillLevel: number
  ): QuizAnalysis {
    const analysis: QuizAnalysis = {
      totalScore: 0,
      maxPossibleScore: 0,
      strengthAreas: [],
      improvementAreas: [],
      adjustedSkillLevel: {
        overall: initialSkillLevel, // Will be adjusted based on performance
        byArea: {}
      },
      knowledgeGaps: []
    };
  
    // Group questions by skill area
    const areaScores: Record<string, {
      earned: number;
      possible: number;
      missedConcepts: Set<string>;
    }> = {};
  
    // Analyze responses
    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) return;
  
      // Initialize area scores
      if (!areaScores[question.skillArea]) {
        areaScores[question.skillArea] = {
          earned: 0,
          possible: 0,
          missedConcepts: new Set()
        };
      }
  
      const points = evaluateAnswer(question, response);
      analysis.totalScore += points;
      analysis.maxPossibleScore += question.points;
      areaScores[question.skillArea].earned += points;
      areaScores[question.skillArea].possible += question.points;
  
      // Track missed concepts
      if (points < question.points) {
        areaScores[question.skillArea].missedConcepts.add(question.category);
      }
    });
  
    // Calculate adjusted skill levels and identify gaps
    Object.entries(areaScores).forEach(([area, score]) => {
      const percentage = (score.earned / score.possible) * 100;
      const areaLevel = Math.round((percentage / 100) * 5);
      
      analysis.adjustedSkillLevel.byArea[area] = areaLevel;
  
      if (percentage >= 70) {
        analysis.strengthAreas.push(area);
      } else {
        analysis.improvementAreas.push(area);
        
        // Record knowledge gaps
        analysis.knowledgeGaps.push({
          area,
          concepts: Array.from(score.missedConcepts),
          currentLevel: areaLevel
        });
      }
    });
  
    // Adjust overall skill level based on quiz performance
    const averagePerformance = (analysis.totalScore / analysis.maxPossibleScore) * 5;
    const skillLevelDifference = Math.abs(initialSkillLevel - averagePerformance);
    
    // Adjust more significantly if self-assessment was off by more than 1 level
    if (skillLevelDifference > 1) {
      analysis.adjustedSkillLevel.overall = averagePerformance;
    } else {
      // Weighted average between self-assessment and quiz performance
      analysis.adjustedSkillLevel.overall = Math.round(
        (initialSkillLevel * 0.3 + averagePerformance * 0.7)
      );
    }
  
    return analysis;
  }
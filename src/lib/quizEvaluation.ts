export function evaluateOpenEndedAnswer(
    answer: string,
    criteria: {
      keyPoints: string[];
      scoringRubric: {
        full: string;
        partial: string;
        minimal: string;
      };
    },
    maxPoints: number
  ): number {
    // Simple keyword-based scoring
    const keywordsFound = criteria.keyPoints.filter(point =>
      answer.toLowerCase().includes(point.toLowerCase())
    );
  
    const coverage = keywordsFound.length / criteria.keyPoints.length;
  
    if (coverage >= 0.8) return maxPoints;
    if (coverage >= 0.5) return Math.floor(maxPoints * 0.7);
    if (coverage >= 0.3) return Math.floor(maxPoints * 0.4);
    return Math.floor(maxPoints * 0.2);
  }
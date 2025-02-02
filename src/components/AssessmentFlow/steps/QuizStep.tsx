import { useState } from "react";
import { AssessmentData } from '../../../types/assessment';
import { QuizQuestion, QuizResponse } from "../types";
import { Toaster, toast } from 'sonner';
import { analyzeQuizResponses } from '../../../lib/quizAnalysis';


interface QuizStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => Promise<void>;
}

export const QuizStep = ({ data, onNext }: QuizStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({}); // Changed to string key
  const [charCount, setCharCount] = useState<number>(0);

  const isCurrentQuestionAnswered = !!answers[currentQuestion.toString()]; // Convert to string

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId.toString()]: answer })); // Convert to string
  };

  const handleOpenEndedAnswer = (answer: string) => {
    setCharCount(answer.length);
    handleAnswer(currentQuestion, answer);
  };

  const getAnswerGuidance = (question: QuizQuestion, answer: string): string => {
    if (question.type !== 'open_ended') return '';
    
    if (answer.length < 50) {
      return 'Try to write at least 50 characters for a better response';
    }
    if (answer.length < 100) {
      return 'Good start! Adding more details will improve your answer';
    }
    return 'Great length! Make sure you have  addressed all aspects of the question';
  };

  const handleSubmit = async () => {
    if (!isCurrentQuestionAnswered) {
      toast.error('Please answer the question before proceeding');
      return;
    }

    try {
      const quizResponses: QuizResponse[] = Object.entries(answers).map(([questionId, answer]) => {
        const question = data.generatedQuiz!.questions[parseInt(questionId)];
        return {
          questionId: questionId, // Already a string
          answer,
          isCorrect: question.type === 'multiple_choice' ? 
            answer === question.correctAnswer : undefined,
          points: undefined // Will be calculated by analysis
        };
      });

      // Analyze responses
      const analysis = analyzeQuizResponses(
        data.generatedQuiz!.questions,
        quizResponses,
        data.skillLevel
      );

      await onNext({ 
        ...data, 
        quizResponses,
        quizAnalysis: analysis,
        skillLevel: analysis.adjustedSkillLevel.overall
      });
    } catch (error) {
      toast.error('Failed to analyze responses. Please try again.');
    }
  };

  if (!data.generatedQuiz) return null;

  const question = data.generatedQuiz.questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Deep Dive Assessment</h2>
      
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-600 rounded-full" 
            style={{ width: `${((currentQuestion + 1) / data.generatedQuiz.questions.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {data.generatedQuiz.questions.length}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-lg mb-3">{question.text}</p>
        {question.type === 'multiple_choice' ? (
          <div className="space-y-2">
            {question.options?.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(currentQuestion, opt)}
                className={`w-full p-3 text-left border rounded-lg ${
                  answers[currentQuestion] === opt ? 'bg-blue-50 border-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full p-3 border rounded-lg min-h-[150px]"
              placeholder="Type your answer... (aim for at least 100 characters)"
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleOpenEndedAnswer(e.target.value)}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{charCount} characters</span>
              <span>{getAnswerGuidance(question, answers[currentQuestion] || '')}</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Tips for a good answer:</p>
              <ul className="text-sm text-blue-700 list-disc pl-5">
                <li>Address all parts of the question</li>
                <li>Use specific examples when possible</li>
                <li>Explain your reasoning</li>
                <li>Structure your answer with clear paragraphs</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        {currentQuestion > 0 && (
          <button
            type="button"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="bg-gray-100 px-6 py-3 rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
        )}
        
        <button
          type="button"
          onClick={() => {
            if (currentQuestion < data.generatedQuiz!.questions.length - 1) {
              if (!isCurrentQuestionAnswered) {
                toast.error('Please answer the question before proceeding');
                return;
              }
              setCurrentQuestion(prev => prev + 1);
            } else {
              handleSubmit();
            }
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg ml-auto hover:bg-blue-700"
        >
          {currentQuestion === data.generatedQuiz.questions.length - 1 ? 'Generate Roadmap →' : 'Next →'}
        </button>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};
import { useState } from "react";
import { AssessmentData, QuizQuestion } from "../types";

interface QuizStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => Promise<void>;
}

export const QuizStep = ({ data, onNext }: QuizStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const quizResponses = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer
    }));
    await onNext({ ...data, quizResponses });
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
          <textarea
            className="w-full p-3 border rounded-lg"
            placeholder="Type your answer..."
            value={answers[currentQuestion] || ''}
            onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
          />
        )}
      </div>

      <div className="flex justify-between">
        {currentQuestion > 0 && (
          <button
            type="button"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="bg-gray-100 px-6 py-3 rounded-lg"
          >
            ← Back
          </button>
        )}
        
        <button
          type="button"
          onClick={() => {
            if (currentQuestion < data.generatedQuiz!.questions.length - 1) {
              setCurrentQuestion(prev => prev + 1);
            } else {
              handleSubmit();
            }
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg ml-auto"
        >
          {currentQuestion === data.generatedQuiz.questions.length - 1 ? 'Generate Roadmap →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};
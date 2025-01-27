import { useState } from 'react';
import { AssessmentData } from '../../types/assessment';
import GoalStep from './steps/GoalStep';
import { FocusStep } from './steps/FocusStep';
import { QuizStep } from './steps/QuizStep';
import { RoadmapDisplay } from './steps/RoadmapDisplay';
import { generateQuiz, generateRoadmap } from '../../lib/gemini';

interface AssessmentFlowProps {
  onClose: () => void;
}

export default function AssessmentFlow({ onClose }: AssessmentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    goal: '',
    skillLevel: 3,
    focusAreas: [],
    quizResponses: [],
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    <GoalStep
      key="goal"
      data={assessmentData}
      onNext={(data) => {
        setAssessmentData(data);
        setCurrentStep(1);
      }}
    />,
    <FocusStep
      key="focus"
      data={assessmentData}
      onNext={async (data: AssessmentData) => {
        setLoading(true);
        try {
          const quiz = await generateQuiz(data);
          setAssessmentData({ ...data, generatedQuiz: quiz });
          setCurrentStep(2);
        } finally {
          setLoading(false);
        }
      }}
    />,
    <QuizStep
      key="quiz"
      data={assessmentData}
      onNext={async (data) => {
        setLoading(true);
        try {
          const roadmap = await generateRoadmap(data);
          setAssessmentData({ ...data, roadmap });
          setCurrentStep(3);
        } finally {
          setLoading(false);
        }
      }}
    />,
    assessmentData.roadmap ? (
      <RoadmapDisplay key="roadmap" data={assessmentData.roadmap} onClose={onClose} />
    ) : (
      <div>Loading roadmap...</div>
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent" />
          <p className="mt-4 text-gray-600">AI is crafting your perfect learning path...</p>
        </div>
      ) : (
        steps[currentStep]
      )}
    </div>
  );
}
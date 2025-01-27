// components/AssessmentFlow/AssessmentFlow.tsx
import { useState } from 'react';
import { AssessmentData } from '../../types/assessment';
import GoalStep from './steps/GoalStep';
import FocusStep from './steps/FocusStep';
import { QuizStep } from './steps/QuizStep';
import { RoadmapDisplay } from './steps/RoadmapDisplay';
import { generateQuiz, generateRoadmap } from '../../lib/gemini';
import { Toaster, toast } from 'sonner';
import { ProgressBar } from './ProgressBar'; // NEW
import { SkeletonLoader } from './SkeletonLoader'; // NEW
import { SummaryStep } from './steps/SummaryStep';
import { TimeCommitmentStep } from './steps/TimeCommitmentStep';

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
    timeCommitment:20,
  });
  const [loading, setLoading] = useState(false);
  const totalSteps = 4; // NEW: Total steps for progress bar

  const handleNext = async (data: AssessmentData) => {
    try {
      setAssessmentData(data);
      if (currentStep === 1) {
        setLoading(true);
        const quiz = await generateQuiz(data);
        setAssessmentData((prev) => ({ ...prev, generatedQuiz: quiz }));
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setLoading(true);
        const roadmap = await generateRoadmap(data);
        setAssessmentData((prev) => ({ ...prev, roadmap }));
        setCurrentStep(3);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.'); // NEW: Error handling
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    <GoalStep key="goal" data={assessmentData} onNext={handleNext} />,
    <FocusStep key="focus" data={assessmentData} onNext={handleNext} />,
    <TimeCommitmentStep key="time" data={assessmentData} onNext={handleNext} />, // NEW
    <QuizStep key="quiz" data={assessmentData} onNext={handleNext} />,
    <SummaryStep key="summary" data={assessmentData} onNext={() => setCurrentStep(5)} />,
    assessmentData.roadmap ? (
      <RoadmapDisplay key="roadmap" data={assessmentData.roadmap} onClose={onClose} />
    ) : (
      <div>Loading roadmap...</div>
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="max-w-2xl mx-auto py-12">
          <SkeletonLoader /> {/* NEW: Skeleton loader */}
        </div>
      ) : (
        <>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} /> {/* NEW: Progress bar */}
          {steps[currentStep]}
        </>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
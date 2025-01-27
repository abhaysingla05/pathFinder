// components/AssessmentFlow/AssessmentFlow.tsx
import { useState } from 'react';
import { AssessmentData } from '../../types/assessment';
import GoalStep from './steps/GoalStep';
import FocusStep from './steps/FocusStep';
import { QuizStep } from './steps/QuizStep';
import { RoadmapDisplay } from './steps/RoadmapDisplay';
import { generateQuiz, generateRoadmap } from '../../lib/gemini';
import { Toaster, toast } from 'sonner';
import { ProgressBar } from './ProgressBar';
import { SkeletonLoader } from './SkeletonLoader';
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
    learningPreferences: [],
    learningStyle: '',
    timeCommitment: 5,
    quizResponses: [],
    isCustomGoal: false
  });
  const [loading, setLoading] = useState(false);
  const totalSteps = 5; // Goal -> Focus -> Time -> Quiz -> Roadmap

  const handleNext = async (data: AssessmentData) => {
    try {
      setAssessmentData(data);
      
      // Generate quiz after time commitment
      if (currentStep === 2) {
        setLoading(true);
        const quiz = await generateQuiz({
          goal: data.goal,
          skillLevel: data.skillLevel,
          focusAreas: data.focusAreas,
          timeCommitment: data.timeCommitment
        });
        setAssessmentData((prev) => ({ ...prev, generatedQuiz: quiz }));
      } 
      // Generate roadmap after quiz
      else if (currentStep === 3) {
        setLoading(true);
        const roadmap = await generateRoadmap(data);
        setAssessmentData((prev) => ({ ...prev, roadmap }));
      }
      
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error('Error in assessment flow:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    <GoalStep 
      key="goal" 
      data={assessmentData} 
      onNext={handleNext} 
    />,
    <FocusStep 
      key="focus" 
      data={assessmentData} 
      onNext={handleNext} 
    />,
    <TimeCommitmentStep 
      key="time" 
      data={assessmentData} 
      onNext={handleNext} 
    />,
    assessmentData.generatedQuiz ? (
      <QuizStep 
        key="quiz" 
        data={assessmentData} 
        onNext={handleNext} 
      />
    ) : null,
    assessmentData.roadmap ? (
      <RoadmapDisplay 
        key="roadmap" 
        data={assessmentData.roadmap} 
        onClose={onClose} 
      />
    ) : (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="max-w-2xl mx-auto py-12">
          <SkeletonLoader />
          <p className="text-center text-gray-600 mt-4">
            {currentStep === 2 
              ? 'Generating your personalized quiz...' 
              : 'Creating your learning roadmap...'}
          </p>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />
          {steps[currentStep]}
        </div>
      )}
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
      />
    </div>
  );
}
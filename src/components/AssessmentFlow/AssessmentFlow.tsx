// components/AssessmentFlow/AssessmentFlow.tsx
import { useState } from 'react';
import { AssessmentData } from '../../types/assessment';
import GoalStep from './steps/GoalStep';
import FocusStep from './steps/FocusStep';
import { QuizStep } from './steps/QuizStep';
import { RoadmapDisplay } from './steps/RoadmapDisplay';
import { generateQuiz, generateRoadmap } from '../../lib/gemini';
import { Toaster, toast } from 'sonner';
import { TimeCommitmentStep } from './steps/TimeCommitmentStep';
import { LoadingState } from '../common/LoadingState';
import { ProgressBar } from '../common/ProgressBar';

interface AssessmentFlowProps {
  onClose: () => void;
}

export default function AssessmentFlow({ onClose }: AssessmentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
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
  const totalSteps = 5;

  // Helper function to simulate progress
  const startProgressSimulation = () => {
    setLoadingProgress(0);
    return setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);
  };

  const handleNext = async (data: AssessmentData) => {
    try {
      setAssessmentData(data);
      
      if (currentStep === 2) { // After TimeCommitmentStep
        setLoading(true);
        setLoadingMessage('Crafting your personalized assessment...');
        
        // Start progress simulation
        const progressInterval = startProgressSimulation();
        
        try {
          const quiz = await generateQuiz({
            goal: data.goal,
            skillLevel: data.skillLevel,
            focusAreas: data.focusAreas,
            timeCommitment: data.timeCommitment
          });
          
          // Complete progress and cleanup
          clearInterval(progressInterval);
          setLoadingProgress(100);
          
          setAssessmentData((prev) => ({ ...prev, generatedQuiz: quiz }));
          setCurrentStep((prev) => prev + 1);
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      } 
      else if (currentStep === 3) { // After QuizStep
        setLoading(true);
        setLoadingMessage('Building your personalized learning roadmap...');
        
        const progressInterval = startProgressSimulation();
        
        try {
          const roadmap = await generateRoadmap(data);
          
          // Complete progress and cleanup
          clearInterval(progressInterval);
          setLoadingProgress(100);
          
          setAssessmentData((prev) => ({ ...prev, roadmap }));
          setCurrentStep((prev) => prev + 1);
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      } 
      else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error in assessment flow:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
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
    ) : null,
  ];

  const getStepProgress = () => {
    return ((currentStep + 1) / totalSteps) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Always show overall progress */}
        <ProgressBar 
          progress={getStepProgress()}
          message={`Step ${currentStep + 1} of ${totalSteps}`}
        />

        {loading ? (
          <div className="mt-8">
            <LoadingState message={loadingMessage} />
            <div className="mt-8">
              <ProgressBar 
                progress={loadingProgress}
                message={loadingMessage}
              />
            </div>
          </div>
        ) : (
          <div className="mt-8">
            {steps[currentStep]}
          </div>
        )}
      </div>

      <Toaster 
        position="top-center" 
        richColors 
        closeButton
      />
    </div>
  );
}
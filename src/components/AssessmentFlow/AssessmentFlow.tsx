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
import { analyzeQuizResponses } from '../../lib/quizAnalysis';

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
      if (currentStep === 2) { // After TimeCommitmentStep
        setLoading(true);
        setLoadingMessage('Crafting your personalized assessment...');
        const progressInterval = startProgressSimulation();
        
        try {
          const quiz = await generateQuiz({
            goal: data.goal,
            skillLevel: data.skillLevel,
            focusAreas: data.focusAreas,
            timeCommitment: data.timeCommitment
          });
          
          clearInterval(progressInterval);
          setLoadingProgress(100);
          
          setAssessmentData(prev => ({ ...prev, ...data, generatedQuiz: quiz }));
          setCurrentStep(prev => prev + 1);
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      } 
      else if (currentStep === 3) { // After QuizStep
        setLoading(true);
        setLoadingMessage('Analyzing your quiz responses...');

        if (!data.generatedQuiz || !data.quizResponses.length) {
          throw new Error('Quiz data is missing');
        }
        // Analyze quiz responses
        const quizAnalysis = analyzeQuizResponses(
          data.generatedQuiz!.questions,
          data.quizResponses,
          data.skillLevel
        );
        // Ensure we have a valid skill level
      const adjustedSkillLevel = Number(quizAnalysis.adjustedSkillLevel.overall) || data.skillLevel;

        // Update data with quiz analysis and adjusted skill level
        const updatedData = {
          ...data,
          quizAnalysis,
          skillLevel: adjustedSkillLevel
        };
        console.log('Updated assessment data:', updatedData);

        setLoadingMessage('Creating your personalized learning roadmap...');
        const progressInterval = startProgressSimulation();
        
        try {
          const roadmap = await generateRoadmap(updatedData);
          clearInterval(progressInterval);
          setLoadingProgress(100);
          
          setAssessmentData(prev => ({ ...prev, ...updatedData, roadmap }));
          setCurrentStep(prev => prev + 1);
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      } 
      else {
        setAssessmentData(prev => ({ ...prev, ...data }));
        setCurrentStep(prev => prev + 1);
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
    <GoalStep key="goal" data={assessmentData} onNext={handleNext} />,
    <FocusStep key="focus" data={assessmentData} onNext={handleNext} />,
    <TimeCommitmentStep key="time" data={assessmentData} onNext={handleNext} />,
    assessmentData.generatedQuiz ? (
      <QuizStep key="quiz" data={assessmentData} onNext={handleNext} />
    ) : null,
    assessmentData.roadmap ? (
      <RoadmapDisplay
      key="roadmap"
      data={assessmentData.roadmap}
      assessmentData={assessmentData} // Pass assessmentData here
      onClose={onClose}
    />
    ) : null,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProgressBar 
          progress={((currentStep + 1) / totalSteps) * 100}
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
          <div className="mt-8">{steps[currentStep]}</div>
        )}
      </div>

      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
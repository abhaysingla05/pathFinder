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
      const validatedData = {
        ...data,
        skillLevel: isNaN(data.skillLevel) ? 1 : Math.min(Math.max(Math.round(data.skillLevel), 1), 5),
        focusAreas: data.focusAreas?.length ? data.focusAreas : ['fundamentals'],
        timeCommitment: data.timeCommitment || 10,
        learningPreferences: data.learningPreferences || [],
        learningStyle: data.learningStyle || 'visual',
        quizResponses: data.quizResponses || []
      };
      if (currentStep === 2) { // After TimeCommitmentStep
        setLoading(true);
        setLoadingMessage('Crafting your personalized assessment...');
        const progressInterval = startProgressSimulation();
        
        try {
          const quiz = await generateQuiz({
            goal: validatedData.goal,
            skillLevel: validatedData.skillLevel,
            focusAreas: validatedData.focusAreas,
            timeCommitment: validatedData.timeCommitment
          });
          
          clearInterval(progressInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setAssessmentData(prev => ({ ...prev, ...validatedData, generatedQuiz: quiz }));
            setCurrentStep(prev => prev + 1);
          }, 0);
        } catch (error) {
          clearInterval(progressInterval);
          console.error('Quiz generation error:', error);
          toast.error('Failed to generate quiz. Using fallback questions.');
        }
      } 
      else if (currentStep === 3) { // After QuizStep
        setLoading(true);
        setLoadingMessage('Analyzing your quiz responses...');

        if (!validatedData.generatedQuiz || !validatedData.quizResponses.length) {
          throw new Error('Quiz data is missing');
        }

        const quizAnalysis = analyzeQuizResponses(
          validatedData.generatedQuiz.questions,
          validatedData.quizResponses,
          validatedData.skillLevel
        );

        const adjustedSkillLevel = Number(quizAnalysis.adjustedSkillLevel.overall) || validatedData.skillLevel;

        const updatedData = {
          ...validatedData,
          quizAnalysis,
          skillLevel: adjustedSkillLevel
        };

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
        setAssessmentData(prev => ({ ...prev, ...validatedData }));
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
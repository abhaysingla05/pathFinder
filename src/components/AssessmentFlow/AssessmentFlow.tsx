// components/AssessmentFlow/AssessmentFlow.tsx
import { useState } from 'react';
import { AssessmentData,ProgressCallback } from '../../types/assessment';
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

interface GenerationProgress {
  currentChunk: number;
  totalChunks: number;
  status: string;
}

export default function AssessmentFlow({ onClose }: AssessmentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    currentChunk: 0,
    totalChunks: 3, // 12 weeks divided into 3 chunks of 4 weeks each
    status: ''
  });
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

  const startProgressSimulation = (chunkIndex: number) => {
    setLoadingProgress(0);
    setGenerationProgress(prev => ({
      ...prev,
      currentChunk: chunkIndex,
      status: `Generating weeks ${chunkIndex * 4 + 1}-${Math.min((chunkIndex + 1) * 4, 12)}`
    }));

    return setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);
  };

  const calculateTotalProgress = () => {
    const baseProgress = (currentStep / totalSteps) * 100;
    if (loading) {
      const chunkProgress = (generationProgress.currentChunk / generationProgress.totalChunks) * 100;
      const stepProgress = loadingProgress / generationProgress.totalChunks;
      return baseProgress + (chunkProgress + stepProgress) / totalSteps;
    }
    return baseProgress;
  };

  const handleNext = async (data: AssessmentData) => {
    try {
      if (currentStep === 2) { // After TimeCommitmentStep
        setLoading(true);
        setLoadingMessage('Crafting your personalized assessment...');
        const progressInterval = startProgressSimulation(0);
        
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
  
        const quizAnalysis = analyzeQuizResponses(
          data.generatedQuiz.questions,
          data.quizResponses,
          Number(data.skillLevel) || 3
        );
  
        const adjustedSkillLevel = Number(quizAnalysis.adjustedSkillLevel.overall) || data.skillLevel;
  
        const updatedData = {
          ...data,
          quizAnalysis,
          skillLevel: adjustedSkillLevel
        };
  
        setLoadingMessage('Creating your personalized learning roadmap...');
        
        try {
          let currentProgressInterval: number;
  
          const roadmap = await generateRoadmap(
            updatedData,
            (chunk: number, total: number, status: string) => {
              // Clear previous interval if it exists
              if (currentProgressInterval) {
                clearInterval(currentProgressInterval);
              }
  
              setGenerationProgress({
                currentChunk: chunk,
                totalChunks: total,
                status
              });
  
              currentProgressInterval = startProgressSimulation(chunk);
            }
          );
  
          setLoadingProgress(100);
          setAssessmentData(prev => ({ ...prev, ...updatedData, roadmap }));
          setCurrentStep(prev => prev + 1);
        } catch (error) {
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
      setGenerationProgress({
        currentChunk: 0,
        totalChunks: 3,
        status: ''
      });
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
      <RoadmapDisplay key="roadmap" data={assessmentData.roadmap} onClose={onClose} />
    ) : null,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProgressBar 
          progress={calculateTotalProgress()}
          message={`Step ${currentStep + 1} of ${totalSteps}`}
        />

        {loading ? (
          <div className="mt-8">
            <LoadingState 
              message={loadingMessage}
              subMessage={generationProgress.status}
            />
            <div className="mt-8">
              <ProgressBar 
                progress={loadingProgress}
                message={`${loadingMessage} ${
                  generationProgress.status ? 
                    `(${generationProgress.currentChunk + 1}/${generationProgress.totalChunks})` : 
                    ''
                }`}
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
// RoadmapDisplay.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapData, AssessmentData } from "../../../types/assessment";

import { LoadingState } from '../../common/LoadingState';
import { SuccessNotification } from '../../common/SuccessNotification';
// Define types for quiz answer state keyed by question index
type AnswersState = { [key: number]: string };

interface RoadmapDisplayProps {
  data: RoadmapData;
  assessmentData: AssessmentData;
  onClose: () => void;
}
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 20 }
};
export const RoadmapDisplay = ({ data, assessmentData, onClose }: RoadmapDisplayProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState<{ [key: number]: number }>({});
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizWeek, setCurrentQuizWeek] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<
    {
      question: string;
      options?: string[];
      answer: string;
      type: 'multiple_choice' | 'open_ended';
    }[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<AnswersState>({});

  // Load progress from local storage
  useEffect(() => {
    const savedProgress = localStorage.getItem('learningPathProgress');
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      setCompletedWeeks(parsedProgress.completedWeeks || []);
      setQuizScores(parsedProgress.quizScores || {});
    }
  }, []);

  // Save progress to local storage
  useEffect(() => {
    const progress = {
      completedWeeks,
      quizScores,
    };
    localStorage.setItem('learningPathProgress', JSON.stringify(progress));
  }, [completedWeeks, quizScores]);

  useEffect(() => {
    const progress = (completedWeeks.length / data.weeks.length) * 100;
    setOverallProgress(progress);
  }, [completedWeeks, data.weeks.length]);

  // Only allow toggling if week is unlocked.
  const toggleWeek = (weekNumber: number) => {
    if (!isWeekUnlocked(weekNumber)) return;
    setIsLoading(true);
    
    // Add a fade out effect
    const content = document.getElementById('week-content');
    if (content) {
      content.style.opacity = '0';
    }
    
    setTimeout(() => {
      setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
      setIsLoading(false);
      
      // Fade back in
      if (content) {
        content.style.opacity = '1';
      }
    }, 300);
  };

  const markWeekAsCompleted = (weekNumber: number) => {
    if (!completedWeeks.includes(weekNumber)) {
      setCompletedWeeks([...completedWeeks, weekNumber]);
    }
  };


  const handleQuizSubmission = () => {
    setIsLoading(true);
    try {
    const correctAnswers = quizQuestions.reduce((acc, q, index) => {
      return { ...acc, [index]: q.answer };
    }, {} as { [key: number]: string });

    const score =
      (Object.keys(selectedAnswers).filter((key) => {
        const userAnswer = selectedAnswers[parseInt(key)]?.toLowerCase().trim() || "";
        const correctAnswer = correctAnswers[parseInt(key)].toLowerCase().trim();
        return userAnswer === correctAnswer;
      }).length / quizQuestions.length) *
      100;

    if (currentQuizWeek !== null) {
      setQuizScores({ ...quizScores, [currentQuizWeek]: score });
      if (score >= 70) {
        markWeekAsCompleted(currentQuizWeek);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('You need to score at least 70% to unlock the next week.');
      }
    }
  }catch(error) {
    console.error('Error submitting quiz:', error);
  }finally{
    setIsLoading(false); // Add this lin
    setIsQuizModalOpen(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const openQuizModal = async (weekNumber: number) => {
    try {
      setIsLoading(true);
      const week = data.weeks.find((w) => w.week === weekNumber);
      if (!week?.quiz?.data?.questions) {
        throw new Error('No valid quiz available for this week.');
      }
      
      setQuizQuestions(
        week.quiz.data.questions.map((q) => ({
          question: q.text,
          options: q.options,
          answer: q.correctAnswer || '',
          type: q.type || 'multiple_choice',
        }))
      );
      setCurrentQuizWeek(weekNumber);
      setIsQuizModalOpen(true);
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert(error instanceof Error ? error.message : 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  // Determines if a week is unlocked: first week is unlocked, others need the previous week completed.
  const isWeekUnlocked = (weekNumber: number) => {
    if (weekNumber === 1) return true;
    return completedWeeks.includes(weekNumber - 1);
  };

  return (
    // Replace the first div in your return statement
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen min-w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 fixed inset-0 overflow-y-auto"
    >
      {/* Loading State */}
    {isLoading && (
      <LoadingState 
        message="Generating Your Roadmap"
        subMessage="Creating a personalized learning journey just for you..."
      />
    )}

    {/* Success Notification */}
    <AnimatePresence>
      {showSuccess && (
        <SuccessNotification message="Quiz completed successfully!" />
      )}
    </AnimatePresence>

    
      {/* Elegant Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
              Adaptive Learning Path
            </h1>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Progress Tracker - Add this after the header */}
    <div className="max-w-7xl mx-auto px-6 mb-8">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">Overall Progress</span>
          <span className="text-indigo-400 font-semibold">{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Timeline Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <h2 className="text-2xl font-semibold text-white mb-6">Learning Progress</h2>
              <div className="space-y-4">
                {data.weeks.map((week) => {
                  const unlocked = isWeekUnlocked(week.week);
                  const completed = completedWeeks.includes(week.week);
                  
                  return (
                    <motion.div
                      key={week.week}
                      whileHover={unlocked ? { scale: 1.02 } : undefined}
                      className={`
                        rounded-xl p-4 cursor-pointer transition-all
                        ${unlocked 
                          ? 'bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10' 
                          : 'bg-gray-800/30 cursor-not-allowed border border-gray-700/50'}
                      `}
                      onClick={() => toggleWeek(week.week)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                          ${completed 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                            : unlocked 
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                              : 'bg-gray-800 text-gray-600 border border-gray-700'}
                        `}>
                          {completed ? '✓' : week.week}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{week.theme}</h3>
                          <p className="text-sm text-gray-400">
                            {completed 
                              ? 'Completed' 
                              : unlocked 
                                ? 'In Progress' 
                                : 'Locked'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

         {/* Main Content Area */}
            <div id="week-content" className="lg:w-2/3 transition-opacity duration-300">
            <AnimatePresence mode="wait">
              {data.weeks.map((week) => {
                const unlocked = isWeekUnlocked(week.week);
                if (!unlocked || expandedWeek !== week.week) return null;

                return (
                  <motion.div
                    key={week.week}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 overflow-hidden"
                  >
                    {/* Week Header */}
                    <div className="bg-gradient-to-r from-indigo-900/50 to-transparent p-8 border-b border-white/10">
                      <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-white">
                          Week {week.week}: {week.theme}
                        </h2>
                        {quizScores[week.week] !== undefined && (
                          <div className="flex items-center space-x-2">
                            <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/50">
                              <span className="text-emerald-400 font-semibold">
                                Score: {quizScores[week.week].toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-8 space-y-8">
                      {/* Topics Section */}
                      <section>
                        <h3 className="text-2xl font-semibold text-white mb-4">Topics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {week.topics.map((topic, index) => (
                            <div 
                              key={index}
                              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                              <p className="text-gray-200">{topic}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Learning Resources */}
                      <section>
                        <h3 className="text-2xl font-semibold text-white mb-4">Learning Resources</h3>
                        <div className="space-y-4">
                          {week.resources.map((resource, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ x: 8 }}
                              className="group flex items-center space-x-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                              <div className={`
                                w-8 h-8 flex items-center justify-center rounded-full
                                ${resource.type === 'video' 
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : resource.type === 'article'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-blue-500/20 text-blue-400'}
                              `}>
                                {resource.type === 'video' ? '▶' : resource.type === 'article' ? '📄' : '🎓'}
                              </div>
                              <div className="flex-1">
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
                                >
                                  {resource.title}
                                </a>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm text-gray-400">{resource.duration}</span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-sm text-gray-400">{resource.difficulty}</span>
                                </div>
                              </div>
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.div>
                          ))}
                        </div>
                      </section>

                      {/* Weekly Project */}
                      {week.project && (
                        <section className="bg-indigo-900/20 rounded-xl p-6 border border-indigo-500/30">
                          <h3 className="text-2xl font-semibold text-white mb-4">Weekly Project</h3>
                          <div className="space-y-4">
                            <h4 className="text-xl font-medium text-indigo-300">{week.project.title}</h4>
                            <p className="text-gray-300">{week.project.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Estimated time: {week.project.estimatedHours} hours</span>
                            </div>
                          </div>
                        </section>
                      )}

                      {/* Quiz Section */}
                      {!completedWeeks.includes(week.week) && week.quiz && week.quiz.data && (
                        <section className="mt-8 text-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openQuizModal(week.week)}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 
                              text-white text-xl font-semibold rounded-xl shadow-lg transition-all"
                          >
                            Start Weekly Quiz
                          </motion.button>
                        </section>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {isQuizModalOpen && currentQuizWeek !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-indigo-500/20"
            >
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Week {currentQuizWeek} Assessment</h2>
                <button
                  onClick={() => setIsQuizModalOpen(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </span>
                    <div className="h-2 flex-1 mx-4 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xl text-white mb-6">
                    {quizQuestions[currentQuestionIndex].question}
                  </p>

                  {/* Answer Options */}
                  <div className="space-y-4">
                    {quizQuestions[currentQuestionIndex].type === 'multiple_choice' &&
                      quizQuestions[currentQuestionIndex].options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option })}
                          className={`w-full p-4 rounded-lg border text-left transition-all
                            ${selectedAnswers[currentQuestionIndex] === option
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-white/5 border-gray-700 text-gray-300 hover:bg-white/10'}`}
                        >
                          {option}
                        </button>
                      ))}

                    {quizQuestions[currentQuestionIndex].type === 'open_ended' && (
                      <input
                        type="text"
                        value={selectedAnswers[currentQuestionIndex] || ''}
                        onChange={(e) => setSelectedAnswers({
                          ...selectedAnswers,
                          [currentQuestionIndex]: e.target.value,
                        })}
                        className="w-full p-4 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="Type your answer here..."
                      />
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={goToNextQuestion}
                      className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                          onClick={handleQuizSubmission}
                          disabled={isLoading}
                          className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            'Submit Quiz'
                          )}
                        </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
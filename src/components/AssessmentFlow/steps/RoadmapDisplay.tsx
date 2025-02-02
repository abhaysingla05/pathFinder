import { useState, useEffect } from 'react';
import { RoadmapData } from "../../../types/assessment";

interface RoadmapDisplayProps {
  data: RoadmapData;
  onClose: () => void;
}

export const RoadmapDisplay = ({ data, onClose }: RoadmapDisplayProps) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState<{ [key: number]: number }>({});
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizWeek, setCurrentQuizWeek] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<
    { question: string; options?: string[]; answer: string; type: 'multiple_choice' | 'open_ended' }[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});

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

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  const markWeekAsCompleted = (weekNumber: number) => {
    if (!completedWeeks.includes(weekNumber)) {
      setCompletedWeeks([...completedWeeks, weekNumber]);
    }
  };

  const handleQuizSubmission = () => {
    const correctAnswers = quizQuestions.reduce(
      (acc, q) => ({ ...acc, [q.question]: q.answer }),
      {} as Record<string, string>
    );
    const score =
      (Object.keys(selectedAnswers).filter((q) => {
        const userAnswer = selectedAnswers[q].toLowerCase();
        const correctAnswer = correctAnswers[q].toLowerCase();
        if (quizQuestions.find((question) => question.question === q)?.type === 'open_ended') {
          const keywords = correctAnswer.split(','); // Split correct answer into keywords
          return keywords.some((keyword) => userAnswer.includes(keyword.trim()));
        }
        return userAnswer === correctAnswer;
      }).length /
        quizQuestions.length) *
      100;

    if (currentQuizWeek !== null) {
      setQuizScores({ ...quizScores, [currentQuizWeek]: score });
      if (score >= 70) {
        markWeekAsCompleted(currentQuizWeek);
      } else {
        alert('You need to score at least 70% to unlock the next week. Please review the resources and try again.');
      }
    }
    setIsQuizModalOpen(false);
    setCurrentQuestionIndex(0); // Reset quiz state
    setSelectedAnswers({});
  };

  const isWeekLocked = (weekNumber: number) => {
    return weekNumber > 1 && !completedWeeks.includes(weekNumber - 1);
  };

  const openQuizModal = (weekNumber: number) => {
    const week = data.weeks.find((w) => w.week === weekNumber);
    if (!week?.quiz?.data?.questions) {
      alert('No valid quiz available for this week.');
      return;
    }
    if (week?.quiz?.data?.questions) {
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
  };
}

  const handleAnswerSelection = (question: string, answer: string) => {
    setSelectedAnswers({ ...selectedAnswers, [question]: answer });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">Your AI-Powered Learning Path</h2>

      {/* Progress Bar */}
      <div className="mb-8">
        <progress
          className="w-full h-4 bg-gray-200 rounded-full"
          value={(completedWeeks.length / data.weeks.length) * 100}
          max="100"
        />
        <p className="text-sm text-gray-600 mt-2 text-center">
          {completedWeeks.length} of {data.weeks.length} weeks completed
        </p>
      </div>

      {/* Week Sections */}
      <div className="space-y-8">
        {data.weeks.map((week) => (
          <div
            key={week.week}
            className={`bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 ${
              expandedWeek === week.week ? 'ring-2 ring-blue-400' : 'hover:shadow-lg'
            }`}
          >
            {/* Week Header */}
            <div
              className={`flex items-center justify-between p-6 cursor-pointer group ${
                isWeekLocked(week.week) ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={isWeekLocked(week.week) ? undefined : () => toggleWeek(week.week)}
            >
              <div className="flex items-center gap-4">
                {/* Week Number Badge */}
                <div
                  className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-full shadow-inner ${
                    completedWeeks.includes(week.week)
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {completedWeeks.includes(week.week) ? '✅' : week.week}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Week {week.week}</h3>
                  <p className="text-gray-500">{week.theme}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">{week.weeklyHours} hours</span>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 group-hover:text-blue-500 ${
                    expandedWeek === week.week ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expandable Content */}
            {expandedWeek === week.week && (
              <div className="px-6 pb-6 animate-fadeIn">
                {/* Topics Section */}
                {week.topics && week.topics.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2 border-b pb-1">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {week.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-100"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources Section */}
                {week.resources && week.resources.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2 border-b pb-1">Learning Resources</h4>
                    <div className="space-y-3">
                      {week.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                        >
                          <div className="flex items-start gap-3">
                            {/* Resource Icon */}
                            <span className="text-2xl">
                              {resource.type === 'video'
                                ? '▶️'
                                : resource.type === 'article'
                                  ? '📄'
                                  : '📚'}
                            </span>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800">{resource.title}</h5>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <span>{resource.duration}</span>
                                <span>•</span>
                                <span className="capitalize">{resource.difficulty}</span>
                                <span>•</span>
                                <span>{resource.category}</span>
                              </div>
                            </div>
                            {/* External Link Icon */}
                            <span className="text-blue-600 self-center">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weekly Project Section */}
                {week.project && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Weekly Project</h4>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h5 className="font-medium text-green-800">{week.project.title}</h5>
                      <p className="text-sm text-green-700 mt-1">{week.project.description}</p>
                      <p className="text-sm text-green-700 mt-2">
                        Estimated time: {week.project.estimatedHours} hours
                      </p>
                    </div>
                  </div>
                )}

                {/* Quiz Section */}
                {!completedWeeks.includes(week.week) && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Weekly Quiz</h4>
                    {week.quiz?.data?.questions ? (
                      <button
                        onClick={() => openQuizModal(week.week)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      >
                        Take Quiz
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500">No quiz available for this week.</p>
                    )}
                    {quizScores[week.week] !== undefined && (
                      <p className="text-sm text-gray-600 mt-2">Your score: {quizScores[week.week].toFixed(0)}%</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {isQuizModalOpen && currentQuizWeek !== null && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsQuizModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Quiz Header */}
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Week {currentQuizWeek} Quiz</h3>

            {/* Progress Indicator */}
            <p className="text-sm text-gray-600 mb-6">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </p>

            {/* Current Question */}
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-800 mb-4">{quizQuestions[currentQuestionIndex].question}</p>
              {quizQuestions[currentQuestionIndex].type === 'multiple_choice' &&
                quizQuestions[currentQuestionIndex].options && (
                  <div className="space-y-2">
                    {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                      <label
                        key={index}
                        className="block p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <input
                          type="radio"
                          name="quiz-answer"
                          value={option}
                          checked={selectedAnswers[quizQuestions[currentQuestionIndex].question] === option}
                          onChange={() =>
                            handleAnswerSelection(quizQuestions[currentQuestionIndex].question, option)
                          }
                          className="hidden"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              {quizQuestions[currentQuestionIndex].type === 'open_ended' && (
                <textarea
                  value={selectedAnswers[quizQuestions[currentQuestionIndex].question] || ''}
                  onChange={(e) =>
                    handleAnswerSelection(quizQuestions[currentQuestionIndex].question, e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleQuizSubmission}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-10 flex justify-center gap-6">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Learning Journey
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Download Roadmap
        </button>
      </div>
    </div>
  );
};
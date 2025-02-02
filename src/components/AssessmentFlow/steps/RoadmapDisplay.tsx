import { useState, useEffect } from 'react';
import { RoadmapData, AssessmentData } from "../../../types/assessment";

interface RoadmapDisplayProps {
  data: RoadmapData;
  assessmentData: AssessmentData; // Add this for goal, skillLevel, and focusAreas
  onClose: () => void;
}

export const RoadmapDisplay = ({ data, assessmentData, onClose }: RoadmapDisplayProps) => {
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
        return userAnswer === correctAnswer;
      }).length /
        quizQuestions.length) *
      100;

    if (currentQuizWeek !== null) {
      setQuizScores({ ...quizScores, [currentQuizWeek]: score });
      if (score >= 70) {
        markWeekAsCompleted(currentQuizWeek);
      } else {
        alert('You need to score at least 70% to unlock the next week.');
      }
    }
    setIsQuizModalOpen(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
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
  const openQuizModal = (weekNumber: number) => {
    const week = data.weeks.find((w) => w.week === weekNumber);
    if (!week?.quiz?.data?.questions) {
      alert('No valid quiz available for this week.');
      return;
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
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">Your AI-Powered Learning Path</h1>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${(completedWeeks.length / data.weeks.length) * 100}%` }}
        ></div>
      </div>
      <p className="text-center text-gray-700 mb-8">
        {completedWeeks.length} of {data.weeks.length} weeks completed
      </p>

      {/* Week Sections */}
      {data.weeks.map((week) => (
        <div key={week.week} className="mb-6">
          {/* Week Header */}
          <div
            onClick={() => toggleWeek(week.week)}
            className="flex justify-between items-center p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div>
              <span className="font-bold text-xl">
                {completedWeeks.includes(week.week) ? '✅' : week.week}
              </span>{' '}
              Week {week.week}: {week.theme}
            </div>
            <span className="text-gray-500">{expandedWeek === week.week ? '▲' : '▼'}</span>
          </div>

          {/* Expandable Content */}
          {expandedWeek === week.week && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-inner">
              {/* Topics Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Topics</h3>
                <ul className="list-disc pl-6">
                  {week.topics.map((topic, index) => (
                    <li key={index} className="text-gray-700">
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Learning Resources</h3>
                <ul className="list-disc pl-6">
                  {week.resources.map((resource, index) => (
                    <li key={index} className="text-gray-700 flex items-center">
                      {resource.type === 'video' ? (
                        <span className="mr-2 text-red-500">▶️</span>
                      ) : resource.type === 'article' ? (
                        <span className="mr-2 text-green-500">📄</span>
                      ) : (
                        <span className="mr-2 text-yellow-500">📚</span>
                      )}
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {resource.title}
                      </a>{' '}
                      ({resource.duration}, {resource.difficulty})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weekly Project Section */}
              {week.project && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Project</h3>
                  <p className="text-gray-700">
                    <strong>{week.project.title}:</strong> {week.project.description} (Estimated time:{' '}
                    {week.project.estimatedHours} hours)
                  </p>
                </div>
              )}

              {/* Quiz Section */}
              {!completedWeeks.includes(week.week) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Quiz</h3>
                  <button
                    onClick={() => openQuizModal(week.week)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Take Quiz
                  </button>
                  {quizScores[week.week] !== undefined && (
                    <p className="text-gray-700 mt-2">Your score: {quizScores[week.week].toFixed(0)}%</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Quiz Modal */}
      {isQuizModalOpen && currentQuizWeek !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <button
              onClick={() => setIsQuizModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✖️
            </button>
            <h2 className="text-2xl font-bold text-center mb-4">Week {currentQuizWeek} Quiz</h2>
            <p className="text-center text-gray-700 mb-6">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </p>
            <p className="text-lg font-semibold mb-4">{quizQuestions[currentQuestionIndex].question}</p>
            {quizQuestions[currentQuestionIndex].type === 'multiple_choice' &&
              quizQuestions[currentQuestionIndex].options && (
                <div>
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setSelectedAnswers({
                          ...selectedAnswers,
                          [quizQuestions[currentQuestionIndex].question]: option,
                        })
                      }
                      className="block w-full p-3 mb-2 bg-gray-100 rounded-lg text-gray-800 hover:bg-gray-200 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            {quizQuestions[currentQuestionIndex].type === 'open_ended' && (
              <input
                type="text"
                onChange={(e) =>
                  setSelectedAnswers({
                    ...selectedAnswers,
                    [quizQuestions[currentQuestionIndex].question]: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your answer here..."
              />
            )}
            <div className="flex justify-between mt-6">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleQuizSubmission}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// App.tsx
import { useState, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import LandingPage from './components/LandingPage/LandingPage';

const AssessmentFlow = lazy(() => import('./components/AssessmentFlow/AssessmentFlow'));

function App() {
  const [showAssessment, setShowAssessment] = useState(false);

  return (
    <>
      <Toaster position="top-center" richColors />
      {showAssessment ? (
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        }>
          <AssessmentFlow onClose={() => setShowAssessment(false)} />
        </Suspense>
      ) : (
        <LandingPage onStartAssessment={() => setShowAssessment(true)} />
      )}
    </>
  );
}

export default App;
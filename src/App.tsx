import { useState } from 'react';
import { Toaster } from 'sonner';
import LandingPage from './components/LandingPage/LandingPage';
import AssessmentFlow from './components/AssessmentFlow/AssessmentFlow';

function App() {
  const [showAssessment, setShowAssessment] = useState(false);

  return (
    <>
      <Toaster position="top-center" richColors />
      {showAssessment ? (
        <AssessmentFlow onClose={() => setShowAssessment(false)} />
      ) : (
        <LandingPage onStartAssessment={() => setShowAssessment(true)} />
      )}
    </>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ExamPage from './pages/ExamPage.jsx';
import exams from './data/exams.js';
import AnalyticsPortal from './components/AnalyticsPortal.jsx';

function AppContent() {
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname === '/solutions') {
      // Add classes when analytics portal is active
      document.documentElement.classList.add('analytics-portal-active');
      document.body.classList.add('analytics-portal-active');
      document.getElementById('root')?.classList.add('analytics-portal-active');
    } else {
      // Remove classes when not on analytics portal
      document.documentElement.classList.remove('analytics-portal-active');
      document.body.classList.remove('analytics-portal-active');
      document.getElementById('root')?.classList.remove('analytics-portal-active');
    }
    
    return () => {
      // Cleanup on unmount
      document.documentElement.classList.remove('analytics-portal-active');
      document.body.classList.remove('analytics-portal-active');
      document.getElementById('root')?.classList.remove('analytics-portal-active');
    };
  }, [location.pathname]);

  const defaultExamId = exams[0].examId;
  return (
    <Routes>
      <Route path="/exam/:eid" element={<ExamPage />} />
      <Route path='/solutions' element={<AnalyticsPortal />} />
      <Route path="*" element={<Navigate to={`/exam/${defaultExamId}`} replace />} />
    </Routes>
  );
}

function App() {
  const defaultExamId = exams[0].examId;
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

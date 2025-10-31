import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ExamPage from './pages/ExamPage.jsx';
import exams from './data/exams.js';

function App() {
  const defaultExamId = exams[0].examId;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/exam/:eid" element={<ExamPage />} />
        <Route path="*" element={<Navigate to={`/exam/${defaultExamId}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

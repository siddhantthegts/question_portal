import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import exams from '../data/exams';
import passages from '../data/passages';
import { answerQuestion, startQuestion } from '../store/testSlice';
import Calculator from '../components/Calculator.jsx';
import './QuestionPage.css';

function ExamPage() {
  const { eid } = useParams();
  const examId = Number(eid);
  const exam = exams.find((e) => e.examId === examId);

  if (!exam) return <p>Exam not found</p>;

  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const dispatch = useDispatch();
  const answers = useSelector((state) => state.test.answers);
  const { startTimes } = useSelector((state) => state.test);
  const [showCalc, setShowCalc] = useState(false);

  const section = exam.sections[sectionIdx];
  const question = section.questions[questionIdx];

  useEffect(() => {
    dispatch(startQuestion(question.questionId));
  }, [question.questionId]);

  const handleSelect = (optionIndex) => {
    dispatch(answerQuestion({ id: question.questionId, optionIndex }));
  };

  const statuses = section.questions.map((q) => {
    if (answers[q.questionId]) return 'answered';
    if (q.questionId === question.questionId) return 'current';
    if (q.questionId in startTimes) return 'not-answered';
    return 'not-visited';
  });

  const nextInSection = () => {
    if (questionIdx < section.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    }
  };

  const passage = question.passageId ? passages.find((p) => p.id === question.passageId) : null;
  const hasPassage = !!passage;

  return (
    <div className="question-container">
      <header className="header">
        <nav className="sections">
          {exam.sections.map((sec, idx) => (
            <span
              key={sec.sectionId}
              className={`section ${idx === sectionIdx ? 'active' : ''}`}
              onClick={() => {
                setSectionIdx(idx);
                setQuestionIdx(0);
              }}
            >
              {sec.sectionName}
            </span>
          ))}
        </nav>
        <div className="timer">Time Left : --:--:--</div>
        <button className="btn calc-toggle" onClick={() => setShowCalc(true)}>
          Calculator
        </button>
      </header>

      <main className={`main-area ${hasPassage ? 'with-passage' : 'no-passage'}`}>
        {hasPassage && (
          <div className="passage-panel">
            <p>{passage.text}</p>
          </div>
        )}

        <div className="question-content">
          <div className="meta">Mark/s: 3.00 | Negative Mark/s: 1.00</div>
          <h3>
            Question {questionIdx + 1}/{section.questions.length}
          </h3>
          <p className="question-text">{question.text}</p>
          <ul className="options">
            {question.options.map((opt, idx) => (
              <li key={idx}>
                <label className="option-radio">
                  <input
                    type="radio"
                    name={`q-${question.questionId}`}
                    checked={answers[question.questionId]?.optionIndex === idx}
                    onChange={() => handleSelect(idx)}
                  />
                  <span>{opt}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className="btn" onClick={nextInSection}>
              Mark for review and Next
            </button>
            <button className="btn" onClick={() => handleSelect(null)}>
              Clear Response
            </button>
          </div>
        </div>

        <aside className="side-panel">
          <div className="avatar"></div>
          <ul className="legend">
            <li>
              <span className="box not-visited"></span> Not Visited
            </li>
            <li>
              <span className="box not-answered"></span> Not Answered
            </li>
            <li>
              <span className="box answered"></span> Answered
            </li>
          </ul>
          <div className="palette">
            {section.questions.map((q, i) => (
              <button
                key={q.questionId}
                className={`pal-btn ${statuses[i]}`}
                onClick={() => setQuestionIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="submit">
            <button className="btn">Submit Section</button>
          </div>
        </aside>
      </main>
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </div>
  );
}

export default ExamPage;

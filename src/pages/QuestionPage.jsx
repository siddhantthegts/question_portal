import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import questions from '../data/questions';
import { answerQuestion, startQuestion } from '../store/testSlice';
import './QuestionPage.css';
import passages from '../data/passages';
import Calculator from '../components/Calculator.jsx';
import sections from '../data/sections';

function QuestionPage() {
  const { sid, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sectionId = Number(sid);
  const qId = Number(id);
  const section = sections.find((s) => s.id === sectionId);
  const sectionQuestions = section ? section.questions : [];
  const question = sectionQuestions.find((q) => q.id === qId);
  const answers = useSelector((state) => state.test.answers);
  const { startTimes } = useSelector((state) => state.test);
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    dispatch(startQuestion(qId));
  }, [qId]);

  if (!section || !question) return <p>Question not found</p>;

  const passage = question.passageId ? passages.find((p) => p.id === question.passageId) : null;

  const handleSelect = (optionIndex) => {
    dispatch(answerQuestion({ id: qId, optionIndex }));
  };

  const statuses = sectionQuestions.map((q) => {
    if (answers[q.id]) return 'answered';
    if (q.id === qId) return 'current';
    if (q.id in startTimes) return 'not-answered';
    return 'not-visited';
  });

  const nextInSection = () => {
    const idx = sectionQuestions.findIndex((q) => q.id === qId);
    const nextQ = sectionQuestions[idx + 1];
    if (nextQ) navigate(`/section/${sectionId}/question/${nextQ.id}`);
  };

  return (
    <div className="question-container">
      <header className="header">
        <nav className="sections">
          {sections.map((sec) => (
            <span
              key={sec.id}
              className={`section ${sec.id === sectionId ? 'active' : ''}`}
              onClick={() => navigate(`/section/${sec.id}/question/${sec.questions[0].id}`)}
            >
              {sec.name}
            </span>
          ))}
        </nav>
        <div className="timer">Time Left : 00:39:00</div>
        <button className="btn calc-toggle" onClick={() => setShowCalc(true)}>Calculator</button>
      </header>

      <main className={`main-area ${question.passageId ? 'with-passage' : ''}`}>
        {question.passageId && (
          <div className="passage-panel">
            <p>{passages.find(p=>p.id===question.passageId).text}</p>
          </div>
        )}
        <div className="question-content">
          <div className="meta">Mark/s: 3.00 | Negative Mark/s: 1.00</div>
          <h3>Question No. {qId}.</h3>
          <p className="question-text">{question.text}</p>
          <ul className="options">
            {question.options.map((opt, idx) => (
              <li key={idx}>
                <label className="option-radio">
                  <input
                    type="radio"
                    name={`q-${qId}`}
                    checked={answers[qId]?.optionIndex === idx}
                    onChange={() => handleSelect(idx)}
                  />
                  <span>{opt}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className="btn" onClick={nextInSection}>Mark for review and Next</button>
            <button className="btn" onClick={() => handleSelect(null)}>
              Clear Response
            </button>
          </div>
        </div>

        <aside className="side-panel">
          <div className="avatar"></div>
          <ul className="legend">
            <li><span className="box not-visited"></span> Not Visited</li>
            <li><span className="box not-answered"></span> Not Answered</li>
            <li><span className="box answered"></span> Answered</li>
          </ul>
          <div className="palette">
            {sectionQuestions.map((q, i) => (
              <button
                key={q.id}
                className={`pal-btn ${statuses[i]}`}
                onClick={() => navigate(`/section/${sectionId}/question/${q.id}`)}
              >
                {q.id}
              </button>
            ))}
          </div>
          <div className="submit">
            <button className="btn" onClick={() => navigate('/summary')}>Submit Section</button>
          </div>
        </aside>
      </main>
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </div>
  );
}

export default QuestionPage;

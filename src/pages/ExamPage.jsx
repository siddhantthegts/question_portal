import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import exams from '../data/exams';
import passages from '../data/passages';
import { answerQuestion, startQuestion } from '../store/testSlice';
import Calculator from '../components/Calculator.jsx';
import './QuestionPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

function ExamPage() {
  const { eid } = useParams();
  const examId = Number(eid);
  console.log(eid)
  const exam = exams.find((e) => e.examId === examId);

  if (!exam) return <p>Exam not found</p>;

  const [sectionIdx, setSectionIdx] = useState(0);
  const [sectionLock, setSectionLock] = useState(prevState => {
    const locks = {};
    exam.sections.forEach((sec, idx) => {
      if (exam.examType === 'CAT') {
        locks[idx] = idx !== 0;
      } else if (exam.examType === 'SNAP') {
        locks[idx] = false;
      } else if (exam.examType === 'NMAT') {
        locks[idx] = !(idx === 0 || idx === 2);
      }
    });
    return locks
  });
  const [questionIdx, setQuestionIdx] = useState(0);
  const dispatch = useDispatch();
  const answers = useSelector((state) => state.test.answers);
  const { startTimes } = useSelector((state) => state.test);
  const [showCalc, setShowCalc] = useState(false);
  const [noOptionsSelected, setNoOptionsSelected] = useState(false);
  const section = exam.sections[sectionIdx];
  const question = section.questions[questionIdx];
  const [timeLeft, setTimeLeft] = useState(exam.sections[sectionIdx].time);
  const sectionEnded = useRef(false);


  useEffect(() => {
    setTimeLeft(exam.sections[sectionIdx].time);
    sectionEnded.current = false;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);

          if (!sectionEnded.current) {
            sectionEnded.current = true;
            handleSectionEnd();
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      sectionEnded.current = true;
    };
  }, [sectionIdx]);

  const handleSectionEnd = () => {
    setSectionLock(prev => {
      const updated = { ...prev };
      if (exam.examType === 'CAT') {
        updated[sectionIdx] = true;
        if (sectionIdx + 1 < exam.sections.length) {
          updated[sectionIdx + 1] = false;
        }
      }
      return updated;
    });

    if (exam.examType === 'CAT' && sectionIdx < exam.sections.length - 1) {
      setSectionIdx(prev => prev + 1);
      setQuestionIdx(0);
      setNoOptionsSelected(false);
    } else if (exam.examType === 'CAT' && sectionIdx === exam.sections.length - 1) {
      alert('Exam over!');
    }
  };

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

  const isAnswered = (() => {
    const ans = answers[question.questionId];
    return ans && ans.optionIndex !== null && ans.optionIndex !== undefined;
  })

  const nextInSection = () => {
    if (questionIdx < section.questions.length - 1 && isAnswered(questionIdx)) {
      setQuestionIdx(questionIdx + 1);
      setNoOptionsSelected(false);
    }
    else{
      setNoOptionsSelected(true);
    }
  };



  const passage = question.passageId ? passages.find((p) => p.id === question.passageId) : null;
  const hasPassage = !!passage;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="question-container">
      <header className="header">
        <nav className="sections">
          {exam.sections.map((sec, idx) => (
            <div key={sec.sectionId} className={`section ${idx === sectionIdx ? 'active' : ''} ${sectionLock[idx] ? 'noClickCursor' : ''}`}>
              <span
                key={sec.sectionId}
                onClick={sectionLock[idx] ? () => { } : () => {
                  if (!sectionLock[idx]) {
                    setSectionIdx(idx);
                    setQuestionIdx(0);
                  }
                }}
              >
                {sec.sectionName}
              </span>
              {sectionLock[idx] && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
            </div>
          ))}
        </nav>
        <div className="timer">Time Left : {formatTime(timeLeft)} </div>
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
            {noOptionsSelected && <p className='error'>Please select an option</p>}
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
            <button className="btn" onClick={handleSectionEnd}>Submit Section</button>
          </div>
        </aside>
      </main>
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </div>
  );
}

export default ExamPage;

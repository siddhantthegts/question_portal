import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { answerQuestion, startQuestion } from '../store/examSlice.js';
import Calculator from '../components/Calculator.jsx';
import './QuestionPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useGetExamQuery, useAnswerQuestionMutation } from '../store/api.js';
import SmartKeyboard from '../components/SmartKeyboard.jsx';
import { setKeyboardValue } from '../store/keyboardSlice.js';

function ExamPage() {
  const { eid } = useParams();
  const [triggerAnswerQuestion] = useAnswerQuestionMutation();

  const { data, error, isLoading } = useGetExamQuery({
    url: 'exam-section-question',
    headers: {
      Authorization: `Bearer ${eid}`
    }
  });

  const [descriptive, setDescriptive] = useState('');

  const profile = useMemo(() => {
    console.log("data:", data?.data?.allData)
    console.log("Profile", data?.data?.student)
    if (!data?.data?.student) return null;
    const profileData = data.data.student;
    return {
      studentName: profileData.name,
      studentEmail: profileData.email,
      studentPhone: profileData.mobile
    }
  }, [data])

  const exam = useMemo(() => {
    if (!data?.data?.allData) return null;
    const examData = data.data.allData;
    return {
      examId: examData.examId,
      examName: examData.categoryName,
      totalTime: examData.examDuration * 60,
      sections: examData.sections.map(sec => ({
        sectionId: sec.sectionId,
        sectionName: sec.sectionName,
        time: Number(sec.sectionDuration) * 60,
        questions: sec.question.map(q => ({
          questionId: q.id,
          type: q.type,
          text: q.questions,
          options: [q.A, q.B, q.C, q.D, q.E, q.F].filter(opt => opt && opt.trim()),
          marks: q.marks,
          negativeMarking: q.negativeMarking,
          explanation: q.explanation,
          keyboardType: q.keyboardType,
          passageId: q.passageId && q.passageId !== 0 ? q.passageId : null,
          passage: q.passage || null,
          direction: q.direction,
        }))
      }))
    };
  }, [data]);

  // All hooks must be called before any early returns
  const [sectionIdx, setSectionIdx] = useState(0);
  const [sectionLock, setSectionLock] = useState({});
  const [questionIdx, setQuestionIdx] = useState(0);
  const dispatch = useDispatch();
  const answers = useSelector((state) => state.test.answers );
  const { startTimes } = useSelector((state) => state.test);
  const [showCalc, setShowCalc] = useState(false);
  const [noOptionsSelected, setNoOptionsSelected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const sectionEnded = useRef(false);

  // Initialize sectionLock when exam data is available Only show currect section not previous not after
  useEffect(() => {
    if (exam) {
      const locks = {};
      exam.sections.forEach((sec, idx) => {
        // if (exam.examName === 'CAT') {
        if (exam.examType === 'CAT') {
          locks[idx] = idx !== 0;
        } else if (exam.examName === 'SNAP') {
          locks[idx] = false;
        } else if (exam.examName === 'NMAT') {
          locks[idx] = !(idx === 0 || idx === 2);
        }
      });
      setSectionLock(locks);
    }
  }, [exam]);

  // Timer effect - must be before early returns
  useEffect(() => {
    if (!exam) return;
    const currentSection = exam.sections[sectionIdx];
    if (!currentSection) return;

    setTimeLeft(currentSection.time);
    sectionEnded.current = false;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          sectionEnded.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      sectionEnded.current = true;
    };
  }, [sectionIdx, exam]);

  // Question tracking effect - must be before early returns
  useEffect(() => {
    if (!exam) return;
    const currentSection = exam.sections[sectionIdx];
    if (!currentSection || !currentSection.questions[questionIdx]) return;
    dispatch(startQuestion(currentSection.questions[questionIdx].questionId));
  }, [sectionIdx, questionIdx, exam, dispatch]);

  // Early returns after all hooks
  if (isLoading) return <p>Loading...</p>;
  if (error || !exam) return <p>Exam not found</p>;

  const section = exam.sections[sectionIdx];
  if (!section || !section.questions.length) return <p>No questions in this section</p>;

  const question = section.questions[questionIdx];

  const handleSectionEnd = () => {
    if (!exam) return;
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

 const handleSelect = (optionIndex, descriptiveText = "") => {
  if (descriptiveText && descriptiveText !== "") {
    dispatch(answerQuestion({ id: question.questionId, descriptiveText }));
  } else {
    dispatch(answerQuestion({ id: question.questionId, optionIndex }));
  }
};


  const statuses = section.questions.map((q) => {
    if (answers && answers[q.questionId]) return 'answered';
    if (q.questionId === question.questionId) return 'current';
    if (startTimes && q.questionId in startTimes) return 'not-answered';
    return 'not-visited';
  });

  const isAnswered = (() => {
    if (!answers) return false;
    const ans = answers[question.questionId];
    return ans && (ans.optionIndex !== null || ans.descriptiveText != null) && (ans.optionIndex !== undefined || ans.descriptiveText !== undefined);
  })

  const nextInSection = async () => {
    if (questionIdx < section.questions.length - 1 && isAnswered(questionIdx)) {

      try {
        const answerData = answers[question.questionId];
        let studentAnswer = null;
        
        if (answerData?.optionIndex !== undefined && answerData?.optionIndex !== null) {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          studentAnswer = letters[answerData.optionIndex];
        } else if (answerData?.descriptiveText) {
          studentAnswer = answerData.descriptiveText;
        }

        const timeTakenMs = answerData?.timeTaken || 0;
        const timeTakenSeconds = Math.round(timeTakenMs / 1000);

        await triggerAnswerQuestion({
          data: {
            questionId: question.questionId,
            sectionId: section.sectionId,
            studentAnswer: studentAnswer,
            time: timeTakenSeconds
          },
          headers: {
            'Authorization': `Bearer ${eid}`
          }
        }).unwrap();
        console.log("Answer submitted successfully");
      } catch (error) {
        console.error("Failed to submit answer:", error);
      }

      setQuestionIdx(questionIdx + 1);
      setNoOptionsSelected(false);
        setDescriptive('')
        dispatch(setKeyboardValue(''))
    }
    else {
      setNoOptionsSelected(true);
    }
  };

  const handleSetDescriptiveText = (text) => {
    setDescriptive(text);
    handleSelect(null, text);
  }


  const passage = question.passage || null;
  const hasPassage = !!passage;

  const renderHTML = (html) => {
    if (!html) return null;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

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
            <span
              key={sec.sectionId}
              className={`section ${idx === sectionIdx ? 'active' : ''} ${sectionLock[idx] ? 'noClickCursor' : ''}`}
              onClick={sectionLock[idx] ? undefined : () => {
                if (!sectionLock[idx]) {
                  setSectionIdx(idx);
                  setQuestionIdx(0);
                }
              }}
            >
              {sec.sectionName}
              {sectionLock[idx] && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
            </span>
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
            {passage.title && <h4>{renderHTML(passage.title)}</h4>}
            {renderHTML(passage.passage || passage.text || '')}
          </div>
        )}

        <div className="question-content">
          <div className="meta">
            Mark/s: {question.marks} | Negative Mark/s: {question.negativeMarking ? (question.marks / 3).toFixed(2) : '0.00'}
          </div>
          {question.direction && <div className="direction">{renderHTML(question.direction)}</div>}
          <h3>
            Question {questionIdx + 1}/{section.questions.length}
          </h3>
          <div className="question-text">{renderHTML(question.text)}</div>
          {question.type === 'MCQ' ? (
            <ul className="options">
              {question.options.map((opt, idx) => (
                <li key={idx}>
                  <label className="option-radio">
                    <input
                      type="radio"
                      name={`q-${question.questionId}`}
                      checked={answers && answers[question.questionId]?.optionIndex === idx}
                      onChange={() => handleSelect(idx)}
                    />
                    <span>{renderHTML(opt)}</span>
                  </label>
                </li>
              ))}
              {noOptionsSelected && <p className='error'>Please select an option</p>}
            </ul>
          ) : (
            <div className="descriptive-input">
              <SmartKeyboard keyboardType={question.keyboardType} onChange={(text) => handleSetDescriptiveText(text)} />
            </div>
          )}
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
          <div className='profile'>
            <b><p>{profile.studentName}</p></b>
            <p>{profile.studentEmail}</p>
          </div>
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

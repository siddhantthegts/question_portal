import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { answerQuestion, startQuestion, clearAnswer } from '../store/examSlice.js';
import SmartKeyboard from './SmartKeyboard.jsx';
import { setKeyboardValue } from '../store/keyboardSlice.js';
import { useAnswerQuestionMutation } from '../store/api.js';
import { useParams } from 'react-router-dom';
import './QuestionView.css';

function QuestionView({ section, sectionId, timeLeft, profile, onSectionEnd, resetTimeUpdateInterval, startTimeUpdateInterval }) {
  const { eid } = useParams();
  const [triggerAnswerQuestion] = useAnswerQuestionMutation();
  const dispatch = useDispatch();
  const answers = useSelector((state) => state.test.answers);
  const { startTimes } = useSelector((state) => state.test);
  
  const [questionIdx, setQuestionIdx] = useState(0);
  const [descriptive, setDescriptive] = useState('');
  const [noOptionsSelected, setNoOptionsSelected] = useState(false);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!section || !section.questions[questionIdx]) return;
    
    const currentQuestion = section.questions[questionIdx];
    
    if (!answers[currentQuestion.questionId]?.timeTaken) {
      dispatch(startQuestion(currentQuestion.questionId));
    }
    
    if (currentQuestion.type !== 'MCQ' && answers[currentQuestion.questionId]?.descriptiveText) {
      const restoredText = answers[currentQuestion.questionId].descriptiveText;
      setDescriptive(restoredText);
      dispatch(setKeyboardValue(restoredText));
    } else if (currentQuestion.type === 'MCQ') {
      setDescriptive('');
      dispatch(setKeyboardValue(''));
    } else {
      dispatch(setKeyboardValue(''));
    }
  }, [sectionId, questionIdx, section, dispatch, answers]);

  const question = section?.questions[questionIdx];
  if (!question) return null;

  const handleSelect = (optionIndex, descriptiveText = "") => {
    if (optionIndex === null && (!descriptiveText || descriptiveText === "")) {
      dispatch(clearAnswer(question.questionId));
      setDescriptive('');
      dispatch(setKeyboardValue(''));
    } else if (descriptiveText && descriptiveText !== "") {
      dispatch(answerQuestion({ id: question.questionId, descriptiveText }));
    } else if (optionIndex !== null && optionIndex !== undefined) {
      dispatch(answerQuestion({ id: question.questionId, optionIndex }));
    }
  };

  const isAnswered = () => {
    if (!answers) return false;
    const ans = answers[question.questionId];
    return ans && (ans.optionIndex !== null || ans.descriptiveText != null) && (ans.optionIndex !== undefined || ans.descriptiveText !== undefined);
  };

  const nextInSection = async () => {
    if (questionIdx < section.questions.length - 1 && isAnswered()) {
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
        if (resetTimeUpdateInterval) resetTimeUpdateInterval();
        if (startTimeUpdateInterval) startTimeUpdateInterval();
      } catch (error) {
        console.error("Failed to submit answer:", error);
      }

      setQuestionIdx(questionIdx + 1);
      setNoOptionsSelected(false);
      setDescriptive('');
      dispatch(setKeyboardValue(''));
    } else {
      setNoOptionsSelected(true);
    }
  };

  const handleSetDescriptiveText = (text) => {
    setDescriptive(text);
    handleSelect(null, text || '');
  };

  const passage = question.passage || null;
  const hasPassage = !!passage;

  const renderHTML = (html) => {
    if (!html) return null;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const statuses = section.questions.map((q) => {
    const answerObj = answers && answers[q.questionId];
    const hasAnswer = answerObj && (
      (answerObj.optionIndex !== null && answerObj.optionIndex !== undefined) ||
      (answerObj.descriptiveText !== null && answerObj.descriptiveText !== undefined && answerObj.descriptiveText !== '')
    );
    
    if (hasAnswer) return 'answered';
    if (q.questionId === question.questionId) return 'current';
    if (startTimes && q.questionId in startTimes) return 'not-answered';
    return 'not-visited';
  });

  return (
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
        {profile && (
          <div className='profile'>
            <b><p>{profile.studentName}</p></b>
            <p>{profile.studentEmail}</p>
          </div>
        )}
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
          <button className="btn" onClick={onSectionEnd}>Submit Section</button>
        </div>
      </aside>
    </main>
  );
}

export default QuestionView;


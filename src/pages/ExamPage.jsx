import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { answerQuestion, startQuestion, setResumeData, setCandidateResponse, restoreAnswer, clearAnswer } from '../store/examSlice.js';
import Calculator from '../components/Calculator.jsx';
import './QuestionPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useGetExamQuery, useAnswerQuestionMutation } from '../store/api.js';
import SmartKeyboard from '../components/SmartKeyboard.jsx';
import { setKeyboardValue } from '../store/keyboardSlice.js';
import { useNavigate } from 'react-router-dom';
import { getExamConfig } from '../config/examConfig.js';

function ExamPage() {
  const { eid } = useParams();
  const [triggerAnswerQuestion] = useAnswerQuestionMutation();
  const navigate = useNavigate();

  const { data, error, isLoading } = useGetExamQuery({
    url: 'exam-section-question',
    headers: {
      Authorization: `Bearer ${eid}`
    }
  });

  const [descriptive, setDescriptive] = useState('');

  const profile = useMemo(() => {
    if (!data?.data?.student) return null;
    const profileData = data.data.student;
    return {
      studentName: profileData.name,
      studentEmail: profileData.email,
      studentPhone: profileData.mobile
    }
  }, [data])


  const resumeExamData = useMemo(() => {
    return data?.data?.groupedBySection || null;
  }, [data]);

  const lastResponse = useMemo(() => {
    return data?.data?.lastAttemptQuestion || null;
  }, [data]);

  const examAttendId = useMemo(() => {
    return data?.data?.examAttendId || null;
  }, [data]);

  const exam = useMemo(() => {
    if (!data?.data?.allData) return null;
    const examData = data.data.allData;
    const examType = examData.categoryName || examData.examType;
    const examConfig = getExamConfig(examType);
    
    
    let sections = examData.sections.map(sec => ({
      sectionId: sec.sectionId,
      sectionName: sec.sectionName,
      durationLeft: sec.durationLeft !== undefined && sec.durationLeft !== null ? Number(sec.durationLeft) : null, //durationLeft in minutes
      sectionDuration: Number(sec.sectionDuration), 
      time: sec.durationLeft !== undefined && sec.durationLeft !== null 
        ? Number(sec.durationLeft) * 60 // minute to seconds
        : Number(sec.sectionDuration) * 60, // minute to seconds
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
    }));
    
    
    sections = examConfig.orderSections(sections);
    
   
    const examDurationLeft = examData.durationLeft !== undefined && examData.durationLeft !== null 
      ? Number(examData.durationLeft) 
      : null;
    
    // Calculate locks synchronously when exam is created
    const locks = examConfig.getLockRules(sections);
    
    return {
      examId: examData.examId,
      examName: examData.categoryName,
      examType: examType,
      totalTime: examData.examDuration * 60,
      examDurationLeft: examDurationLeft, 
      durationScope: examConfig.durationScope,
      sections: sections,
      initialLocks: locks // Store locks with exam object
    };
  }, [data]);


  const [sectionIdx, setSectionIdx] = useState(0);
  const [sectionLock, setSectionLock] = useState({});
  const locksInitialized = useRef(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const dispatch = useDispatch();
  const answers = useSelector((state) => state.test.answers );
  const { startTimes, candidateResponse } = useSelector((state) => state.test);
  const [showCalc, setShowCalc] = useState(false);
  const [noOptionsSelected, setNoOptionsSelected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const sectionEnded = useRef(false);
  const [initialPositionSet, setInitialPositionSet] = useState(false);


  useEffect(() => {
    if (data?.data) {
      dispatch(setResumeData({
        resumeExamData: resumeExamData,
        lastResponse: lastResponse,
        examAttendId: examAttendId
      }));
    }
  }, [data, resumeExamData, lastResponse, examAttendId, dispatch]);


  useEffect(() => {
    if (!exam) return;
    
    const examConfig = getExamConfig(exam.examType || exam.examName);
    const locks = examConfig.getLockRules(exam.sections);
    
   
    setSectionLock(locks);
    locksInitialized.current = true;
  }, [exam]);


  useEffect(() => {
    if (!exam || initialPositionSet || Object.keys(sectionLock).length === 0) return;

    let lastModuleIndex = 0;
    let lastQuestionIndex = 0;
    let positionFound = false;

    const responseObject = exam.sections.reduce((acc, curr, moduleIndex) => {
      acc[curr.sectionId] = curr.questions.reduce((a, current, questionIndex) => {

        const resExist = resumeExamData && resumeExamData[curr.sectionId]?.find(r => String(r.questionId) === String(current.questionId));
        
     
        if (lastResponse && String(lastResponse.sectionId) === String(curr.sectionId) && String(lastResponse.questionId) === String(current.questionId)) {
          lastModuleIndex = moduleIndex;
          lastQuestionIndex = questionIndex;
          positionFound = true;
        }
        

        if (resExist) {
          dispatch(restoreAnswer({
            questionId: current.questionId,
            studentAnswer: resExist.studentAnswer,
            questionType: current.type
          }));
          

          if (current.type !== 'MCQ' && resExist.studentAnswer) {
            // This will be handled by the restoreAnswer action
          }
        }
        

        a[current.questionId] = {
          answer: resExist ? resExist.studentAnswer : null,
          sectionName: curr.sectionName,
          isVisited: resExist ? true : (moduleIndex === 0 && questionIndex === 0),
          isMarkedForReview: false,
          isAnswered: !!resExist
        };
        
        return a;
      }, {});
      return acc;
    }, {});

    dispatch(setCandidateResponse(responseObject));



    let targetSectionIndex = 0;
    let targetQuestionIndex = 0;
    
    if (lastResponse && positionFound) {
  
      targetSectionIndex = lastModuleIndex;
      targetQuestionIndex = lastQuestionIndex;

    } else if (lastResponse && !positionFound) {
   
      const sectionIndexById = exam.sections.findIndex(sec => String(sec.sectionId) === String(lastResponse.sectionId));

      if (sectionIndexById !== -1) {
        const foundSection = exam.sections[sectionIndexById];
          const questionIndexById = foundSection.questions.findIndex(q => String(q.questionId) === String(lastResponse.questionId));
          if (questionIndexById !== -1) {
            targetSectionIndex = sectionIndexById;
            targetQuestionIndex = questionIndexById;
            positionFound = true;
          }
      }
    }
    

    if (!lastResponse || !positionFound) {
      targetSectionIndex = 0;
      targetQuestionIndex = 0;
    }
    

    if (sectionLock[targetSectionIndex]) {
      const firstUnlockedIndex = exam.sections.findIndex((sec, idx) => !sectionLock[idx]);
      if (firstUnlockedIndex !== -1) {
        targetSectionIndex = firstUnlockedIndex;
        targetQuestionIndex = 0;
      } else {
        targetSectionIndex = 0;
        targetQuestionIndex = 0;
      }
    }


    

    const shouldCheckDurationLeft = exam.durationScope === 'section' || exam.examDurationLeft !== null;
    
    if (shouldCheckDurationLeft) {
   
      const targetSection = exam.sections[targetSectionIndex];
      let targetSectionDurationLeft = null;
      
      if (targetSection) {
        if (exam.durationScope === 'section') {

          targetSectionDurationLeft = targetSection.durationLeft;
        } else if (exam.durationScope === 'exam' && exam.examDurationLeft !== null) {
     
          targetSectionDurationLeft = exam.examDurationLeft > 0 ? targetSection.sectionDuration : 0;
        }
      }
      
   
      const targetHasTimeLeft = targetSectionDurationLeft === null || targetSectionDurationLeft > 0;
      
     
      if (!targetHasTimeLeft || sectionLock[targetSectionIndex]) {
        let foundSectionWithTime = false;
        
        for (let i = 0; i < exam.sections.length; i++) {
    
          if (sectionLock[i]) {
            continue;
          }
          
          const section = exam.sections[i];
          let sectionDurationLeft = null;
          
          if (exam.durationScope === 'section') {
            sectionDurationLeft = section.durationLeft;
          } else if (exam.durationScope === 'exam' && exam.examDurationLeft !== null) {
            sectionDurationLeft = exam.examDurationLeft > 0 ? section.sectionDuration : 0;
          }
          
          const hasTimeLeft = sectionDurationLeft === null || sectionDurationLeft > 0;
          
          if (hasTimeLeft) {
            targetSectionIndex = i;
            targetQuestionIndex = 0;
            foundSectionWithTime = true;
            break;
          }
        }
        
     
        if (!foundSectionWithTime) {
          navigate("/solutions");
          return;
        }
      }
    }

 
    setSectionIdx(targetSectionIndex);
    setQuestionIdx(targetQuestionIndex);
    setInitialPositionSet(true);
  }, [exam, resumeExamData, lastResponse, dispatch, initialPositionSet, sectionLock, navigate]);




  useEffect(() => {
    if (!exam || Object.keys(sectionLock).length === 0) return;
    
 
    if (sectionLock[sectionIdx]) {
      const firstUnlockedIndex = exam.sections.findIndex((sec, idx) => !sectionLock[idx]);
      if (firstUnlockedIndex !== -1) {
        setSectionIdx(firstUnlockedIndex);
        setQuestionIdx(0);
      }
    }
  }, [exam, sectionIdx, sectionLock]);

  useEffect(() => {
    if (!exam) return;
    const currentSection = exam.sections[sectionIdx];
    if (!currentSection) return;

  
    let initialTime = currentSection.time;
    
    if (exam.durationScope === 'exam' && exam.examDurationLeft !== null) {
     
      if (exam.examDurationLeft > 0) {

        initialTime = currentSection.sectionDuration * 60;
      } else {
        // Exam time is up
        initialTime = 0;
      }
    } else if (exam.durationScope === 'section') {
  
      initialTime = currentSection.time;
    }

    setTimeLeft(initialTime);
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


  useEffect(() => {
    if (!exam) return;
    const currentSection = exam.sections[sectionIdx];
    if (!currentSection || !currentSection.questions[questionIdx]) return;
    
    const currentQuestion = currentSection.questions[questionIdx];
    

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
  }, [sectionIdx, questionIdx, exam, dispatch, answers]);


  const handleSectionEnd = useCallback(() => {
    if (!exam) return;
    
    const examConfig = getExamConfig(exam.examType || exam.examName);
    

    setSectionLock(prev => {
      const updated = { ...prev };
      const examType = (exam.examType || exam.examName || '').toUpperCase();
      
      if (examType === 'CAT') {

        updated[sectionIdx] = true;
      
        if (sectionIdx + 1 < exam.sections.length) {
          updated[sectionIdx + 1] = false;
        }
      }
 
      return updated;
    });

  
    let nextSectionIndex = -1;
    
 
    const shouldCheckDurationLeft = exam.durationScope === 'section' || exam.examDurationLeft !== null;
    
    if (shouldCheckDurationLeft) {
    
      for (let i = sectionIdx + 1; i < exam.sections.length; i++) {
       
        if (sectionLock[i]) {
          continue;
        }
        
        const section = exam.sections[i];
        let sectionDurationLeft = null;
        
        if (exam.durationScope === 'section') {
   
          sectionDurationLeft = section.durationLeft;
        } else if (exam.durationScope === 'exam' && exam.examDurationLeft !== null) {
        
          sectionDurationLeft = exam.examDurationLeft > 0 ? section.sectionDuration : 0;
        }
        

        const hasTimeLeft = sectionDurationLeft === null || sectionDurationLeft > 0;
        
        if (hasTimeLeft) {
          nextSectionIndex = i;
          break;
        }
      }
    } else {

      if (sectionIdx < exam.sections.length - 1) {

        for (let i = sectionIdx + 1; i < exam.sections.length; i++) {
          if (!sectionLock[i]) {
            nextSectionIndex = i;
            break;
          }
        }
      }
    }


    if (nextSectionIndex !== -1) {

      setSectionIdx(nextSectionIndex);
      setQuestionIdx(0);
      setNoOptionsSelected(false);
 
      setDescriptive('');
      dispatch(setKeyboardValue(''));
    } else {
  
      navigate("/solutions");
    }
  }, [exam, sectionIdx, sectionLock, navigate, dispatch]);


  useEffect(() => {
    if (timeLeft === 0 && !sectionEnded.current && exam && handleSectionEnd) {
      sectionEnded.current = true;
    
  
      setTimeout(() => {
        handleSectionEnd();
      }, 100);
    }
  }, [timeLeft, exam, handleSectionEnd]);


  if (isLoading) return <p>Loading...</p>;
  if (error || !exam) return <p>Exam not found</p>;

  const section = exam.sections[sectionIdx];
  if (!section || !section.questions.length) return <p>No questions in this section</p>;

  const question = section.questions[questionIdx];

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

        
        const durationLeftMinutes = Math.round(timeLeft / 60);

        await triggerAnswerQuestion({
          data: {
            questionId: question.questionId,
            sectionId: section.sectionId,
            studentAnswer: studentAnswer,
            time: timeTakenSeconds,
            durationLeft: durationLeftMinutes
          },
          headers: {
            'Authorization': `Bearer ${eid}`
          }
        }).unwrap();
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

    handleSelect(null, text || '');
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
          {exam.sections.map((sec, idx) => {
    
            const isLocked = sectionLock[idx] === true; 
            const isActive = idx === sectionIdx;
            
        
            if (isActive && exam.examType === 'CAT' && sectionLock[idx] !== (idx !== 0)) {
              console.warn('⚠️ Lock mismatch:', {
                section: sec.sectionName,
                index: idx,
                expected: idx !== 0 ? 'LOCKED' : 'UNLOCKED',
                actual: sectionLock[idx] ? 'LOCKED' : 'UNLOCKED',
                allLocks: sectionLock
              });
            }
            
            return (
              <span
                key={sec.sectionId}
                className={`section ${isActive ? 'active' : ''} ${isLocked ? 'noClickCursor' : ''}`}
                onClick={isLocked ? undefined : () => {
                  if (!isLocked) {
                    setSectionIdx(idx);
                    setQuestionIdx(0);
                  }
                }}
              >
                {sec.sectionName}
                {isLocked && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
              </span>
            );
          })}
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

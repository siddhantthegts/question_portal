import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setResumeData, setCandidateResponse, restoreAnswer } from '../store/examSlice.js';
import Calculator from '../components/Calculator.jsx';
import SectionSummaryModal from '../components/SectionSummaryModal.jsx';
import CATSubmissionWarningModal from '../components/CATSubmissionWarningModal.jsx';
import './QuestionPage.css';
import { useGetExamQuery, useAnswerQuestionMutation, useUpdateExamDurationMutation, useSetSectionOrderMutation } from '../store/api.js';
import { useNavigate } from 'react-router-dom';
import { getExamConfig, sectionOrderers, sectionLockRules } from '../config/examConfig.js';
import QuestionView from '../components/QuestionView.jsx';
import NMATSectionOrderStep from '../components/NMATSectionOrderStep.jsx';

function ExamPage() {
  const { eid } = useParams();
  const navigate = useNavigate();
  const [triggerAnswerQuestion] = useAnswerQuestionMutation();
  const [updateExamDuration] = useUpdateExamDurationMutation();
  const answers = useSelector((state) => state.test.answers);
  const { startTimes } = useSelector((state) => state.test);

  const { data, error, isLoading, refetch: refetchExam } = useGetExamQuery({
    url: 'exam-section-question',
    headers: {
      Authorization: `Bearer ${eid}`
    }
  });

  const [setSectionOrder, { isPending: isSectionOrderSubmitting }] = useSetSectionOrderMutation();

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

  const attemptExam = useMemo(() => data?.data?.attemptExam ?? null, [data]);

  const examAttendId = useMemo(() => {
    return attemptExam?.id ?? data?.data?.examAttendId ?? null;
  }, [data, attemptExam]);

  const attemptCurrentSectionId = useMemo(() => {
    return attemptExam?.currentSectionId ?? data?.data?.currentSectionId ?? null;
  }, [data, attemptExam]);

  const attemptSectionOrder = useMemo(() => {
    return attemptExam?.sectionOrder ?? data?.data?.sectionOrder ?? null;
  }, [data, attemptExam]);

  const attemptRemainingTime = useMemo(() => {
    const raw = attemptExam?.remainingTime ?? data?.data?.remainingTime;
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
  }, [data, attemptExam]);

  const exam = useMemo(() => {
    if (!data?.data?.allData) return null;
    const examData = data.data.allData;
    const examType = examData.categoryName || examData.examType;
    const examConfig = getExamConfig(examType);
    
    
    let sections = examData.sections.map(sec => ({
        sectionId: sec.sectionId,
        sectionName: sec.sectionName,
      durationLeft: sec.durationLeft !== undefined && sec.durationLeft !== null ? Number(sec.durationLeft) : null,
      sectionDuration: Number(sec.sectionDuration), 
      time: sec.durationLeft !== undefined && sec.durationLeft !== null 
        ? Math.floor(Number(sec.durationLeft) * 60 + 0.5)
        : Number(sec.sectionDuration) * 60,
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
    if (Array.isArray(attemptSectionOrder) && attemptSectionOrder.length > 0) {
      const orderMap = new Map(
        attemptSectionOrder.map((sectionId, index) => [String(sectionId), index])
      );
      sections = [...sections].sort((a, b) => {
        const aIndex = orderMap.has(String(a.sectionId)) ? orderMap.get(String(a.sectionId)) : Number.MAX_SAFE_INTEGER;
        const bIndex = orderMap.has(String(b.sectionId)) ? orderMap.get(String(b.sectionId)) : Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
      });
    } else {
      const orderSections = sectionOrderers[examType] || sectionOrderers.default;
      sections = orderSections(sections);
    }
    
    let examDurationLeft = examData.durationLeft !== undefined && examData.durationLeft !== null 
      ? Number(examData.durationLeft) 
      : null;
    
    if (examType === 'SNAP' && examDurationLeft === null) {
      examDurationLeft = 60;
    }
    
    const getLockRules = sectionLockRules[examType] || sectionLockRules.default;
    const initialLocks = getLockRules(sections);
    const locksBySectionId = {};
    sections.forEach((sec, idx) => {
      locksBySectionId[sec.sectionId] = initialLocks[idx] || false;
    });
    
    return {
      examId: examData.examId,
      examName: examData.categoryName,
      examType: examType,
      totalTime: examData.examDuration * 60,
      examDurationLeft: examDurationLeft, 
      durationScope: examConfig.durationScope,
      sections: sections,
      initialLocks: locksBySectionId,
      attemptCurrentSectionId: attemptCurrentSectionId,
      attemptRemainingTime: attemptRemainingTime,
      attemptSectionOrder: attemptSectionOrder
    };
  }, [data, attemptSectionOrder, attemptCurrentSectionId, attemptRemainingTime]);


  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [sectionLocks, setSectionLocks] = useState({});
  const dispatch = useDispatch();
  const { candidateResponse } = useSelector((state) => state.test);
  const [showCalc, setShowCalc] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [isTimeoutSubmission, setIsTimeoutSubmission] = useState(false);
  const [showCATWarningModal, setShowCATWarningModal] = useState(false);
  const pendingSectionEnd = useRef(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timeLeftRef = useRef(0);
  const sectionEnded = useRef(false);
  const timerStartedRef = useRef(false);
  const [initialPositionSet, setInitialPositionSet] = useState(false);
  const timeUpdateIntervalRef = useRef(null);
  const positionSetRef = useRef(false);
  const currentSectionRef = useRef(null);
  const examTimerInitializedRef = useRef(false);


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
    if (exam?.initialLocks) {
      setSectionLocks(exam.initialLocks);
    }
    examTimerInitializedRef.current = false;
  }, [exam]);





  useEffect(() => {
    if (!exam || initialPositionSet || positionSetRef.current) {
      return;
    }
    
    positionSetRef.current = true;
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
    let hasAttemptSection = false;
    if (exam.attemptCurrentSectionId != null && exam.attemptCurrentSectionId !== '') {
      const attemptSectionIndex = exam.sections.findIndex(
        (sec) => String(sec.sectionId) === String(exam.attemptCurrentSectionId)
      );
      if (attemptSectionIndex !== -1) {
        targetSectionIndex = attemptSectionIndex;
        targetQuestionIndex = 0;
        hasAttemptSection = true;
        positionFound = true;
      }
    }
    if (!hasAttemptSection && lastResponse && lastResponse.sectionId && lastResponse.questionId) {
      if (positionFound) {
        targetSectionIndex = lastModuleIndex;
        targetQuestionIndex = lastQuestionIndex;
      } else {
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
    }
    if (!hasAttemptSection && (!lastResponse || !lastResponse.sectionId || !positionFound)) {
      targetSectionIndex = 0;
      targetQuestionIndex = 0;
    }
    if (!hasAttemptSection && lastResponse && positionFound) {
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
        if (!targetHasTimeLeft) {
          let foundSectionWithTime = false;
          
          for (let i = 0; i < exam.sections.length; i++) {
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
            const examId = exam?.examId || data?.data?.allData?.examId;
            navigate("/solutions", { state: { examId, token: eid, examAttendId } });
            return;
          }
        }
      }
    }
    const targetSection = exam.sections[targetSectionIndex];
    if (targetSection) {
      const targetIsLocked = exam.initialLocks && exam.initialLocks[targetSection.sectionId] === true;
      if (targetIsLocked) {
        for (let i = 0; i < exam.sections.length; i++) {
          const section = exam.sections[i];
          const isLocked = exam.initialLocks && exam.initialLocks[section.sectionId] === true;
          if (!isLocked) {
            setCurrentSectionId(section.sectionId);
            break;
    }
        }
      } else {
        const selectedSectionId = targetSection.sectionId;
        setCurrentSectionId(selectedSectionId);
      }
    }
    
    setInitialPositionSet(true);
  }, [exam, resumeExamData, lastResponse, dispatch, initialPositionSet, navigate]);

  const getSectionById = useCallback((sectionId) => {
    if (!exam || !sectionId) return null;
    return exam.sections.find(sec => String(sec.sectionId) === String(sectionId)) || null;
  }, [exam]);

  const currentSection = useMemo(() => {
    const section = getSectionById(currentSectionId);
    currentSectionRef.current = section;
    return section;
  }, [currentSectionId, getSectionById, exam]);

  useEffect(() => {
    if (!exam || !currentSection) return;

    let initialTime = currentSection.time;
    const hasAttemptRemainingTime = typeof exam.attemptRemainingTime === 'number' && exam.attemptRemainingTime >= 0;
    const isAttemptSection = exam.attemptCurrentSectionId != null &&
      String(exam.attemptCurrentSectionId) === String(currentSection?.sectionId);
    
    if (exam.durationScope === 'exam') {
      if (hasAttemptRemainingTime) {
        if (examTimerInitializedRef.current && timeLeftRef.current > 0) {
          initialTime = timeLeftRef.current;
        } else {
          initialTime = exam.attemptRemainingTime;
          examTimerInitializedRef.current = true;
        }
      } else if (exam.examDurationLeft !== null) {
      if (exam.examDurationLeft > 0) {
        if (examTimerInitializedRef.current && timeLeftRef.current > 0) {
          initialTime = timeLeftRef.current;
        } else {
          initialTime = Math.floor(exam.examDurationLeft * 60);
          examTimerInitializedRef.current = true;
        }
      } else {
        initialTime = 0;
      }
      }
    } else if (exam.durationScope === 'section') {
      initialTime = currentSection.time;
      if (hasAttemptRemainingTime && isAttemptSection) {
        initialTime = exam.attemptRemainingTime;
      }
      examTimerInitializedRef.current = false;
    }
    sectionEnded.current = false;
    timerStartedRef.current = false;
    setTimeLeft(initialTime);
    timeLeftRef.current = initialTime;
    if (initialTime > 0) {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          timerStartedRef.current = false;
          timeLeftRef.current = 0;
          return 0;
        }
          const newTime = prev - 1;
          timeLeftRef.current = newTime;
          return newTime;
      });
    }, 1000);
      
      // Set timerStartedRef to true only after timer is actually running
      // Use a small delay to ensure the interval is set up
      setTimeout(() => {
        timerStartedRef.current = true;
      }, 100);
      
      return () => {
        clearInterval(timer);
        sectionEnded.current = true;
        timerStartedRef.current = false;
      };
    } else {
      timerStartedRef.current = false;
      return () => {
        sectionEnded.current = true;
        timerStartedRef.current = false;
      };
    }

    return () => {
      clearInterval(timer);
      sectionEnded.current = true;
      timerStartedRef.current = false;
    };
  }, [currentSectionId, exam, currentSection]);

  const resetTimeUpdateInterval = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  }, []);

  const startTimeUpdateInterval = useCallback(() => {
    if (!exam) return;
    resetTimeUpdateInterval();
    timeUpdateIntervalRef.current = setInterval(async () => {
      const latestSection = currentSectionRef.current;
      const latestTime = timeLeftRef.current;

      if (!exam || sectionEnded.current) {
        resetTimeUpdateInterval();
        return;
      }
      
      if (!latestSection) return;
      
      try {
        await updateExamDuration({
          data: {
            currentSectionId: latestSection.sectionId,
            sectionId: latestSection.sectionId
          },
          headers: {
            'Authorization': `Bearer ${eid}`
          }
        }).unwrap();
      } catch (error) {
        console.error("Failed to update exam duration:", error);
      }
    }, 30000); // 30 seconds
  }, [exam, resetTimeUpdateInterval, updateExamDuration, eid]);

  // Set up 30-second time update interval
  useEffect(() => {
    // Only start interval if all conditions are met
    if (!exam || sectionEnded.current || !currentSection || timeLeft === null || timeLeft <= 0) {
      resetTimeUpdateInterval();
      return;
    }
    startTimeUpdateInterval();
    return () => {
      resetTimeUpdateInterval();
    };
  }, [exam, currentSectionId, currentSection, timeLeft, startTimeUpdateInterval, resetTimeUpdateInterval]);

  useEffect(() => {
    if (!exam || !currentSection || sectionEnded.current) return;

    const handleUnload = () => {
      const section = currentSectionRef.current;
      if (!section) return;
      resetTimeUpdateInterval();
      const baseUrl = typeof import.meta.env?.VITE_API_BASE_URL === 'string' ? import.meta.env.VITE_API_BASE_URL : 'https://catmock.com/panel';
      const url = `${baseUrl}/create/exam-question-answer/update-duration`;
      const body = JSON.stringify({
        currentSectionId: section.sectionId,
        sectionId: section.sectionId,
        isPaused: true
      });
      fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eid}` },
        keepalive: true
      }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [exam, currentSectionId, eid, resetTimeUpdateInterval]);

  const calculateSectionSummary = useCallback((section) => {
    if (!section || !section.questions) {
      return { attempted: 0, unanswered: 0, total: 0 };
    }

    let attempted = 0;
    const total = section.questions.length;

    section.questions.forEach((question) => {
      const answer = answers[question.questionId];
      const hasAnswer = answer && (
        (typeof answer.optionIndex === 'number' && answer.optionIndex >= 0) ||
        (answer.descriptiveText && typeof answer.descriptiveText === 'string' && answer.descriptiveText.trim() !== '')
      );
      if (hasAnswer) {
        attempted++;
      }
    });

    const unanswered = total - attempted;
    return { attempted, unanswered, total };
  }, [answers]);

  // Show summary modal before ending section
  const showSectionSummary = useCallback((section, isTimeout = false) => {
    const summary = calculateSectionSummary(section);
    setSummaryData({
      sectionName: section.sectionName,
      ...summary,
      isTimeout: isTimeout // Store timeout flag in summary data
    });
    setIsTimeoutSubmission(isTimeout);
    setShowSummaryModal(true);
  }, [calculateSectionSummary]);

  const proceedWithSectionEnd = useCallback((isTimeout = false) => {
    if (!exam || !currentSection) return;
    if (exam.examType === 'CAT') {
      if (timeLeft !== null && timeLeft > 0) {
        console.warn('CAT exam: Cannot end section until time is exhausted. Time remaining:', timeLeft);
        setShowCATWarningModal(true);
        setShowSummaryModal(false); // Close summary modal
        return;
      }
    }
    const currentSectionIndex = exam.sections.findIndex(sec => String(sec.sectionId) === String(currentSectionId));
    if (currentSectionIndex === -1) {
      const examId = exam?.examId || data?.data?.allData?.examId;
      navigate("/solutions", { state: { examId, token: eid, examAttendId } });
      return;
    }
    
    // Lock current section and unlock next section when current section is submitted (for CAT exams)
    setSectionLocks(prev => {
      const newLocks = { ...prev };
      
      // Lock the current section
      newLocks[currentSectionId] = true;
      
      // Unlock next section if it exists
      if (currentSectionIndex < exam.sections.length - 1) {
        const nextSection = exam.sections[currentSectionIndex + 1];
        if (nextSection) {
          newLocks[nextSection.sectionId] = false;
        }
      }
      
      return newLocks;
    });
    if (exam.examType === 'CAT') {
      if (timeLeft !== null && timeLeft > 0) {
        console.warn('CAT exam: Cannot move to next section until time is exhausted. Time remaining:', timeLeft);
        setShowCATWarningModal(true);
        return;
      }
    }
    let nextSectionId = null;
    const shouldCheckDurationLeft = exam.durationScope === 'section' || exam.examDurationLeft !== null;
    if (shouldCheckDurationLeft) {
      for (let i = currentSectionIndex + 1; i < exam.sections.length; i++) {
        const section = exam.sections[i];
        let sectionDurationLeft = null;
        
        if (exam.durationScope === 'section') {
          sectionDurationLeft = section.durationLeft;
        } else if (exam.durationScope === 'exam' && exam.examDurationLeft !== null) {
          sectionDurationLeft = exam.examDurationLeft > 0 ? section.sectionDuration : 0;
        }
        
        const hasTimeLeft = sectionDurationLeft === null || sectionDurationLeft > 0;
        
        if (hasTimeLeft) {
          nextSectionId = section.sectionId;
          break;
        }
      }
    } else {
      if (currentSectionIndex < exam.sections.length - 1) {
        nextSectionId = exam.sections[currentSectionIndex + 1].sectionId;
      }
    }

    if (nextSectionId) {
      setCurrentSectionId(nextSectionId);
    } else {
      const examId = exam?.examId || data?.data?.allData?.examId;
      navigate("/solutions", { state: { examId, token: eid, examAttendId } });
    }
  }, [exam, currentSectionId, currentSection, navigate, timeLeft]);

  const handleSectionEnd = useCallback((isTimeout = false) => {
    if (!exam || !currentSection) return;
    if (exam.examType === 'SNAP' && isTimeout && timeLeft === 0) {
      const examId = exam?.examId || data?.data?.allData?.examId;
      navigate("/solutions", { state: { examId, token: eid, examAttendId } });
      return;
    }
    if (exam.examType === 'CAT') {
      if (timeLeft !== null && timeLeft > 0) {
        setShowCATWarningModal(true);
        return;
      }
      if (timeLeft === 0) {
        showSectionSummary(currentSection, true);
        return;
      }
    }
    showSectionSummary(currentSection, isTimeout);
  }, [exam, currentSection, showSectionSummary, timeLeft, navigate, eid, examAttendId, data]);

  const handleCATWarningClose = useCallback(() => {
    setShowCATWarningModal(false);
  }, []);

  useEffect(() => {
    if (timeLeft !== null &&
        timeLeft === 0 &&
        !sectionEnded.current &&
        timerStartedRef.current &&
        exam &&
        currentSection &&
        handleSectionEnd &&
        currentSectionId) {
      sectionEnded.current = true;
      timerStartedRef.current = false;
      const currentSectionIndex = exam.sections.findIndex(sec => String(sec.sectionId) === String(currentSectionId));
      if (currentSectionIndex !== -1 && currentSectionIndex < exam.sections.length - 1) {
        const nextSection = exam.sections[currentSectionIndex + 1];
        if (nextSection) {
          updateExamDuration({
            data: {
              currentSectionId: nextSection.sectionId,
              sectionId: nextSection.sectionId
            },
            headers: { Authorization: `Bearer ${eid}` }
          }).catch((err) => console.error('Failed to update section on timeout:', err));
        }
      }
      setTimeout(() => handleSectionEnd(true), 100);
    }
  }, [timeLeft, exam, handleSectionEnd, currentSection, currentSectionId, updateExamDuration, eid]);

  const handleSectionOrderConfirm = useCallback(
    async (sectionOrder) => {
      try {
        await setSectionOrder({
          data: { sectionOrder },
          headers: { Authorization: `Bearer ${eid}` }
        }).unwrap();
        await refetchExam();
      } catch (err) {
        console.error('Failed to save section order:', err);
      }
    },
    [eid, setSectionOrder, refetchExam]
  );

  if (isLoading) return <p>Loading...</p>;
  if (error || !exam) return <p>Exam not found</p>;

  const showNmatSectionOrder =
    exam.examType === 'NMAT' &&
    (!attemptSectionOrder || !Array.isArray(attemptSectionOrder) || attemptSectionOrder.length === 0);
  if (showNmatSectionOrder) {
    return (
      <div className="question-container">
        <NMATSectionOrderStep
          sections={exam.sections}
          onConfirm={handleSectionOrderConfirm}
          isSubmitting={isSectionOrderSubmitting}
        />
      </div>
    );
  }

  if (!currentSection || !currentSection.questions.length) {
    return <p>No questions in this section</p>;
  }

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '00:00:00';
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
          {exam.sections.map((sec) => {
            const isActive = String(sec.sectionId) === String(currentSectionId);
            const isLocked = sectionLocks[sec.sectionId] === true;

            return (
            <span
              key={sec.sectionId}
                className={`section ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => {
                  // For CAT exams, prevent manual section switching if current section time is not exhausted
                  if (exam.examType === 'CAT' && currentSectionId && timeLeft !== null && timeLeft > 0) {
                    setShowCATWarningModal(true);
                    return;
                  }
                  
                  if (!isLocked) {
                    setCurrentSectionId(sec.sectionId);
                  }
                }}
                title={isLocked ? 'This section is locked. Complete previous sections to unlock.' : ''}
                style={{
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1
              }}
            >
              {sec.sectionName}
                {isLocked && <span className="lock-icon"> 🔒</span>}
            </span>
            );
          })}
        </nav>
        <div className="timer">Time Left : {formatTime(timeLeft)} </div>
        <button className="btn calc-toggle" onClick={() => setShowCalc(true)}>
          Calculator
        </button>
      </header>

      <QuestionView
        section={currentSection}
        sectionId={currentSectionId}
        timeLeft={timeLeft}
        profile={profile}
        onSectionEnd={handleSectionEnd}
        resetTimeUpdateInterval={resetTimeUpdateInterval}
        startTimeUpdateInterval={startTimeUpdateInterval}
      />
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
      <CATSubmissionWarningModal
        isOpen={showCATWarningModal}
        onClose={handleCATWarningClose}
        timeRemaining={timeLeft}
      />
      
      {/* Section Summary Modal */}
      <SectionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setSummaryData(null);
        }}
        onContinue={() => {
          setShowSummaryModal(false);
          proceedWithSectionEnd(isTimeoutSubmission);
          setSummaryData(null);
        }}
        sectionName={summaryData?.sectionName || ''}
        attemptedCount={summaryData?.attempted || 0}
        unansweredCount={summaryData?.unanswered || 0}
        totalQuestions={summaryData?.total || 0}
        isTimeout={isTimeoutSubmission}
      />
    </div>
  );
}

export default ExamPage;

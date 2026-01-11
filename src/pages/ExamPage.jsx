import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setResumeData, setCandidateResponse, restoreAnswer } from '../store/examSlice.js';
import Calculator from '../components/Calculator.jsx';
import SectionSummaryModal from '../components/SectionSummaryModal.jsx';
import CATSubmissionWarningModal from '../components/CATSubmissionWarningModal.jsx';
import './QuestionPage.css';
import { useGetExamQuery, useAnswerQuestionMutation } from '../store/api.js';
import { useNavigate } from 'react-router-dom';
import { getExamConfig, sectionOrderers, sectionLockRules } from '../config/examConfig.js';
import QuestionView from '../components/QuestionView.jsx';

function ExamPage() {
  const { eid } = useParams();
  const navigate = useNavigate();
  const [triggerAnswerQuestion] = useAnswerQuestionMutation();
  const answers = useSelector((state) => state.test.answers);
  const { startTimes } = useSelector((state) => state.test);

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
      durationLeft: sec.durationLeft !== undefined && sec.durationLeft !== null ? Number(sec.durationLeft) : null, //durationLeft in minutes (can be decimal like 34.5)
      sectionDuration: Number(sec.sectionDuration), 
      time: sec.durationLeft !== undefined && sec.durationLeft !== null 
        ? Math.floor(Number(sec.durationLeft) * 60 + 0.5) // Convert minutes to seconds (supports decimals: 34.5 min = 2070 sec, +0.5 for proper rounding)
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
    
    // Order sections based on exam type (e.g., CAT: VARC -> DILR -> QA)
    const orderSections = sectionOrderers[examType] || sectionOrderers.default;
    sections = orderSections(sections);
    
    let examDurationLeft = examData.durationLeft !== undefined && examData.durationLeft !== null 
      ? Number(examData.durationLeft) 
      : null;
    
    // For SNAP exams, set default 60 minutes if examDurationLeft is null
    if (examType === 'SNAP' && examDurationLeft === null) {
      examDurationLeft = 60; // 60 minutes default for SNAP
    }
    
    // Initialize section locks based on exam type
    const getLockRules = sectionLockRules[examType] || sectionLockRules.default;
    const initialLocks = getLockRules(sections);
    
    // Convert index-based locks to sectionId-based locks
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
      initialLocks: locksBySectionId
    };
  }, [data]);


  const [currentSectionId, setCurrentSectionId] = useState(null); // Use sectionId instead of index
  const [sectionLocks, setSectionLocks] = useState({}); // Track which sections are locked by sectionId
  const dispatch = useDispatch();
  const { candidateResponse } = useSelector((state) => state.test);
  const [showCalc, setShowCalc] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [isTimeoutSubmission, setIsTimeoutSubmission] = useState(false);
  const [showCATWarningModal, setShowCATWarningModal] = useState(false);
  const pendingSectionEnd = useRef(null); // Store the section end action to execute after modal
  const [timeLeft, setTimeLeft] = useState(null); // Start as null to prevent auto-submit on initial render
  const timeLeftRef = useRef(0); // Ref to store current timeLeft for interval access
  const sectionEnded = useRef(false);
  const timerStartedRef = useRef(false); // Track if timer has started to avoid auto-submit on initial 0
  const [initialPositionSet, setInitialPositionSet] = useState(false);
  const timeUpdateIntervalRef = useRef(null); // Ref to store 30-second interval timer
  const positionSetRef = useRef(false); // Ref to track if position was set (prevents multiple sets)
  const currentSectionRef = useRef(null); // Ref to store current section for interval access
  const examTimerInitializedRef = useRef(false); // Ref to track if exam-level timer has been initialized


  useEffect(() => {
    if (data?.data) {
      dispatch(setResumeData({
        resumeExamData: resumeExamData,
        lastResponse: lastResponse,
        examAttendId: examAttendId
      }));
    }
  }, [data, resumeExamData, lastResponse, examAttendId, dispatch]);

  // Initialize section locks when exam loads
  useEffect(() => {
    if (exam?.initialLocks) {
      setSectionLocks(exam.initialLocks);
    }
    // Reset exam timer initialization when exam changes
    examTimerInitializedRef.current = false;
  }, [exam]);





  useEffect(() => {
    if (!exam || initialPositionSet || positionSetRef.current) {
      return;
    }
    
    positionSetRef.current = true; // Mark that we're setting position to prevent re-runs

    let lastModuleIndex = 0;
    let lastQuestionIndex = 0;
    let positionFound = false;

    const responseObject = exam.sections.reduce((acc, curr, moduleIndex) => {
      acc[curr.sectionId] = curr.questions.reduce((a, current, questionIndex) => {

        const resExist = resumeExamData && resumeExamData[curr.sectionId]?.find(r => String(r.questionId) === String(current.questionId));
        
        // Only use lastResponse if it exists AND we haven't already set position
        // This prevents resume data from overriding fresh exam start
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
    
    // Determine target position
    // IMPORTANT: Only use lastResponse if it actually exists and has valid data
    // For fresh exams (no lastResponse), always start at index 0 (VARC)
    if (lastResponse && lastResponse.sectionId && lastResponse.questionId) {
      if (positionFound) {
        // We found the exact position in the reduce loop
        targetSectionIndex = lastModuleIndex;
        targetQuestionIndex = lastQuestionIndex;
      } else {
        // Try to find by sectionId and questionId
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
    
    // For fresh exams (no lastResponse) or if position not found, start at section 0 (VARC)
    if (!lastResponse || !lastResponse.sectionId || !positionFound) {
      // Fresh exam - always start at section 0 (first section in ordered array = VARC)
      targetSectionIndex = 0;
      targetQuestionIndex = 0;
    }
    

    // Only check for sections with time left if resuming an exam
    // For fresh exams, always start at section 0 regardless of durationLeft
    if (lastResponse && positionFound) {
      const shouldCheckDurationLeft = exam.durationScope === 'section' || exam.examDurationLeft !== null;
      
      if (shouldCheckDurationLeft) {
        // Check if target section has time left
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
        
        // If target section has no time, find first section with time
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
            // Pass examId, token, and examAttendId when navigating to solutions
            const examId = exam?.examId || data?.data?.allData?.examId;
            navigate("/solutions", { state: { examId, token: eid, examAttendId } });
            return;
          }
        }
      }
    }
    

    // Set current section by sectionId instead of index
    const targetSection = exam.sections[targetSectionIndex];
    if (targetSection) {
      // Check if target section is locked - if so, find first unlocked section
      const targetIsLocked = exam.initialLocks && exam.initialLocks[targetSection.sectionId] === true;
      
      if (targetIsLocked) {
        // Find first unlocked section
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




  // Helper to find section by ID
  const getSectionById = useCallback((sectionId) => {
    if (!exam || !sectionId) return null;
    return exam.sections.find(sec => String(sec.sectionId) === String(sectionId)) || null;
  }, [exam]);

  // Get current section object
  const currentSection = useMemo(() => {
    const section = getSectionById(currentSectionId);
    // Update ref so interval callback always has latest section
    currentSectionRef.current = section;
    return section;
  }, [currentSectionId, getSectionById]);

  // Timer effect - updates when section changes
  useEffect(() => {
    if (!exam || !currentSection) return;

    let initialTime = currentSection.time;
    
    if (exam.durationScope === 'exam' && exam.examDurationLeft !== null) {
      if (exam.examDurationLeft > 0) {
        // For exam-level scope, preserve existing time if timer was already initialized
        // Otherwise, use examDurationLeft (in minutes) converted to seconds
        if (examTimerInitializedRef.current && timeLeftRef.current > 0) {
          // Preserve the current time when switching sections
          initialTime = timeLeftRef.current;
        } else {
          // First time initialization - use examDurationLeft
          initialTime = Math.floor(exam.examDurationLeft * 60);
          examTimerInitializedRef.current = true;
        }
      } else {
        // Exam time is up
        initialTime = 0;
      }
    } else if (exam.durationScope === 'section') {
      initialTime = currentSection.time;
      examTimerInitializedRef.current = false; // Reset for section-level scope
    }

    // Reset timer state before setting new time (but preserve timeLeft for exam-level scope)
    sectionEnded.current = false;
    timerStartedRef.current = false; // Set to false first to prevent race condition with auto-submit

    setTimeLeft(initialTime);
    timeLeftRef.current = initialTime;

    // Only start timer if there's time left
    if (initialTime > 0) {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          sectionEnded.current = true;
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
      // If no time left, don't start timer
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


  // Question initialization is now handled in QuestionView component

  // Function to reset the 30-second time update interval
  const resetTimeUpdateInterval = useCallback(() => {
    // Clear existing interval if any
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  }, []);

  // Function to start the 30-second time update interval
  const startTimeUpdateInterval = useCallback(() => {
    if (!exam) return;
    
    // Clear any existing interval first
    resetTimeUpdateInterval();

    // Set up new 30-second interval
    timeUpdateIntervalRef.current = setInterval(async () => {
      // Use refs to get latest values (avoid stale closures)
      const latestSection = currentSectionRef.current;
      const latestTime = timeLeftRef.current;

      if (!exam || sectionEnded.current) {
        resetTimeUpdateInterval();
        return;
      }
      
      if (!latestSection) {
        return; // Don't clear interval, just skip this update
      }
      
      try {
        // Skip if time is null or invalid
        if (latestTime === null || latestTime === undefined || latestTime < 0) {
          return;
        }
        
        // Convert to minutes with decimal support (e.g., 2070 seconds = 34.5 minutes)
        // Preserve decimal precision: 2070 / 60 = 34.5
        const durationLeftMinutes = Number((latestTime / 60).toFixed(2)); // Keep as decimal (34.5), rounded to 2 decimal places
        
        // Send ONLY durationLeft in the payload for time updates
        await triggerAnswerQuestion({
          data: {
            durationLeft: durationLeftMinutes // Only send time, nothing else
          },
          headers: {
            'Authorization': `Bearer ${eid}`
          }
        }).unwrap();
      } catch (error) {
        console.error("Failed to update exam time:", error);
      }
    }, 30000); // 30 seconds = 30000 milliseconds
  }, [exam, resetTimeUpdateInterval, triggerAnswerQuestion, eid]);

  // Set up 30-second time update interval
  useEffect(() => {
    // Only start interval if all conditions are met
    if (!exam || sectionEnded.current || !currentSection || timeLeft === null || timeLeft <= 0) {
      resetTimeUpdateInterval();
      return;
    }
    
    // Start the interval when exam is ready, section exists, and timer has been initialized
    startTimeUpdateInterval();
    
    // Cleanup on unmount or when dependencies change
    return () => {
      resetTimeUpdateInterval();
    };
  }, [exam, currentSectionId, currentSection, timeLeft, startTimeUpdateInterval, resetTimeUpdateInterval]);

  // Calculate section summary statistics
  const calculateSectionSummary = useCallback((section) => {
    if (!section || !section.questions) {
      return { attempted: 0, unanswered: 0, total: 0 };
    }

    let attempted = 0;
    const total = section.questions.length;

    section.questions.forEach((question) => {
      const answer = answers[question.questionId];
      // Check if answer exists and has a valid value
      // For MCQ: optionIndex should be a number (0 or greater)
      // For descriptive: descriptiveText should be a non-empty string
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

  // Actually end the section (called after modal confirmation)
  const proceedWithSectionEnd = useCallback((isTimeout = false) => {
    if (!exam || !currentSection) return;
    
    // For CAT exams, double-check that time has expired before allowing section end
    if (exam.examType === 'CAT') {
      // Only allow if time is actually exhausted (timeLeft === 0)
      if (timeLeft !== null && timeLeft > 0) {
        // Time is not exhausted - prevent section end and show warning
        console.warn('CAT exam: Cannot end section until time is exhausted. Time remaining:', timeLeft);
        setShowCATWarningModal(true);
        setShowSummaryModal(false); // Close summary modal
        return;
      }
    }
    
    // Find current section index
    const currentSectionIndex = exam.sections.findIndex(sec => String(sec.sectionId) === String(currentSectionId));
    if (currentSectionIndex === -1) {
      // Pass examId, token, and examAttendId when navigating to solutions
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
          newLocks[nextSection.sectionId] = false; // Unlock next section
        }
      }
      
      return newLocks;
    });
    
    // For CAT exams, ensure time is exhausted before moving to next section
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
      // Find next section with time left
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
      // Find next section without checking time
      if (currentSectionIndex < exam.sections.length - 1) {
        nextSectionId = exam.sections[currentSectionIndex + 1].sectionId;
      }
    }

    if (nextSectionId) {
      setCurrentSectionId(nextSectionId);
    } else {
      // Pass examId, token, and examAttendId when navigating to solutions
      const examId = exam?.examId || data?.data?.allData?.examId;
      navigate("/solutions", { state: { examId, token: eid, examAttendId } });
    }
  }, [exam, currentSectionId, currentSection, navigate, timeLeft]);

  const handleSectionEnd = useCallback((isTimeout = false) => {
    if (!exam || !currentSection) return;
    
    console.log('🔍 handleSectionEnd:', { isTimeout, timeLeft, examType: exam.examType });
    
    // For SNAP exams, when timeout occurs, navigate directly to solutions
    if (exam.examType === 'SNAP' && isTimeout && timeLeft === 0) {
      console.log('✅ SNAP: Time exhausted, navigating to solutions');
      const examId = exam?.examId || data?.data?.allData?.examId;
      navigate("/solutions", { state: { examId, token: eid, examAttendId } });
      return;
    }
    
    // For CAT exams, only allow submission when time is exhausted
    if (exam.examType === 'CAT') {
      // Check if time is still remaining
      if (timeLeft !== null && timeLeft > 0) {
        // Time is still remaining - show warning modal and prevent submission
        console.log('⚠️ CAT: Time remaining, showing warning modal');
        setShowCATWarningModal(true);
        return;
      }
      // Time is exhausted (timeLeft === 0) - show section summary modal
      if (timeLeft === 0) {
        console.log('✅ CAT: Time exhausted, showing section summary');
        showSectionSummary(currentSection, true); // Pass true for isTimeout
        return;
      }
    }
    
    // For non-CAT exams, show summary modal
    showSectionSummary(currentSection, isTimeout);
  }, [exam, currentSection, showSectionSummary, timeLeft, navigate, eid, examAttendId, data]);
  
  // Handle CAT warning modal close - just close the modal, don't proceed
  const handleCATWarningClose = useCallback(() => {
    setShowCATWarningModal(false);
    // User stays on current section - cannot proceed until time is exhausted
  }, []);


  // Auto-submit when time runs out - but only if timer was actually started and running
  useEffect(() => {
    // Only trigger if:
    // 1. timeLeft is 0 (time ran out) AND timeLeft is not null (was actually set by timer, not initial state)
    // 2. Section hasn't already ended
    // 3. Timer was actually started (not just initial state)
    // 4. We have a valid exam, handler, and currentSection
    // Only trigger if timeLeft was actually set (not null) and reached 0
    // This prevents auto-submit from triggering on initial render when timeLeft is null
    if (timeLeft !== null && 
        timeLeft === 0 && 
        !sectionEnded.current && 
        timerStartedRef.current && 
        exam && 
        currentSection && 
        handleSectionEnd &&
        currentSectionId) { // Ensure we have a valid section ID
      sectionEnded.current = true;
      timerStartedRef.current = false;
      setTimeout(() => {
        handleSectionEnd(true); // Pass true to indicate timeout
      }, 100);
    }
  }, [timeLeft, exam, handleSectionEnd, currentSection, currentSectionId]);


  if (isLoading) return <p>Loading...</p>;
  if (error || !exam) return <p>Exam not found</p>;
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
      
      {/* CAT Submission Warning Modal */}
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
          // Pass isTimeout flag to proceedWithSectionEnd
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

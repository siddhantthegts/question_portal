import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetExamQuery, useGetExamQuestionAnswersQuery } from '../store/api';
import {
  useGetStudentExamResultsByExamQuery,
  useGetStudentQuestionResponsesByExamQuery,
  useGetQuestionDifficultyStatsQuery,
} from '../store/analyticsApi';

/**
 * Custom hook to fetch and transform analytics data for AnalyticsPortal
 * @param {string} token - Authorization token (eid)
 * @returns {Object} Transformed analytics data
 */
export function useAnalyticsData(token) {
  const location = useLocation();
  const examId = location.state?.examId || null;
  const examAttendId = location.state?.examAttendId || null;
  
  // Get current student's responses from Redux (if available)
  const answers = useSelector((state) => state.test.answers);

  // Fetch exam data (sections, questions) - needed for proper mapping
  const {
    data: examData,
    isLoading: isLoadingExam,
    error: examError,
  } = useGetExamQuery(
    {
      url: 'exam-section-question',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    { skip: !token }
  );

  // Fetch exam results (for section-wise analysis and toppers)
  const {
    data: examResultsData,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useGetStudentExamResultsByExamQuery(
    {
      examId,
      params: {},
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    { skip: !examId || !token }
  );

  // Fetch exam-question-answer data (for answer sheet)
  // Debug: Log examAttendId to see if it's being passed
  console.log('🔍 useAnalyticsData - examAttendId check:', {
    examAttendId,
    token: token ? 'present' : 'missing',
    locationState: location.state,
    willSkip: !examAttendId || !token,
  });
  
  const {
    data: examQuestionAnswersData,
    isLoading: isLoadingExamAnswers,
    error: examAnswersError,
  } = useGetExamQuestionAnswersQuery(
    {
      attemptId: examAttendId,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    { skip: !examAttendId || !token }
  );
  
  console.log('🔍 exam-question-answer API result:', {
    data: examQuestionAnswersData,
    isLoading: isLoadingExamAnswers,
    error: examAnswersError,
  });

  // Fetch question responses for current student (for time analysis)
  const {
    data: responsesData,
    isLoading: isLoadingResponses,
    error: responsesError,
  } = useGetStudentQuestionResponsesByExamQuery(
    {
      examId,
      params: {},
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    { skip: !examId || !token }
  );

  // Fetch difficulty stats - we'll need to fetch for each question
  // For now, fetch all and filter
  const {
    data: difficultyStatsData,
    isLoading: isLoadingDifficulty,
    error: difficultyError,
  } = useGetQuestionDifficultyStatsQuery(
    {
      params: { limit: 1000, offset: 0 }, // Fetch all difficulty stats
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    { skip: !token }
  );

  // Extract exam structure
  const examStructure = useMemo(() => {
    if (!examData?.data?.allData) return null;
    const examDataObj = examData.data.allData;
    
    return {
      examId: examDataObj.examId,
      examName: examDataObj.title || examDataObj.examName || 'Exam',
      sections: (examDataObj.sections || []).map((sec) => ({
        sectionId: sec.sectionId,
        sectionName: sec.sectionName,
        questions: (sec.question || []).map((q) => ({
          questionId: q.id,
          text: q.questions,
          options: [q.A, q.B, q.C, q.D, q.E, q.F].filter((opt) => opt && opt.trim()),
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          passage: q.passage,
          direction: q.direction,
        })),
      })),
    };
  }, [examData]);

  // Transform data for components
  const analyticsData = useMemo(() => {
    const isLoading = isLoadingExam || isLoadingResults || isLoadingResponses || isLoadingDifficulty || isLoadingExamAnswers;
    const error = examError || resultsError || responsesError || difficultyError || examAnswersError;

    if (isLoading || !examStructure) {
      return {
        sectionWise: [],
        difficulty: [],
        timeAnalysis: [],
        answerSheet: [],
        toppers: [],
        examStructure: null,
        isLoading,
        error,
      };
    }

    const examResults = Array.isArray(examResultsData?.data) ? examResultsData.data : [];
    const questionResponses = Array.isArray(responsesData?.data) ? responsesData.data : [];
    const difficultyStats = Array.isArray(difficultyStatsData?.data) ? difficultyStatsData.data : [];
    
    // Try different possible response structures for exam-question-answer
    let examQuestionAnswers = [];
    if (Array.isArray(examQuestionAnswersData?.data?.allData)) {
      examQuestionAnswers = examQuestionAnswersData.data.allData;
    } else if (Array.isArray(examQuestionAnswersData?.data)) {
      examQuestionAnswers = examQuestionAnswersData.data;
    } else if (Array.isArray(examQuestionAnswersData?.allData)) {
      examQuestionAnswers = examQuestionAnswersData.allData;
    } else if (Array.isArray(examQuestionAnswersData)) {
      examQuestionAnswers = examQuestionAnswersData;
    }
    
    console.log('🔍 examQuestionAnswers extracted:', {
      count: examQuestionAnswers.length,
      sample: examQuestionAnswers.slice(0, 2),
      rawResponse: examQuestionAnswersData,
    });

    // Create a map of difficulty stats by questionId
    const difficultyByQuestionId = {};
    difficultyStats.forEach((stat) => {
      if (stat.questionId) {
        difficultyByQuestionId[stat.questionId] = stat;
      }
    });

    // Group question responses by sectionId for current student
    const studentResponsesBySection = {};
    questionResponses.forEach((response) => {
      const sectionId = response.sectionId;
      if (!studentResponsesBySection[sectionId]) {
        studentResponsesBySection[sectionId] = [];
      }
      studentResponsesBySection[sectionId].push(response);
    });

    // Transform section-wise analysis data
    // This should show current student's performance per section
    const sectionWiseData = examStructure.sections.map((section) => {
      const sectionResponses = studentResponsesBySection[section.sectionId] || [];
      const totalQuestions = section.questions.length;
      let correct = 0;
      let incorrect = 0;
      let unanswered = 0;
      let totalMarks = 0;

      section.questions.forEach((question) => {
        const response = sectionResponses.find((r) => r.questionId === question.questionId);
        if (!response || !response.studentAnswer) {
          unanswered++;
        } else if (response.isCorrect) {
          correct++;
          totalMarks += question.marks || 0;
        } else {
          incorrect++;
          // Apply negative marking if applicable
          totalMarks -= (question.marks || 0) / 3;
        }
      });

      const attempts = correct + incorrect;
      const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

      return {
        section: section.sectionName,
        correct,
        incorrect,
        unanswered,
        accuracy,
        marks: totalMarks,
        totalQuestions,
        attempts,
      };
    });

    // Calculate overall stats
    const overall = sectionWiseData.reduce(
      (acc, section) => ({
        correct: acc.correct + section.correct,
        incorrect: acc.incorrect + section.incorrect,
        unanswered: acc.unanswered + section.unanswered,
        marks: acc.marks + section.marks,
        totalQuestions: acc.totalQuestions + section.totalQuestions,
        attempts: acc.attempts + section.attempts,
      }),
      { correct: 0, incorrect: 0, unanswered: 0, marks: 0, totalQuestions: 0, attempts: 0 }
    );
    overall.accuracy = overall.attempts > 0 ? Math.round((overall.correct / overall.attempts) * 100) : 0;

    // Transform difficulty analysis data
    const difficultyData = examStructure.sections.map((section) => {
      const veryEasy = [];
      const easy = [];
      const medium = [];
      const difficult = [];
      const veryDifficult = [];

      section.questions.forEach((question, index) => {
        const questionNumber = index + 1;
        const stats = difficultyByQuestionId[question.questionId];
        
        if (stats) {
          // Map difficulty levels: API uses 'easy', 'medium', 'hard', 'very_hard'
          // UI expects: veryEasy, easy, medium, difficult, veryDifficult
          const difficulty = stats.difficulty || 'medium';
          
          if (difficulty === 'easy') {
            easy.push(questionNumber);
          } else if (difficulty === 'medium') {
            medium.push(questionNumber);
          } else if (difficulty === 'hard') {
            difficult.push(questionNumber);
          } else if (difficulty === 'very_hard') {
            veryDifficult.push(questionNumber);
          } else {
            // Default to medium if unknown
            medium.push(questionNumber);
          }
        } else {
          // If no stats, default to medium
          medium.push(questionNumber);
        }
      });

      return {
        section: section.sectionName,
        sectionId: section.sectionId,
        veryEasy,
        easy,
        medium,
        difficult,
        veryDifficult,
        totals: {
          veryEasy: veryEasy.length,
          easy: easy.length,
          medium: medium.length,
          difficult: difficult.length,
          veryDifficult: veryDifficult.length,
        },
      };
    });

    // Transform time analysis data
    const timeAnalysisData = [];
    examStructure.sections.forEach((section) => {
      section.questions.forEach((question, index) => {
        const response = questionResponses.find((r) => r.questionId === question.questionId);
        const stats = difficultyByQuestionId[question.questionId];
        
        // Calculate percentage of students who got it correct
        let percentCorrect = 0;
        if (stats && stats.correctCount !== undefined && stats.wrongCount !== undefined) {
          const total = stats.correctCount + stats.wrongCount;
          if (total > 0) {
            percentCorrect = (stats.correctCount / total) * 100;
          }
        }

        timeAnalysisData.push({
          no: timeAnalysisData.length + 1,
          questionId: question.questionId,
          question: question.text || `Question ${timeAnalysisData.length + 1}`, // Full question text with HTML
          time: response?.timeTaken || 0, // time in seconds
          percent: percentCorrect,
        });
      });
    });

    // Create a map of exam-question-answer by questionId for quick lookup
    const examAnswersByQuestionId = {};
    examQuestionAnswers.forEach((answer) => {
      examAnswersByQuestionId[answer.questionId] = answer;
    });

    // Create a map of StudentQuestionResponse by questionId for quick lookup (to get responseId and userReason)
    const questionResponsesByQuestionId = {};
    questionResponses.forEach((response) => {
      questionResponsesByQuestionId[response.questionId] = response;
    });

    // Transform answer sheet data
    // Approach: Show ALL questions from exam-section-question
    // Match with exam-question-answer to determine which are attempted and their status
    const answerSheetData = [];
    let questionNumber = 1;
    
    console.log('🔍 AnswerSheet transformation:', {
      examQuestionAnswersCount: examQuestionAnswers.length,
      examStructureSectionsCount: examStructure.sections.length,
      totalQuestionsInExam: examStructure.sections.reduce((sum, sec) => sum + sec.questions.length, 0),
    });
    
    examStructure.sections.forEach((section) => {
      section.questions.forEach((question) => {
        // Get exam-question-answer data for this question (if attempted)
        const examAnswer = examAnswersByQuestionId[question.questionId];
        const questionResponse = questionResponsesByQuestionId[question.questionId];
        const stats = difficultyByQuestionId[question.questionId];
        
        // Determine status based on examAnswer
        // If question was attempted, use exam-question-answer data
        // If not attempted, mark as unanswered
        let status = 'unanswered';
        let userAnswer = null;
        let correctAnswer = question.correctAnswer || null; // Default from exam structure
        let timeTaken = 0;
        let explanation = null;
        
        if (examAnswer) {
          // Question was attempted - use data from exam-question-answer
          userAnswer = examAnswer.studentAnswer || null;
          correctAnswer = examAnswer.answer || question.correctAnswer || null; // Use API's answer as primary
          timeTaken = examAnswer.time ? parseInt(examAnswer.time) || 0 : 0;
          explanation = examAnswer.explanation || null;
          
          // Check if student answered - handle null, undefined, and empty string
          const hasStudentAnswer = examAnswer.studentAnswer !== null && 
                                   examAnswer.studentAnswer !== undefined && 
                                   String(examAnswer.studentAnswer).trim() !== '';
          
          if (hasStudentAnswer) {
            // Student has answered - determine if correct or incorrect
            const isMCQ = question.options && question.options.length > 0;
            
            if (isMCQ) {
              // MCQ question - exact match comparison
              const studentAns = String(examAnswer.studentAnswer).trim().toUpperCase();
              const correctAns = correctAnswer ? String(correctAnswer).trim().toUpperCase() : '';
              status = correctAns && studentAns === correctAns ? 'correct' : 'incorrect';
            } else {
              // Descriptive/non-MCQ question - use .includes() for flexible matching
              const studentAns = String(examAnswer.studentAnswer).trim().toLowerCase();
              const correctAns = correctAnswer ? String(correctAnswer).trim().toLowerCase() : '';
              // Use includes for partial matching to avoid false positives
              if (correctAns && studentAns) {
                status = (studentAns.includes(correctAns) || correctAns.includes(studentAns)) 
                  ? 'correct' 
                  : 'incorrect';
              } else {
                status = 'answered'; // Answered but can't determine correctness
              }
            }
          } else {
            // Attempted but no answer provided
            status = 'unanswered';
          }
        }
        
        answerSheetData.push({
          id: question.questionId,
          number: questionNumber++,
          questionId: question.questionId,
          sectionId: section.sectionId,
          section: section.sectionName.toLowerCase().replace(/\s+/g, '-'),
          sectionName: section.sectionName,
          type: question.options && question.options.length > 0 ? 'mcq' : 'descriptive',
          difficulty: stats?.difficulty || 'medium',
          timeTaken: timeTaken, // From exam-question-answer if attempted, else 0
          accuracy: 0, // Needs to be calculated from stats or other source
          question: question.text, // From exam-section-question
          options: question.options || [], // From exam-section-question
          passage: question.passage || null, // From exam-section-question
          userAnswer: userAnswer, // From exam-question-answer if attempted, else null
          correctAnswer: correctAnswer, // From exam-question-answer (preferred) or exam structure
          status: status, // Calculated from exam-question-answer if attempted, else 'unanswered'
          explanation: explanation, // From exam-question-answer if attempted, else null
          responseId: questionResponse?.id || null, // StudentQuestionResponse ID for updating userReason
          userReason: questionResponse?.userReason || 'none', // Current userReason from StudentQuestionResponse
        });
      });
    });

    // Transform toppers data
    const toppersData = examResults
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map((result, index) => ({
        rank: index + 1,
        name: result.Student?.name || 'Unknown',
        verbal: result.verbalScore || 0,
        data: result.dilrScore || 0,
        quant: result.qaScore || 0,
        total: result.score || 0,
      }));

    return {
      sectionWise: {
        sections: sectionWiseData,
        overall,
      },
      difficulty: difficultyData,
      timeAnalysis: timeAnalysisData,
      answerSheet: answerSheetData,
      toppers: toppersData,
      examStructure,
      isLoading,
      error,
    };
  }, [
    examData,
    examResultsData,
    responsesData,
    difficultyStatsData,
    examQuestionAnswersData,
    examStructure,
    isLoadingExam,
    isLoadingResults,
    isLoadingResponses,
    isLoadingDifficulty,
    isLoadingExamAnswers,
    examError,
    resultsError,
    responsesError,
    difficultyError,
    examAnswersError,
  ]);

  return {
    examId,
    ...analyticsData,
  };
}


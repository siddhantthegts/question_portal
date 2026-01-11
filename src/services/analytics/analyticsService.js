/**
 * Analytics Service - High-level service layer
 * Integrates all analytics APIs to provide comprehensive analytics functionality
 * This service handles the business logic for analytics operations
 */

import {
  createQuestionDifficultyStats,
  incrementQuestionDifficultyStats,
  getQuestionDifficultyStatsById,
} from './questionDifficultyStatsApi';

import {
  createStudentExamResult,
  getStudentExamResultsByExam,
} from './studentExamResultApi';

import {
  createStudentQuestionResponse,
  getStudentQuestionResponsesByExam,
  getStudentQuestionResponsesByStudent,
} from './studentQuestionResponseApi';

/**
 * Submit exam analytics - Records complete exam performance
 * @param {Object} examData - Exam submission data
 * @param {number} examData.studentId - Student ID
 * @param {number} examData.examId - Exam ID
 * @param {number} examData.score - Total score
 * @param {number} examData.totalTime - Total time taken in seconds
 * @param {Array} examData.responses - Array of question responses
 * @param {Object} examData.responses[].sectionId - Section ID
 * @param {Object} examData.responses[].questionId - Question ID
 * @param {boolean} examData.responses[].isCorrect - Whether answer is correct
 * @param {number} examData.responses[].timeTaken - Time taken in seconds
 * @param {string} examData.responses[].userReason - User reason (optional)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} Result object with exam result and question responses
 */
export const submitExamAnalytics = async (examData, headers = {}) => {
  try {
    // 1. Create student exam result (automatically calculates percentile)
    const examResultResponse = await createStudentExamResult({
      studentId: examData.studentId,
      examId: examData.examId,
      score: examData.score,
      totalTime: examData.totalTime,
    }, headers);

    const examResult = examResultResponse.data;

    // 2. Create question responses and update difficulty stats
    const questionResponses = [];
    const difficultyStatsUpdates = {};

    for (const response of examData.responses) {
      // Create question response
      const responseData = await createStudentQuestionResponse({
        studentId: examData.studentId,
        examId: examData.examId,
        sectionId: response.sectionId,
        questionId: response.questionId,
        isCorrect: response.isCorrect,
        timeTaken: response.timeTaken,
        userReason: response.userReason || 'none',
      }, headers);

      questionResponses.push(responseData.data);

      // Track difficulty stats updates
      if (!difficultyStatsUpdates[response.questionId]) {
        difficultyStatsUpdates[response.questionId] = {
          correctCount: 0,
          wrongCount: 0,
        };
      }

      if (response.isCorrect) {
        difficultyStatsUpdates[response.questionId].correctCount++;
      } else {
        difficultyStatsUpdates[response.questionId].wrongCount++;
      }
    }

    // 3. Update question difficulty stats
    const statsPromises = Object.entries(difficultyStatsUpdates).map(
      ([questionId, counts]) => {
        return incrementQuestionDifficultyStats(
          parseInt(questionId),
          {
            type: counts.correctCount > 0 ? 'correct' : 'wrong',
            amount: counts.correctCount > 0 ? counts.correctCount : counts.wrongCount,
          },
          headers
        ).catch((error) => {
          // If increment fails, try to create/update stats
          return createQuestionDifficultyStats({
            questionId: parseInt(questionId),
            correctCount: counts.correctCount,
            wrongCount: counts.wrongCount,
            difficulty: 'medium', // Default, can be calculated later
          }, headers);
        });
      }
    );

    await Promise.allSettled(statsPromises);

    return {
      success: true,
      examResult,
      questionResponses,
      message: 'Exam analytics submitted successfully',
    };
  } catch (error) {
    console.error('Error submitting exam analytics:', error);
    throw error;
  }
};

/**
 * Get comprehensive exam analytics
 * @param {Object} params - Query parameters
 * @param {number} params.examId - Exam ID (required)
 * @param {number} params.studentId - Student ID (optional)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} Comprehensive analytics data
 */
export const getExamAnalytics = async (params, headers = {}) => {
  try {
    const { examId, studentId } = params;

    // Fetch exam results
    const examResultsParams = { examId };
    if (studentId) examResultsParams.studentId = studentId;

    const examResultsResponse = await getStudentExamResultsByExam(examId, examResultsParams, headers);
    const examResults = examResultsResponse.data || [];

    // Fetch question responses
    const responsesParams = { examId };
    if (studentId) responsesParams.studentId = studentId;

    const responsesResponse = await getStudentQuestionResponsesByExam(examId, responsesParams, headers);
    const questionResponses = responsesResponse.data || [];

    return {
      success: true,
      examResults,
      questionResponses,
      totalStudents: examResults.length,
      totalResponses: questionResponses.length,
    };
  } catch (error) {
    console.error('Error fetching exam analytics:', error);
    throw error;
  }
};

/**
 * Get student performance analytics
 * @param {Object} params - Query parameters
 * @param {number} params.studentId - Student ID (required)
 * @param {number} params.examId - Exam ID (optional)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} Student performance analytics
 */
export const getStudentAnalytics = async (params, headers = {}) => {
  try {
    const { studentId, examId } = params;

    const responsesParams = examId ? { examId } : {};
    const responsesResponse = await getStudentQuestionResponsesByStudent(studentId, responsesParams, headers);
    const questionResponses = responsesResponse.data || [];

    // Calculate statistics
    const totalQuestions = questionResponses.length;
    const correctAnswers = questionResponses.filter(r => r.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Calculate average time per question
    const totalTime = questionResponses.reduce((sum, r) => sum + (r.timeTaken || 0), 0);
    const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

    // Group by section
    const sectionStats = {};
    questionResponses.forEach(response => {
      const sectionId = response.sectionId;
      if (!sectionStats[sectionId]) {
        sectionStats[sectionId] = {
          sectionId,
          sectionName: response.Section?.sectionName || 'Unknown',
          total: 0,
          correct: 0,
          wrong: 0,
          totalTime: 0,
        };
      }
      sectionStats[sectionId].total++;
      if (response.isCorrect) {
        sectionStats[sectionId].correct++;
      } else {
        sectionStats[sectionId].wrong++;
      }
      sectionStats[sectionId].totalTime += response.timeTaken || 0;
    });

    return {
      success: true,
      studentId,
      examId,
      statistics: {
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        accuracy: parseFloat(accuracy.toFixed(2)),
        avgTimePerQuestion: parseFloat(avgTimePerQuestion.toFixed(2)),
      },
      sectionStats: Object.values(sectionStats),
      questionResponses,
    };
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    throw error;
  }
};

/**
 * Update question difficulty based on responses
 * This can be called periodically to recalculate difficulty levels
 * @param {number} questionId - Question ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} Updated difficulty stats
 */
export const updateQuestionDifficulty = async (questionId, headers = {}) => {
  try {
    // Get current stats
    const statsResponse = await getQuestionDifficultyStatsById(questionId, headers);
    const stats = statsResponse.data;

    if (!stats) {
      throw new Error('Question difficulty stats not found');
    }

    const totalAttempts = stats.correctCount + stats.wrongCount;
    if (totalAttempts === 0) {
      return { success: true, stats, message: 'No attempts yet, difficulty unchanged' };
    }

    // Calculate difficulty based on accuracy
    const accuracy = stats.correctCount / totalAttempts;
    let difficulty = 'medium';

    if (accuracy >= 0.7) {
      difficulty = 'easy';
    } else if (accuracy >= 0.4) {
      difficulty = 'medium';
    } else if (accuracy >= 0.2) {
      difficulty = 'hard';
    } else {
      difficulty = 'very_hard';
    }

    // Update difficulty if changed
    if (stats.difficulty !== difficulty) {
      await createQuestionDifficultyStats({
        questionId,
        correctCount: stats.correctCount,
        wrongCount: stats.wrongCount,
        difficulty,
      }, headers);
    }

    return {
      success: true,
      stats: { ...stats, difficulty },
      message: 'Question difficulty updated successfully',
    };
  } catch (error) {
    console.error('Error updating question difficulty:', error);
    throw error;
  }
};


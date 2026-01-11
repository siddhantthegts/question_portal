/**
 * Student Question Response API Service
 * Handles all API calls related to student question responses
 * Base URL: https://catmock.com/api
 */

const BASE_URL = 'https://catmock.com/api';

/**
 * Create student question response
 * @param {Object} data - Question response data
 * @param {number} data.studentId - Student ID (required)
 * @param {number} data.examId - Exam ID (required)
 * @param {number} data.sectionId - Section ID (required)
 * @param {number} data.questionId - Question ID (required)
 * @param {boolean} data.isCorrect - Whether answer is correct (required)
 * @param {number} data.timeTaken - Time taken in seconds (required)
 * @param {string} data.userReason - User reason: 'guess', 'misjudged', 'misread', 'none' (optional, default: 'none')
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const createStudentQuestionResponse = async (data, headers = {}) => {
  const response = await fetch(`${BASE_URL}/create/student-question-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      studentId: parseInt(data.studentId),
      examId: parseInt(data.examId),
      sectionId: parseInt(data.sectionId),
      questionId: parseInt(data.questionId),
      isCorrect: data.isCorrect === true || data.isCorrect === 'true',
      timeTaken: parseInt(data.timeTaken),
      userReason: data.userReason || 'none',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create student question response');
  }

  return response.json();
};

/**
 * Get all student question responses with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.studentId - Filter by student ID (optional)
 * @param {number} params.examId - Filter by exam ID (optional)
 * @param {number} params.questionId - Filter by question ID (optional)
 * @param {number} params.sectionId - Filter by section ID (optional)
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentQuestionResponses = async (params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId.toString());
  if (params.examId) queryParams.append('examId', params.examId.toString());
  if (params.questionId) queryParams.append('questionId', params.questionId.toString());
  if (params.sectionId) queryParams.append('sectionId', params.sectionId.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/student-question-response${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student question responses');
  }

  return response.json();
};

/**
 * Get student question response by ID
 * @param {number} id - Question response ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentQuestionResponseById = async (id, headers = {}) => {
  const response = await fetch(`${BASE_URL}/read/student-question-response/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student question response');
  }

  return response.json();
};

/**
 * Get student question responses by student ID
 * @param {number} studentId - Student ID
 * @param {Object} params - Query parameters
 * @param {number} params.examId - Filter by exam ID (optional)
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentQuestionResponsesByStudent = async (studentId, params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.examId) queryParams.append('examId', params.examId.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/student-question-response/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student question responses');
  }

  return response.json();
};

/**
 * Get student question responses by exam ID
 * @param {number} examId - Exam ID
 * @param {Object} params - Query parameters
 * @param {number} params.studentId - Filter by student ID (optional)
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentQuestionResponsesByExam = async (examId, params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/student-question-response/exam/${examId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student question responses');
  }

  return response.json();
};

/**
 * Update student question response
 * @param {number} id - Question response ID
 * @param {Object} data - Update data
 * @param {boolean} data.isCorrect - Whether answer is correct (optional)
 * @param {number} data.timeTaken - Time taken in seconds (optional)
 * @param {string} data.userReason - User reason: 'guess', 'misjudged', 'misread', 'none' (optional)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const updateStudentQuestionResponse = async (id, data, headers = {}) => {
  const response = await fetch(`${BASE_URL}/update/student-question-response/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      ...(data.isCorrect !== undefined && { isCorrect: data.isCorrect === true || data.isCorrect === 'true' }),
      ...(data.timeTaken !== undefined && { timeTaken: parseInt(data.timeTaken) }),
      ...(data.userReason !== undefined && { userReason: data.userReason }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update student question response');
  }

  return response.json();
};

/**
 * Delete student question response
 * @param {number} id - Question response ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const deleteStudentQuestionResponse = async (id, headers = {}) => {
  const response = await fetch(`${BASE_URL}/delete/student-question-response/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete student question response');
  }

  return response.json();
};


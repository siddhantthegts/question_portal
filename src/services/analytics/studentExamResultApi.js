/**
 * Student Exam Result API Service
 * Handles all API calls related to student exam results
 * Base URL: https://catmock.com/api
 */

const BASE_URL = 'https://catmock.com/api';

/**
 * Create student exam result (automatically calculates percentile)
 * @param {Object} data - Exam result data
 * @param {number} data.studentId - Student ID (required)
 * @param {number} data.examId - Exam ID (required)
 * @param {number} data.score - Score (required)
 * @param {number} data.totalTime - Total time taken in seconds (optional)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const createStudentExamResult = async (data, headers = {}) => {
  const response = await fetch(`${BASE_URL}/create/student-exam-result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      studentId: parseInt(data.studentId),
      examId: parseInt(data.examId),
      score: parseFloat(data.score),
      totalTime: data.totalTime ? parseInt(data.totalTime) : null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create student exam result');
  }

  return response.json();
};

/**
 * Get all student exam results with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.studentId - Filter by student ID (optional)
 * @param {number} params.examId - Filter by exam ID (optional)
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentExamResults = async (params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId.toString());
  if (params.examId) queryParams.append('examId', params.examId.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/student-exam-result${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student exam results');
  }

  return response.json();
};

/**
 * Get student exam result by ID
 * @param {number} id - Exam result ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentExamResultById = async (id, headers = {}) => {
  const response = await fetch(`${BASE_URL}/read/student-exam-result/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student exam result');
  }

  return response.json();
};

/**
 * Get student exam results by student ID
 * @param {number} studentId - Student ID
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentExamResultsByStudent = async (studentId, params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/student-exam-result/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student exam results');
  }

  return response.json();
};

/**
 * Get student exam results by exam ID
 * @param {number} examId - Exam ID
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getStudentExamResultsByExam = async (examId, params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/student-exam-result/exam/${examId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student exam results');
  }

  return response.json();
};

/**
 * Update student exam result
 * @param {number} id - Exam result ID
 * @param {Object} data - Update data
 * @param {number} data.score - Score (optional)
 * @param {number} data.totalTime - Total time taken in seconds (optional)
 * @param {number} data.examId - Exam ID (required if updating)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const updateStudentExamResult = async (id, data, headers = {}) => {
  const response = await fetch(`${BASE_URL}/update/student-exam-result/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      ...(data.score !== undefined && { score: parseFloat(data.score) }),
      ...(data.totalTime !== undefined && { totalTime: data.totalTime ? parseInt(data.totalTime) : null }),
      examId: parseInt(data.examId), // Required
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update student exam result');
  }

  return response.json();
};

/**
 * Recalculate percentiles for all students in an exam
 * @param {number} examId - Exam ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const recalculateExamPercentiles = async (examId, headers = {}) => {
  const response = await fetch(`${BASE_URL}/update/recalculate-exam-percentiles/${examId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to recalculate exam percentiles');
  }

  return response.json();
};

/**
 * Delete student exam result
 * @param {number} id - Exam result ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const deleteStudentExamResult = async (id, headers = {}) => {
  const response = await fetch(`${BASE_URL}/delete/student-exam-result/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete student exam result');
  }

  return response.json();
};


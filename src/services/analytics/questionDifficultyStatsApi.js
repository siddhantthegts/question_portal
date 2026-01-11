/**
 * Question Difficulty Stats API Service
 * Handles all API calls related to question difficulty statistics
 * Base URL: https://catmock.com/api
 */

const BASE_URL = 'https://catmock.com/api';

/**
 * Create or update question difficulty stats
 * @param {Object} data - Stats data
 * @param {number} data.questionId - Question ID (required)
 * @param {number} data.correctCount - Number of correct answers (optional, default: 0)
 * @param {number} data.wrongCount - Number of wrong answers (optional, default: 0)
 * @param {string} data.difficulty - Difficulty level: 'easy', 'medium', 'hard', 'very_hard' (optional, default: 'medium')
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const createQuestionDifficultyStats = async (data, headers = {}) => {
  const response = await fetch(`${BASE_URL}/create/question-difficulty-stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      questionId: parseInt(data.questionId),
      correctCount: data.correctCount !== undefined ? parseInt(data.correctCount) : 0,
      wrongCount: data.wrongCount !== undefined ? parseInt(data.wrongCount) : 0,
      difficulty: data.difficulty || 'medium',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create question difficulty stats');
  }

  return response.json();
};

/**
 * Get all question difficulty stats with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.difficulty - Filter by difficulty level (optional)
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getQuestionDifficultyStats = async (params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/question-difficulty-stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch question difficulty stats');
  }

  return response.json();
};

/**
 * Get question difficulty stats by question ID
 * @param {number} questionId - Question ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getQuestionDifficultyStatsById = async (questionId, headers = {}) => {
  const response = await fetch(`${BASE_URL}/read/question-difficulty-stats/${questionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch question difficulty stats');
  }

  return response.json();
};

/**
 * Get question difficulty stats by difficulty level
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', 'hard', 'very_hard'
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Limit results (optional, default: 50)
 * @param {number} params.offset - Offset for pagination (optional, default: 0)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const getQuestionDifficultyStatsByDifficulty = async (difficulty, params = {}, headers = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const url = `${BASE_URL}/read/question-difficulty-stats/difficulty/${difficulty}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch question difficulty stats');
  }

  return response.json();
};

/**
 * Update question difficulty stats
 * @param {number} questionId - Question ID
 * @param {Object} data - Update data
 * @param {number} data.correctCount - Number of correct answers (optional)
 * @param {number} data.wrongCount - Number of wrong answers (optional)
 * @param {string} data.difficulty - Difficulty level (optional)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const updateQuestionDifficultyStats = async (questionId, data, headers = {}) => {
  const response = await fetch(`${BASE_URL}/update/question-difficulty-stats/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      ...(data.correctCount !== undefined && { correctCount: parseInt(data.correctCount) }),
      ...(data.wrongCount !== undefined && { wrongCount: parseInt(data.wrongCount) }),
      ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update question difficulty stats');
  }

  return response.json();
};

/**
 * Increment correct or wrong count for a question
 * @param {number} questionId - Question ID
 * @param {Object} data - Increment data
 * @param {string} data.type - Type: 'correct' or 'wrong' (required)
 * @param {number} data.amount - Amount to increment (optional, default: 1)
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const incrementQuestionDifficultyStats = async (questionId, data, headers = {}) => {
  const response = await fetch(`${BASE_URL}/update/question-difficulty-stats/${questionId}/increment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      type: data.type, // 'correct' or 'wrong'
      amount: data.amount !== undefined ? parseInt(data.amount) : 1,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to increment question difficulty stats');
  }

  return response.json();
};

/**
 * Delete question difficulty stats
 * @param {number} questionId - Question ID
 * @param {Object} headers - Request headers (optional)
 * @returns {Promise} API response
 */
export const deleteQuestionDifficultyStats = async (questionId, headers = {}) => {
  const response = await fetch(`${BASE_URL}/delete/question-difficulty-stats/${questionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete question difficulty stats');
  }

  return response.json();
};


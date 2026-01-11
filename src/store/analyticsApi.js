/**
 * Analytics API - RTK Query endpoints
 * Handles all analytics-related API calls using RTK Query
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://catmock.com/api'
  }),
  tagTypes: ['QuestionDifficultyStats', 'StudentExamResult', 'StudentQuestionResponse'],
  endpoints: (build) => ({
    // Question Difficulty Stats Endpoints
    createQuestionDifficultyStats: build.mutation({
      query: ({ data, headers }) => ({
        url: '/create/question-difficulty-stats',
        method: 'POST',
        body: data,
        headers
      }),
      invalidatesTags: ['QuestionDifficultyStats']
    }),

    getQuestionDifficultyStats: build.query({
      query: ({ params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/question-difficulty-stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: ['QuestionDifficultyStats']
    }),

    getQuestionDifficultyStatsById: build.query({
      query: ({ questionId, headers }) => ({
        url: `/read/question-difficulty-stats/${questionId}`,
        method: 'GET',
        headers
      }),
      providesTags: (result, error, { questionId }) => [{ type: 'QuestionDifficultyStats', id: questionId }]
    }),

    getQuestionDifficultyStatsByDifficulty: build.query({
      query: ({ difficulty, params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/question-difficulty-stats/difficulty/${difficulty}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: (result, error, { difficulty }) => [{ type: 'QuestionDifficultyStats', difficulty }]
    }),

    updateQuestionDifficultyStats: build.mutation({
      query: ({ questionId, data, headers }) => ({
        url: `/update/question-difficulty-stats/${questionId}`,
        method: 'PUT',
        body: data,
        headers
      }),
      invalidatesTags: (result, error, { questionId }) => [{ type: 'QuestionDifficultyStats', id: questionId }]
    }),

    incrementQuestionDifficultyStats: build.mutation({
      query: ({ questionId, data, headers }) => ({
        url: `/update/question-difficulty-stats/${questionId}/increment`,
        method: 'PATCH',
        body: data,
        headers
      }),
      invalidatesTags: (result, error, { questionId }) => [{ type: 'QuestionDifficultyStats', id: questionId }]
    }),

    deleteQuestionDifficultyStats: build.mutation({
      query: ({ questionId, headers }) => ({
        url: `/delete/question-difficulty-stats/${questionId}`,
        method: 'DELETE',
        headers
      }),
      invalidatesTags: ['QuestionDifficultyStats']
    }),

    // Student Exam Result Endpoints
    createStudentExamResult: build.mutation({
      query: ({ data, headers }) => ({
        url: '/create/student-exam-result',
        method: 'POST',
        body: data,
        headers
      }),
      invalidatesTags: ['StudentExamResult']
    }),

    getStudentExamResults: build.query({
      query: ({ params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.studentId) queryParams.append('studentId', params.studentId.toString());
        if (params.examId) queryParams.append('examId', params.examId.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/student-exam-result${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: ['StudentExamResult']
    }),

    getStudentExamResultById: build.query({
      query: ({ id, headers }) => ({
        url: `/read/student-exam-result/${id}`,
        method: 'GET',
        headers
      }),
      providesTags: (result, error, { id }) => [{ type: 'StudentExamResult', id }]
    }),

    getStudentExamResultsByStudent: build.query({
      query: ({ studentId, params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/student-exam-result/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: (result, error, { studentId }) => [{ type: 'StudentExamResult', studentId }]
    }),

    getStudentExamResultsByExam: build.query({
      query: ({ examId, params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/student-exam-result/exam/${examId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: (result, error, { examId }) => [{ type: 'StudentExamResult', examId }]
    }),

    updateStudentExamResult: build.mutation({
      query: ({ id, data, headers }) => ({
        url: `/update/student-exam-result/${id}`,
        method: 'PUT',
        body: data,
        headers
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'StudentExamResult', id }]
    }),

    recalculateExamPercentiles: build.mutation({
      query: ({ examId, headers }) => ({
        url: `/update/recalculate-exam-percentiles/${examId}`,
        method: 'POST',
        headers
      }),
      invalidatesTags: (result, error, { examId }) => [{ type: 'StudentExamResult', examId }]
    }),

    deleteStudentExamResult: build.mutation({
      query: ({ id, headers }) => ({
        url: `/delete/student-exam-result/${id}`,
        method: 'DELETE',
        headers
      }),
      invalidatesTags: ['StudentExamResult']
    }),

    // Student Question Response Endpoints
    createStudentQuestionResponse: build.mutation({
      query: ({ data, headers }) => ({
        url: '/create/student-question-response',
        method: 'POST',
        body: data,
        headers
      }),
      invalidatesTags: ['StudentQuestionResponse']
    }),

    getStudentQuestionResponses: build.query({
      query: ({ params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.studentId) queryParams.append('studentId', params.studentId.toString());
        if (params.examId) queryParams.append('examId', params.examId.toString());
        if (params.questionId) queryParams.append('questionId', params.questionId.toString());
        if (params.sectionId) queryParams.append('sectionId', params.sectionId.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/student-question-response${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: ['StudentQuestionResponse']
    }),

    getStudentQuestionResponseById: build.query({
      query: ({ id, headers }) => ({
        url: `/read/student-question-response/${id}`,
        method: 'GET',
        headers
      }),
      providesTags: (result, error, { id }) => [{ type: 'StudentQuestionResponse', id }]
    }),

    getStudentQuestionResponsesByStudent: build.query({
      query: ({ studentId, params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.examId) queryParams.append('examId', params.examId.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/student-question-response/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: (result, error, { studentId }) => [{ type: 'StudentQuestionResponse', studentId }]
    }),

    getStudentQuestionResponsesByExam: build.query({
      query: ({ examId, params = {}, headers }) => {
        const queryParams = new URLSearchParams();
        if (params.studentId) queryParams.append('studentId', params.studentId.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        
        return {
          url: `/read/student-question-response/exam/${examId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
          headers
        };
      },
      providesTags: (result, error, { examId }) => [{ type: 'StudentQuestionResponse', examId }]
    }),

    updateStudentQuestionResponse: build.mutation({
      query: ({ id, data, headers }) => ({
        url: `/update/student-question-response/${id}`,
        method: 'PUT',
        body: data,
        headers
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'StudentQuestionResponse', id }]
    }),

    deleteStudentQuestionResponse: build.mutation({
      query: ({ id, headers }) => ({
        url: `/delete/student-question-response/${id}`,
        method: 'DELETE',
        headers
      }),
      invalidatesTags: ['StudentQuestionResponse']
    }),
  }),
  keepUnusedDataFor: 300
});

// Export hooks
export const {
  // Question Difficulty Stats
  useCreateQuestionDifficultyStatsMutation,
  useGetQuestionDifficultyStatsQuery,
  useGetQuestionDifficultyStatsByIdQuery,
  useGetQuestionDifficultyStatsByDifficultyQuery,
  useUpdateQuestionDifficultyStatsMutation,
  useIncrementQuestionDifficultyStatsMutation,
  useDeleteQuestionDifficultyStatsMutation,
  
  // Student Exam Result
  useCreateStudentExamResultMutation,
  useGetStudentExamResultsQuery,
  useGetStudentExamResultByIdQuery,
  useGetStudentExamResultsByStudentQuery,
  useGetStudentExamResultsByExamQuery,
  useUpdateStudentExamResultMutation,
  useRecalculateExamPercentilesMutation,
  useDeleteStudentExamResultMutation,
  
  // Student Question Response
  useCreateStudentQuestionResponseMutation,
  useGetStudentQuestionResponsesQuery,
  useGetStudentQuestionResponseByIdQuery,
  useGetStudentQuestionResponsesByStudentQuery,
  useGetStudentQuestionResponsesByExamQuery,
  useUpdateStudentQuestionResponseMutation,
  useDeleteStudentQuestionResponseMutation,
} = analyticsApi;


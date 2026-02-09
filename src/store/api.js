import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://catmock.com/panel'
    }),
    endpoints: (build) => ({
        getExam: build.query({
            query: ({ url, data,headers }) => {
                return {
                    url: `/retrieve/${url}`,
                    method: 'GET',
                    params: data,
                    headers
                }
            },
            transformResponse: (res) => {
                console.log("response from backend", res)
                return res;
            }
        }),
        answerQuestion: build.mutation({
            query: ({ data, headers }) => {
                const hasRequired = data.questionId && data.sectionId && data.studentAnswer !== undefined && data.time !== undefined;
                if (!hasRequired) {
                    console.error("Missing required fields for answer: questionId, sectionId, studentAnswer, time", data);
                    return;
                }
                return {
                    url: `/create/exam-question-answer`,
                    method: 'POST',
                    body: data,
                    headers
                }
            },
            transformResponse: (res) => {
                console.log("response from backend for question answer", res)
                return res;
            },
        }),
        updateExamDuration: build.mutation({
            query: ({ data, headers }) => ({
                url: `/create/exam-question-answer/update-duration`,
                method: 'POST',
                body: data,
                headers
            }),
            transformResponse: (res) => res,
        }),
        setSectionOrder: build.mutation({
            query: ({ data, headers }) => ({
                url: `/create/exam-question-answer/set-section-order`,
                method: 'POST',
                body: data,
                headers
            }),
            transformResponse: (res) => res,
        }),
        getExamQuestionAnswers: build.query({
            query: ({ attemptId, headers }) => {
                return {
                    url: `/retrieve/exam-question-answer/${attemptId}`,
                    method: 'GET',
                    headers
                }
            },
            transformResponse: (res) => {
                console.log("response from backend for exam question answers", res)
                return res;
            },
        }),
    }),
    keepUnusedDataFor: 300
})

export const { useGetExamQuery, useAnswerQuestionMutation, useUpdateExamDurationMutation, useSetSectionOrderMutation, useGetExamQuestionAnswersQuery } = api;

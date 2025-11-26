import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://catmock.com/panel',
        prepareHeaders: (headers) => {
            return headers
        }
    }),
    endpoints: (build) => ({
        getExam: build.query({
            query: ({ url, data, headers }) => {
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
        answerQuestion: build.query({
            query: ({ url, data, headers }) => {

                if (data.questionId || data.sectionId || data.studentAnswer || data.time === undefined) {
                    console.error("Missing required fields in data for answering question");
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
    }),
    keepUnusedDataFor: 300
})

export const { useGetExamQuery, useAnswerQuestionQuery } = api;

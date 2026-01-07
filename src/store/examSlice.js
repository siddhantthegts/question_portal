import { createSlice } from '@reduxjs/toolkit';

const examSlice = createSlice({
  name: 'test',
  initialState: {
    answers: {}, // key: questionId, value: selectedOptionIndex
    startTimes: {}, // key: questionId, value: timestamp
    resumeExamData: null, // Previously answered questions grouped by sectionId
    lastResponse: null, // Last question position { sectionId, questionId, time }
    candidateResponse: {}, // Response object: sectionId -> questionId -> question state
    examAttendId: null, // Exam attempt ID
  },
  reducers: {
    startQuestion: (state, action) => {
      const id = action.payload;
      state.startTimes[id] = Date.now();
    },
    answerQuestion: (state, action) => {
      const { id, optionIndex, descriptiveText } = action.payload;
       if (!state.answers[id]) state.answers[id] = {};
      if (optionIndex !== undefined) {
        state.answers[id].optionIndex = optionIndex;
      }
      if (descriptiveText !== undefined) {
        state.answers[id].descriptiveText = descriptiveText;
      }
      state.answers[id].timeTaken =  Date.now() - state.startTimes[id];
    },
    setResumeData: (state, action) => {
      const { resumeExamData, lastResponse, examAttendId } = action.payload;
      state.resumeExamData = resumeExamData;
      state.lastResponse = lastResponse;
      state.examAttendId = examAttendId;
    },
    setCandidateResponse: (state, action) => {
      state.candidateResponse = action.payload;
    },
    restoreAnswer: (state, action) => {
      const { questionId, studentAnswer, questionType } = action.payload;
      if (!state.answers[questionId]) {
        state.answers[questionId] = {};
      }
      
      // Convert studentAnswer to appropriate format
      if (questionType === 'MCQ') {
        // Convert letter answer (A, B, C, etc.) to optionIndex (0, 1, 2, etc.)
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const optionIndex = letters.indexOf(studentAnswer);
        if (optionIndex !== -1) {
          state.answers[questionId].optionIndex = optionIndex;
        }
      } else {
        // Descriptive answer
        state.answers[questionId].descriptiveText = studentAnswer;
      }
      
      // Mark as visited and answered
      state.startTimes[questionId] = Date.now();
    },
    clearAnswer: (state, action) => {
      const questionId = action.payload;
      if (state.answers[questionId]) {
        // Calculate and update timeTaken before clearing (clearing is also part of answering process)
        if (state.startTimes[questionId]) {
          state.answers[questionId].timeTaken = Date.now() - state.startTimes[questionId];
        }
        
        // Remove the answer values but keep the object structure and timeTaken
        delete state.answers[questionId].optionIndex;
        delete state.answers[questionId].descriptiveText;
        // timeTaken is kept - clearing is counted as time spent on question
      }
    },
    resetTest: () => ({ 
      answers: {}, 
      startTimes: {},
      resumeExamData: null,
      lastResponse: null,
      candidateResponse: {},
      examAttendId: null,
    }),
  },
});

export const { startQuestion, answerQuestion, setResumeData, setCandidateResponse, restoreAnswer, clearAnswer, resetTest } = examSlice.actions;
export default examSlice.reducer;

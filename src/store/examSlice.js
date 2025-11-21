import { createSlice } from '@reduxjs/toolkit';

const examSlice = createSlice({
  name: 'test',
  initialState: {
    answers: {}, // key: questionId, value: selectedOptionIndex
    startTimes: {}, // key: questionId, value: timestamp
  },
  reducers: {
    startQuestion: (state, action) => {
      const id = action.payload;
      state.startTimes[id] = Date.now();
    },
    answerQuestion: (state, action) => {
      const { id, optionIndex } = action.payload;
      state.answers[id] = {
        optionIndex,
        timeTaken: Date.now() - state.startTimes[id],
      };
    },
    resetTest: () => ({ answers: {}, startTimes: {} }),
  },
});

export const { startQuestion, answerQuestion, resetTest } = examSlice.actions;
export default examSlice.reducer;

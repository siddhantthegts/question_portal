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
    resetTest: () => ({ answers: {}, startTimes: {} }),
  },
});

export const { startQuestion, answerQuestion, resetTest } = examSlice.actions;
export default examSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: "", 
};

const keyboardSlice = createSlice({
  name: "keyboard",
  initialState,
  reducers: {
    setKeyboardValue: (state, action) => {
      state.value = action.payload;
    },
    appendKeyboardValue: (state, action) => {
      state.value += action.payload;
    },
    deleteLastCharacter: (state) => {
      state.value = state.value.slice(0, -1);
    },
    resetKeyboard: (state) => {
      state.value = "";
    },
  },
});

export const {
  setKeyboardValue,
  appendKeyboardValue,
  deleteLastCharacter,
  resetKeyboard,
} = keyboardSlice.actions;

export default keyboardSlice.reducer;
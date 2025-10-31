import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import testReducer from './testSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    test: testReducer,
  },
});

export default store;

import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import testReducer from './testSlice';
import { api } from './api';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    test: testReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)

});

export default store;

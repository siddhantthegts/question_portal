import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import examReducer from './examSlice';
import { api } from './api';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    test: examReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)

});

export default store;

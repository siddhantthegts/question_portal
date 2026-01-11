import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import examReducer from './examSlice';
import keyboardReducer from './keyboardSlice'
import { api } from './api';
import { analyticsApi } from './analyticsApi';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    test: examReducer,
    keyboard: keyboardReducer,
    [api.reducerPath]: api.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, analyticsApi.middleware)

});

export default store;

import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import examReducer from './examSlice';
import keyboardReducer from './keyboardSlice'
import { api } from './api';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    test: examReducer,
    keyboard: keyboardReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)

});

export default store;

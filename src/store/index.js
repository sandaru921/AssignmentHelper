import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import booksReducer from './booksSlice';
import favoritesReducer from './favoritesSlice';
import assignmentsReducer from './assignmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    favorites: favoritesReducer,
    assignments: assignmentsReducer,
  },
});
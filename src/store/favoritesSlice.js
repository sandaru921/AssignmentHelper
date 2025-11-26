import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { favorites: [] },
  reducers: {
    addFavorite: (state, action) => {
      if (!state.favorites.find(f => f.key === action.payload.key)) {
        state.favorites.push(action.payload);
        AsyncStorage.setItem('favorites', JSON.stringify(state.favorites));
      }
    },
    saveFavorite: (state, action) => {
      // Alias for addFavorite to match usage in Details screen
      if (!state.favorites.find(f => f.key === action.payload.key)) {
        state.favorites.push(action.payload);
        AsyncStorage.setItem('favorites', JSON.stringify(state.favorites));
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(f => f.key !== action.payload);
      AsyncStorage.setItem('favorites', JSON.stringify(state.favorites));
    },
    loadFavorites: (state, action) => {
      state.favorites = action.payload;
    },
  },
});

export const { addFavorite, saveFavorite, removeFavorite, loadFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
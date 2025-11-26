import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ASSIGNMENTS_KEY = '@assignments';

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    setAssignments: (state, action) => {
      state.items = action.payload;
    },
    addAssignment: (state, action) => {
      state.items.push({
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
        favorite: false,
      });
    },
    updateAssignment: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteAssignment: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleFavorite: (state, action) => {
      const assignment = state.items.find(item => item.id === action.payload);
      if (assignment) {
        assignment.favorite = !assignment.favorite;
      }
    },
    toggleComplete: (state, action) => {
      const assignment = state.items.find(item => item.id === action.payload);
      if (assignment) {
        assignment.completed = !assignment.completed;
      }
    },
  },
});

export const {
  setAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  toggleFavorite,
  toggleComplete,
} = assignmentsSlice.actions;

// Thunks for AsyncStorage operations
export const loadAssignments = () => async (dispatch) => {
  try {
    const assignmentsJson = await AsyncStorage.getItem(ASSIGNMENTS_KEY);
    if (assignmentsJson) {
      const assignments = JSON.parse(assignmentsJson);
      dispatch(setAssignments(assignments));
    }
  } catch (error) {
    console.error('Failed to load assignments:', error);
  }
};

export const saveAssignment = (assignment) => async (dispatch, getState) => {
  try {
    dispatch(addAssignment(assignment));
    const { assignments } = getState();
    await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments.items));
  } catch (error) {
    console.error('Failed to save assignment:', error);
  }
};

export const updateAssignmentAsync = (assignment) => async (dispatch, getState) => {
  try {
    dispatch(updateAssignment(assignment));
    const { assignments } = getState();
    await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments.items));
  } catch (error) {
    console.error('Failed to update assignment:', error);
  }
};

export const deleteAssignmentAsync = (id) => async (dispatch, getState) => {
  try {
    dispatch(deleteAssignment(id));
    const { assignments } = getState();
    await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments.items));
  } catch (error) {
    console.error('Failed to delete assignment:', error);
  }
};

export const toggleFavoriteAsync = (id) => async (dispatch, getState) => {
  try {
    dispatch(toggleFavorite(id));
    const { assignments } = getState();
    await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments.items));
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
};

export const toggleCompleteAsync = (id) => async (dispatch, getState) => {
  try {
    dispatch(toggleComplete(id));
    const { assignments } = getState();
    await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments.items));
  } catch (error) {
    console.error('Failed to toggle complete:', error);
  }
};

export default assignmentsSlice.reducer;

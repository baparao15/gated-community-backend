import { createSlice } from '@reduxjs/toolkit';

const initialDark = localStorage.getItem('community_theme') === 'dark';
if (initialDark) document.documentElement.classList.add('dark');

const uiSlice = createSlice({
  name: 'ui',
  initialState: { dark: initialDark, sidebarOpen: false, toast: null },
  reducers: {
    toggleDark(state) {
      state.dark = !state.dark;
      document.documentElement.classList.toggle('dark', state.dark);
      localStorage.setItem('community_theme', state.dark ? 'dark' : 'light');
    },
    setSidebar(state, action) { state.sidebarOpen = action.payload; },
    showToast(state, action) { state.toast = action.payload; },
    clearToast(state) { state.toast = null; },
  },
});

export const { toggleDark, setSidebar, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;

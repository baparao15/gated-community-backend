import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((item) => !item.readAt).length;
    },
    markAllRead: (state) => {
      state.items = state.items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const visitorSlice = createSlice({
  name: 'visitors',
  initialState: { items: [], currentPass: null, liveCount: 0 },
  reducers: {
    setVisitors: (state, action) => { state.items = action.payload; },
    setCurrentPass: (state, action) => { state.currentPass = action.payload; },
    setLiveCount: (state, action) => { state.liveCount = action.payload; },
  },
});

export const { setVisitors, setCurrentPass, setLiveCount } = visitorSlice.actions;
export default visitorSlice.reducer;

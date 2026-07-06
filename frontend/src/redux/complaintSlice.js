import { createSlice } from '@reduxjs/toolkit';

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: { items: [], activeComplaint: null },
  reducers: {
    setComplaints: (state, action) => { state.items = action.payload; },
    setActiveComplaint: (state, action) => { state.activeComplaint = action.payload; },
  },
});

export const { setComplaints, setActiveComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: { residents: [], units: [], selectedResident: null },
  reducers: {
    setResidents: (state, action) => { state.residents = action.payload; },
    setUnits: (state, action) => { state.units = action.payload; },
    selectResident: (state, action) => { state.selectedResident = action.payload; },
  },
});

export const { setResidents, setUnits, selectResident } = userSlice.actions;
export default userSlice.reducer;

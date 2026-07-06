import { createSlice } from '@reduxjs/toolkit';

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { invoices: [], pendingAmount: 0 },
  reducers: {
    setInvoices: (state, action) => { state.invoices = action.payload; },
    setPendingAmount: (state, action) => { state.pendingAmount = action.payload; },
  },
});

export const { setInvoices, setPendingAmount } = paymentSlice.actions;
export default paymentSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getData } from '../lib/api';

interface Transaction {
  invoice_number: string;
  transaction_type: string;
  description: string;
  total_amount: number;
  created_on: string; 
}

interface TransactionHistoryState {
  transactions: Transaction[];
  offset: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionHistoryState = {
  transactions: [],
  offset: 0,
  limit: 5, 
  hasMore: true,
  isLoading: false,
  error: null,
};

export const fetchTransactionHistory = createAsyncThunk(
  'transactionHistory/fetchTransactionHistory',
  async (
    { offset, limit, month }: { offset: number; limit: number; month?: number },
    { rejectWithValue }
  ) => {
    try {
      const queryParams: { offset: number; limit: number; month?: number } = { offset, limit };
      if (month !== undefined) {
        queryParams.month = month;
      }

      
      const response = await getData<any>('/transaction/history', queryParams);

      if (response.status === 0 && response.data && Array.isArray(response.data.records)) {
        return {
          records: response.data.records,
          offset: parseInt(response.data.offset, 10),
          limit: parseInt(response.data.limit, 10),
        };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch transactions: Invalid response structure');
      }
    } catch (error: any) {
      console.error("Error fetching transaction history:", error);
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

const transactionHistorySlice = createSlice({
  name: 'transactionHistory',
  initialState,
  reducers: {
    resetHistoryState: (state) => {
      state.transactions = [];
      state.offset = 0; 
      state.hasMore = true;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action: PayloadAction<{ records: Transaction[], offset: number, limit: number }>) => {
        state.isLoading = false;
        const { records, limit: responseLimit } = action.payload; 

        state.transactions = [...state.transactions, ...records];

        
        state.offset += records.length;

        
        
        state.hasMore = records.length === responseLimit; 
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Unknown error occurred';
        state.hasMore = false;
      });
  },
});

export const { resetHistoryState } = transactionHistorySlice.actions;
export default transactionHistorySlice.reducer;
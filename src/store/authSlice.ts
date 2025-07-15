
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null; 
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('userToken') : null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      state.error = null; 
    },
    setAuthSuccess(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('userToken', action.payload);
      }
    },
    
    setAuthError(state, action: PayloadAction<string | null>) { 
      state.token = null;
      state.isLoading = false;
      state.error = action.payload;
      if (typeof window !== 'undefined' && action.payload === null) {
          
          localStorage.removeItem('userToken');
      } else if (typeof window !== 'undefined' && action.payload !== null) {
          
          localStorage.removeItem('userToken');
      }
    },
    logout(state) {
      state.token = null;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userToken');
      }
    },
  },
});

export const { setLoading, setAuthSuccess, setAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
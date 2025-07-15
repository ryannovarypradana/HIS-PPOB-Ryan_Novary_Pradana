
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import dashboardReducer from "./dashboardSlice";
import transactionHistoryReducer from "./transactionHistorySlice";
import profileReducer from "./profileSlice"
import paymentReducer from "./paymentSlice"





export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    transactionHistory: transactionHistoryReducer,
    profile: profileReducer,
    payment: paymentReducer,
    
  },
  
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
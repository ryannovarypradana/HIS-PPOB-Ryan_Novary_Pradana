
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getData, postData } from '../lib/api';
import { ApiResponse } from '../types/api';


export interface Service { 
  service_code: string;
  service_name: string;
  service_icon: string; 
  service_tariff: number; 
}

interface PaymentState {
  services: Service[];
  selectedService: Service | null;
  loading: {
    fetchServices: boolean;
    performPayment: boolean;
  };
  error: {
    fetchServices: string | null;
    performPayment: string | null;
  };
}

const initialState: PaymentState = {
  services: [],
  selectedService: null,
  loading: {
    fetchServices: false,
    performPayment: false,
  },
  error: {
    fetchServices: null,
    performPayment: null,
  },
};


export const fetchServicesForPayment = createAsyncThunk(
  'payment/fetchServicesForPayment',
  async (_, { rejectWithValue }) => {
    try {
      
      const response = await getData<Service[]>('/services');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const performPayment = createAsyncThunk(
  'payment/performPayment',
  async (paymentData: { service_code: string; service_amount: number }, { dispatch, rejectWithValue }) => {
    try {
      
      const response = await postData<{ balance: number }>('/transaction', paymentData);
      
      
      
      
      
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setSelectedService: (state, action: PayloadAction<Service | null>) => {
      state.selectedService = action.payload;
    },
    resetPaymentState: (state) => {
      state.services = [];
      state.selectedService = null;
      state.loading = { fetchServices: false, performPayment: false };
      state.error = { fetchServices: null, performPayment: null };
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchServicesForPayment.pending, (state) => {
        state.loading.fetchServices = true;
        state.error.fetchServices = null;
      })
      .addCase(fetchServicesForPayment.fulfilled, (state, action: PayloadAction<Service[] | undefined>) => {
        state.loading.fetchServices = false;
        state.services = action.payload || [];
      })
      .addCase(fetchServicesForPayment.rejected, (state, action) => {
        state.loading.fetchServices = false;
        state.error.fetchServices = action.payload as string;
        state.services = [];
      })
      
      .addCase(performPayment.pending, (state) => {
        state.loading.performPayment = true;
        state.error.performPayment = null;
      })
      .addCase(performPayment.fulfilled, (state) => {
        state.loading.performPayment = false;
        state.error.performPayment = null;
        
      })
      .addCase(performPayment.rejected, (state, action) => {
        state.loading.performPayment = false;
        state.error.performPayment = action.payload as string;
      });
  },
});

export const { setSelectedService, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;

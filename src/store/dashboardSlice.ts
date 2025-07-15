
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postData, getData } from '../lib/api'; 
import { ApiResponse } from '../types/api'; 


interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string; 
}

interface Balance {
  balance: number;
}

interface Service {
  service_code: string;
  service_name: string;
  service_icon: string; 
  service_tariff: number; 
}

interface Banner {
  banner_name: string;
  banner_image: string; 
  description: string;
}

interface DashboardState {
  userProfile: UserProfile | null | undefined;
  balance: Balance | null | undefined;
  services: Service[];
  banners: Banner[];
  loading: {
    profile: boolean;
    balance: boolean;
    services: boolean;
    banners: boolean;
    topup: boolean; 
  };
  error: {
    profile: string | null;
    balance: string | null;
    services: string | null;
    banners: string | null;
    topup: string | null; 
  };
}

const initialState: DashboardState = {
  userProfile: null,
  balance: null,
  services: [],
  banners: [],
  loading: {
    profile: false,
    balance: false,
    services: false,
    banners: false,
    topup: false,
  },
  error: {
    profile: null,
    balance: null,
    services: null,
    banners: null,
    topup: null,
  },
};


export const fetchUserProfile = createAsyncThunk(
  'dashboard/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getData<UserProfile>('/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBalance = createAsyncThunk(
  'dashboard/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getData<Balance>('/balance');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchServices = createAsyncThunk(
  'dashboard/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getData<Service[]>('/services');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBanners = createAsyncThunk(
  'dashboard/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getData<Banner[]>('/banner');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const performTopUp = createAsyncThunk(
  'dashboard/performTopUp',
  async (amount: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await postData<{ balance: number }>('/topup', { top_up_amount: amount });
      
      if (response.status === 0 && response.data?.balance !== undefined) {
        dispatch(setBalance(response.data.balance)); 
      }
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setBalance(state, action: PayloadAction<number>) {
      if (state.balance) {
        state.balance.balance = action.payload;
      } else {
        state.balance = { balance: action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading.profile = true;
        state.error.profile = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile | undefined>) => {
        state.loading.profile = false;
        state.userProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error.profile = action.payload as string;
        state.userProfile = null;
      })
      
      .addCase(fetchBalance.pending, (state) => {
        state.loading.balance = true;
        state.error.balance = null;
      })
      .addCase(fetchBalance.fulfilled, (state, action: PayloadAction<Balance | undefined>) => {
        state.loading.balance = false;
        state.balance = action.payload;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.loading.balance = false;
        state.error.balance = action.payload as string;
        state.balance = null;
      })
      
      .addCase(fetchServices.pending, (state) => {
        state.loading.services = true;
        state.error.services = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Service[] | undefined>) => {
        state.loading.services = false;
        state.services = action.payload || [];
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading.services = false;
        state.error.services = action.payload as string;
        state.services = [];
      })
      
      .addCase(fetchBanners.pending, (state) => {
        state.loading.banners = true;
        state.error.banners = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<Banner[] | undefined>) => {
        state.loading.banners = false;
        state.banners = action.payload || [];
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading.banners = false;
        state.error.banners = action.payload as string;
        state.banners = [];
      })
      
      .addCase(performTopUp.pending, (state) => {
        state.loading.topup = true;
        state.error.topup = null;
      })
      .addCase(performTopUp.fulfilled, (state) => {
        state.loading.topup = false;
        state.error.topup = null; 
        
      })
      .addCase(performTopUp.rejected, (state, action) => {
        state.loading.topup = false;
        state.error.topup = action.payload as string;
      });
  },
});

export const { setBalance } = dashboardSlice.actions;
export default dashboardSlice.reducer;
